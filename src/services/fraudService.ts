// STEP 1.5 - Fraud & Anomaly Detection Engine
// Rule-based + ML-simulated fraud detection

import {
  AssetSubmission,
  FraudAnalysis,
  FraudAnomaly,
  RuleBasedDetection,
  MLBasedDetection,
  PatternDetection,
  ABMAnalysis,
  RiskLevel
} from '../models/abmTypes';
import { OracleVerificationResult } from './oracleService';

// =====================
// RULE-BASED DETECTION
// =====================

interface FraudRule {
  id: string;
  name: string;
  check: (
    submission: AssetSubmission,
    oracle: OracleVerificationResult,
    abm: ABMAnalysis
  ) => FraudAnomaly | null;
}

const FRAUD_RULES: FraudRule[] = [
  // Rule 1: Yield significantly above market
  {
    id: 'YIELD_ANOMALY',
    name: 'Abnormal Yield Claim',
    check: (submission, oracle, abm) => {
      const claimedYield = submission.financials.expectedYield;
      const marketYield = abm.yield.marketMedianYield;
      const threshold = marketYield * 1.5; // 50% above market
      
      if (claimedYield > threshold) {
        return {
          type: 'yield_anomaly',
          severity: claimedYield > marketYield * 2 ? 'critical' : 'high',
          detail: `Claimed yield ${claimedYield}% is ${Math.round((claimedYield/marketYield - 1) * 100)}% above market median ${marketYield}%`,
          score: Math.min(0.4, (claimedYield / marketYield - 1) * 0.3),
          evidence: [
            `Market median yield: ${marketYield}%`,
            `Claimed yield: ${claimedYield}%`,
            `Comparables range: ${abm.yield.minYield}% - ${abm.yield.maxYield}%`
          ]
        };
      }
      return null;
    }
  },
  
  // Rule 2: Size mismatch between claimed and verified
  {
    id: 'SIZE_MISMATCH',
    name: 'Size Discrepancy',
    check: (submission, oracle, abm) => {
      const claimedSize = submission.specifications.size;
      const satelliteSize = oracle.existence.satellite.estimatedSize;
      const registrySize = oracle.existence.registry.registeredSize;
      
      const verifiedSize = satelliteSize > 0 ? satelliteSize : registrySize;
      if (verifiedSize === 0) return null;
      
      const discrepancy = Math.abs(claimedSize - verifiedSize) / Math.max(claimedSize, verifiedSize);
      
      if (discrepancy > 0.25) { // >25% difference
        return {
          type: 'size_mismatch',
          severity: discrepancy > 0.5 ? 'critical' : 'high',
          detail: `Claimed size ${claimedSize} sq ft differs from verified ${Math.round(verifiedSize)} sq ft by ${Math.round(discrepancy * 100)}%`,
          score: Math.min(0.35, discrepancy * 0.5),
          evidence: [
            `Claimed: ${claimedSize} sq ft`,
            `Satellite estimate: ${satelliteSize} sq ft`,
            `Registry record: ${registrySize} sq ft`
          ]
        };
      }
      return null;
    }
  },
  
  // Rule 3: NAV significantly higher than market
  {
    id: 'NAV_INFLATION',
    name: 'Inflated Valuation',
    check: (submission, oracle, abm) => {
      const ratio = abm.nav.claimedVsCalculated;
      
      if (ratio > 1.3) { // >30% above calculated NAV
        return {
          type: 'nav_inflation',
          severity: ratio > 1.5 ? 'critical' : 'high',
          detail: `Claimed value ₹${submission.claimedValue.toLocaleString()} is ${Math.round((ratio - 1) * 100)}% above calculated NAV ₹${abm.nav.meanNAV.toLocaleString()}`,
          score: Math.min(0.4, (ratio - 1) * 0.4),
          evidence: [
            `Claimed value: ₹${submission.claimedValue.toLocaleString()}`,
            `Calculated NAV: ₹${abm.nav.meanNAV.toLocaleString()}`,
            `NAV range: ₹${abm.nav.minNAV.toLocaleString()} - ₹${abm.nav.maxNAV.toLocaleString()}`
          ]
        };
      }
      return null;
    }
  },
  
  // Rule 4: Cash flow inconsistency
  {
    id: 'CASHFLOW_INCONSISTENCY',
    name: 'Cash Flow Anomaly',
    check: (submission, oracle, abm) => {
      const annualRent = submission.financials.currentRent * 12;
      const expenses = submission.financials.annualExpenses;
      const impliedCF = annualRent * (submission.financials.occupancyRate / 100) - expenses;
      
      // Compare with ABM simulated CF
      const simulatedCF = abm.cashFlowSimulation.meanAnnualCF[0];
      const discrepancy = Math.abs(impliedCF - simulatedCF) / Math.max(Math.abs(impliedCF), Math.abs(simulatedCF));
      
      if (discrepancy > 0.4) { // >40% difference
        return {
          type: 'cashflow_inconsistency',
          severity: discrepancy > 0.6 ? 'high' : 'medium',
          detail: `Claimed cash flow ₹${Math.round(impliedCF).toLocaleString()} differs from market expectation by ${Math.round(discrepancy * 100)}%`,
          score: Math.min(0.25, discrepancy * 0.3),
          evidence: [
            `Claimed annual rent: ₹${annualRent.toLocaleString()}`,
            `Occupancy: ${submission.financials.occupancyRate}%`,
            `Simulated Year 1 CF: ₹${simulatedCF.toLocaleString()}`
          ]
        };
      }
      return null;
    }
  },
  
  // Rule 5: Image authenticity issues
  {
    id: 'IMAGE_AUTHENTICITY',
    name: 'Suspicious Images',
    check: (submission, oracle, abm) => {
      const authenticity = oracle.existence.vision.authenticityScore;
      
      if (authenticity < 0.7) {
        return {
          type: 'suspicious_images',
          severity: authenticity < 0.5 ? 'critical' : 'high',
          detail: `Image authenticity score ${Math.round(authenticity * 100)}% indicates potential manipulation`,
          score: Math.min(0.5, (1 - authenticity) * 0.6),
          evidence: [
            `Authenticity score: ${Math.round(authenticity * 100)}%`,
            `Images analyzed: ${submission.imageUrls.length}`
          ]
        };
      }
      return null;
    }
  },
  
  // Rule 6: Low ownership probability with high value
  {
    id: 'OWNERSHIP_VALUE_MISMATCH',
    name: 'Ownership Risk',
    check: (submission, oracle, abm) => {
      const ownershipProb = oracle.ownership.aggregatedProbability;
      const value = submission.claimedValue;
      
      // High-value assets need stronger ownership proof
      const valueThreshold = value > 50000000 ? 0.85 : 0.75; // 5 Cr+ needs higher proof
      
      if (ownershipProb < valueThreshold && value > 10000000) {
        return {
          type: 'ownership_risk',
          severity: ownershipProb < 0.6 ? 'high' : 'medium',
          detail: `Ownership probability ${Math.round(ownershipProb * 100)}% is insufficient for asset valued at ₹${value.toLocaleString()}`,
          score: Math.min(0.3, (valueThreshold - ownershipProb) * 0.5),
          evidence: [
            `Ownership probability: ${Math.round(ownershipProb * 100)}%`,
            `DID verification: ${oracle.ownership.didVerification.verificationLevel}`,
            `Registry match: ${Math.round(oracle.ownership.registryOwnership.ownerNameSimilarity * 100)}%`
          ]
        };
      }
      return null;
    }
  },
  
  // Rule 7: Registry record not found
  {
    id: 'NO_REGISTRY_RECORD',
    name: 'Missing Registry',
    check: (submission, oracle, abm) => {
      if (!oracle.existence.registry.recordFound) {
        return {
          type: 'no_registry',
          severity: 'high',
          detail: 'No matching record found in property registry databases',
          score: 0.35,
          evidence: [
            `Registry IDs checked: ${submission.registryIds.join(', ')}`,
            `Source: ${oracle.existence.registry.source}`
          ]
        };
      }
      return null;
    }
  },
  
  // Rule 8: Activity signals don't match claims
  {
    id: 'ACTIVITY_MISMATCH',
    name: 'Activity Inconsistency',
    check: (submission, oracle, abm) => {
      const claimedOccupancy = submission.financials.occupancyRate / 100;
      const activityScore = oracle.activityScore;
      
      // If claiming high occupancy but low activity signals
      if (claimedOccupancy > 0.8 && activityScore < 0.5) {
        return {
          type: 'activity_mismatch',
          severity: 'medium',
          detail: `Claimed occupancy ${submission.financials.occupancyRate}% inconsistent with activity score ${Math.round(activityScore * 100)}%`,
          score: 0.2,
          evidence: [
            `Utility active: ${oracle.existence.activity.utilityActive}`,
            `Tax current: ${oracle.existence.activity.taxPaymentsCurrent}`,
            `Occupancy indicators: ${Math.round(oracle.existence.activity.occupancyIndicators * 100)}%`
          ]
        };
      }
      return null;
    }
  },
  
  // Rule 9: SPV structure anomalies
  {
    id: 'SPV_ANOMALY',
    name: 'SPV Structure Issues',
    check: (submission, oracle, abm) => {
      const spv = submission.spv;
      const anomalies: string[] = [];
      
      // Check incorporation date (too recent?)
      const incDate = new Date(spv.incorporationDate);
      const daysSinceInc = (Date.now() - incDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceInc < 30) {
        anomalies.push('SPV incorporated less than 30 days ago');
      }
      
      // Check shareholder concentration
      const maxShareholding = Math.max(...spv.shareholderStructure.map(s => s.percentage));
      if (maxShareholding < 51) {
        anomalies.push('No majority shareholder (fragmented ownership)');
      }
      
      // Check directors
      if (spv.directors.length < 2) {
        anomalies.push('Single director structure');
      }
      
      if (anomalies.length > 0) {
        return {
          type: 'spv_anomaly',
          severity: anomalies.length > 1 ? 'medium' : 'low',
          detail: `SPV structure concerns: ${anomalies.join('; ')}`,
          score: anomalies.length * 0.08,
          evidence: anomalies
        };
      }
      return null;
    }
  },
  
  // Rule 10: Historical fraud indicators
  {
    id: 'HISTORICAL_FLAGS',
    name: 'Prior Fraud Flags',
    check: (submission, oracle, abm) => {
      const historical = oracle.existence.historical;
      
      if (historical.priorFraudFlags > 0) {
        return {
          type: 'historical_fraud',
          severity: historical.priorFraudFlags > 1 ? 'critical' : 'high',
          detail: `${historical.priorFraudFlags} prior fraud flag(s) associated with this wallet/submitter`,
          score: historical.priorFraudFlags * 0.25,
          evidence: [
            `Prior submissions: ${historical.priorSubmissions}`,
            `Fraud flags: ${historical.priorFraudFlags}`,
            `Reputation score: ${Math.round(historical.reputationScore * 100)}%`
          ]
        };
      }
      return null;
    }
  }
];

function runRuleBasedDetection(
  submission: AssetSubmission,
  oracle: OracleVerificationResult,
  abm: ABMAnalysis
): RuleBasedDetection {
  const anomalies: FraudAnomaly[] = [];
  const rulesTriggered: string[] = [];
  
  for (const rule of FRAUD_RULES) {
    const result = rule.check(submission, oracle, abm);
    if (result) {
      anomalies.push(result);
      rulesTriggered.push(rule.id);
    }
  }
  
  const totalScore = anomalies.reduce((sum, a) => sum + a.score, 0);
  
  return {
    anomalies,
    rulesTriggered,
    totalScore: Math.min(1, totalScore)
  };
}

// =====================
// ML-BASED DETECTION
// =====================

function extractFeatures(
  submission: AssetSubmission,
  oracle: OracleVerificationResult,
  abm: ABMAnalysis
): number[] {
  // Extract numerical features for ML models
  return [
    // Oracle features
    oracle.existence.aggregatedScore,
    oracle.ownership.aggregatedProbability,
    oracle.activityScore,
    oracle.existence.satellite.confidence,
    oracle.existence.registry.ownerNameMatch,
    oracle.existence.vision.authenticityScore,
    oracle.existence.historical.reputationScore,
    
    // ABM features (normalized)
    abm.nav.claimedVsCalculated,
    abm.yield.sustainabilityScore,
    abm.yield.yieldSpread / 10, // Normalize
    abm.cashFlowSimulation.probabilityPositiveCF,
    abm.riskSimulation.tailRiskScore,
    abm.overallRiskScore / 100,
    abm.investabilityScore / 100,
    abm.marketFitScore / 100,
    
    // Submission features (normalized)
    submission.specifications.size / 10000,
    submission.financials.expectedYield / 20,
    submission.financials.occupancyRate / 100,
    submission.claimedValue / 100000000, // per 10 Cr
    submission.imageUrls.length / 10,
    submission.documentUrls.length / 5
  ];
}

function isolationForestScore(features: number[]): number {
  // Simulate Isolation Forest anomaly detection
  // In production: Use actual sklearn IsolationForest via Python service
  
  // Simple simulation: Check for outliers in feature space
  const mean = features.reduce((a, b) => a + b, 0) / features.length;
  const variance = features.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / features.length;
  const std = Math.sqrt(variance);
  
  // Count features that are outliers (> 2 std from mean)
  const outlierCount = features.filter(f => Math.abs(f - mean) > 2 * std).length;
  
  // Anomaly score: proportion of outlier features + some randomness for realism
  const baseScore = outlierCount / features.length;
  const score = baseScore * 0.7 + Math.random() * 0.3 * baseScore;
  
  return Math.min(1, score);
}

function xgboostFraudProbability(features: number[]): number {
  // Simulate XGBoost fraud probability prediction
  // In production: Use actual XGBoost model via Python service
  
  // Key fraud indicators from features
  const navRatio = features[7];           // claimedVsCalculated
  const yieldSustainability = features[8]; // sustainabilityScore
  const authenticity = features[5];        // authenticityScore
  const ownershipProb = features[1];       // ownership probability
  const reputation = features[6];          // reputation score
  
  // Weighted fraud probability
  let fraudProb = 0;
  
  // NAV inflation is strong fraud signal
  if (navRatio > 1.3) fraudProb += (navRatio - 1) * 0.3;
  
  // Low yield sustainability
  if (yieldSustainability < 0.5) fraudProb += (1 - yieldSustainability) * 0.2;
  
  // Low image authenticity
  if (authenticity < 0.8) fraudProb += (1 - authenticity) * 0.25;
  
  // Low ownership probability
  if (ownershipProb < 0.7) fraudProb += (1 - ownershipProb) * 0.15;
  
  // Low reputation
  if (reputation < 0.5) fraudProb += (1 - reputation) * 0.1;
  
  // Add some variance
  fraudProb *= (0.8 + Math.random() * 0.4);
  
  return Math.min(1, fraudProb);
}

function runMLBasedDetection(
  submission: AssetSubmission,
  oracle: OracleVerificationResult,
  abm: ABMAnalysis
): MLBasedDetection {
  const features = extractFeatures(submission, oracle, abm);
  
  const isoScore = isolationForestScore(features);
  const xgbProb = xgboostFraudProbability(features);
  
  const anomalies: FraudAnomaly[] = [];
  
  // Isolation Forest anomaly
  if (isoScore > 0.3) {
    anomalies.push({
      type: 'ml_outlier',
      severity: isoScore > 0.6 ? 'high' : 'medium',
      detail: `Asset features are statistically unusual (isolation score: ${Math.round(isoScore * 100)}%)`,
      score: isoScore * 0.2,
      evidence: ['Multivariate anomaly detection triggered']
    });
  }
  
  // XGBoost high fraud probability
  if (xgbProb > 0.4) {
    anomalies.push({
      type: 'ml_fraud_prediction',
      severity: xgbProb > 0.7 ? 'critical' : xgbProb > 0.5 ? 'high' : 'medium',
      detail: `ML model predicts ${Math.round(xgbProb * 100)}% fraud probability`,
      score: xgbProb * 0.3,
      evidence: ['Gradient boosting fraud classifier triggered']
    });
  }
  
  // Feature importance (simulated top features)
  const featureImportance = [
    { feature: 'nav_ratio', importance: 0.25 },
    { feature: 'ownership_probability', importance: 0.18 },
    { feature: 'image_authenticity', importance: 0.15 },
    { feature: 'yield_sustainability', importance: 0.12 },
    { feature: 'reputation_score', importance: 0.10 },
    { feature: 'activity_score', importance: 0.08 },
    { feature: 'existence_score', importance: 0.07 },
    { feature: 'risk_score', importance: 0.05 }
  ];
  
  return {
    isolationForestScore: Math.round(isoScore * 100) / 100,
    xgboostFraudProb: Math.round(xgbProb * 100) / 100,
    anomalies,
    featureImportance
  };
}

// =====================
// PATTERN DETECTION
// =====================

function runPatternDetection(
  submission: AssetSubmission,
  oracle: OracleVerificationResult
): PatternDetection {
  const anomalies: FraudAnomaly[] = [];
  
  // Check for duplicate submissions (simulated)
  // In production: Query database for similar assets
  const duplicateSubmissions = Math.random() > 0.95; // 5% chance
  
  // Check for linked fraudulent accounts
  const linkedFraudulentAccounts = oracle.existence.historical.priorFraudFlags > 0;
  
  // Suspicious timing (multiple submissions in short period)
  const suspiciousTimingPatterns = Math.random() > 0.92; // 8% chance
  
  if (duplicateSubmissions) {
    anomalies.push({
      type: 'duplicate_submission',
      severity: 'critical',
      detail: 'Potential duplicate or recycled asset submission detected',
      score: 0.4,
      evidence: ['Asset fingerprint matches previous submission']
    });
  }
  
  if (linkedFraudulentAccounts) {
    anomalies.push({
      type: 'linked_fraud',
      severity: 'high',
      detail: 'Wallet address linked to accounts with prior fraud history',
      score: 0.3,
      evidence: [`Prior fraud flags: ${oracle.existence.historical.priorFraudFlags}`]
    });
  }
  
  if (suspiciousTimingPatterns) {
    anomalies.push({
      type: 'suspicious_timing',
      severity: 'medium',
      detail: 'Multiple high-value submissions in short timeframe',
      score: 0.15,
      evidence: ['3+ submissions in last 24 hours']
    });
  }
  
  return {
    duplicateSubmissions,
    linkedFraudulentAccounts,
    suspiciousTimingPatterns,
    anomalies
  };
}

// =====================
// AGGREGATE FRAUD ANALYSIS
// =====================

function determineRiskLevel(fraudLikelihood: number): RiskLevel {
  if (fraudLikelihood > 70) return 'critical';
  if (fraudLikelihood > 40) return 'high';
  if (fraudLikelihood > 20) return 'medium';
  return 'low';
}

export async function runFraudDetection(
  submission: AssetSubmission,
  oracle: OracleVerificationResult,
  abm: ABMAnalysis
): Promise<FraudAnalysis> {
  // Run all detection methods
  const ruleBased = runRuleBasedDetection(submission, oracle, abm);
  const mlBased = runMLBasedDetection(submission, oracle, abm);
  const patterns = runPatternDetection(submission, oracle);
  
  // Aggregate all anomaly scores
  const allAnomalies = [
    ...ruleBased.anomalies,
    ...mlBased.anomalies,
    ...patterns.anomalies
  ];
  
  // Calculate fraud likelihood (0-100%)
  const totalScore = allAnomalies.reduce((sum, a) => sum + a.score, 0);
  
  // Scale to percentage with diminishing returns for multiple anomalies
  // This prevents one-off anomalies from causing rejection but accumulates risk
  const fraudLikelihood = Math.min(100, totalScore * 50 * (1 + Math.log10(1 + allAnomalies.length) * 0.3));
  
  const riskLevel = determineRiskLevel(fraudLikelihood);
  const passed = fraudLikelihood <= 5; // Must be <= 5% for eligibility
  
  return {
    ruleBased,
    mlBased,
    patterns,
    fraudLikelihood: Math.round(fraudLikelihood * 100) / 100,
    anomalyScore: allAnomalies.length,
    riskLevel,
    passed,
    timestamp: new Date()
  };
}
