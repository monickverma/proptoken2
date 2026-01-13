// STEP 1.6 - Consensus Scoring Engine
// Deterministic eligibility decision based on all signals

import {
  AssetSubmission,
  ConsensusScore,
  ConsensusThresholds,
  ConsensusRuleResult,
  ABMAnalysis,
  FraudAnalysis
} from '../models/abmTypes';
import { OracleVerificationResult } from './oracleService';

// =====================
// DEFAULT THRESHOLDS
// =====================

export const DEFAULT_THRESHOLDS: ConsensusThresholds = {
  minExistence: 0.90,   // Asset must exist with 90%+ confidence
  minOwnership: 0.80,   // Ownership probability >= 80%
  minActivity: 0.60,    // Activity signals >= 60%
  maxFraud: 5.0,        // Fraud likelihood <= 5%
  maxRisk: 70           // ABM risk score <= 70
};

// =====================
// CONSENSUS RULES
// =====================

interface ConsensusInput {
  submission: AssetSubmission;
  oracle: OracleVerificationResult;
  abm: ABMAnalysis;
  fraud: FraudAnalysis;
}

function evaluateRules(
  input: ConsensusInput,
  thresholds: ConsensusThresholds
): ConsensusRuleResult[] {
  const { oracle, abm, fraud } = input;
  
  return [
    // Rule 1: Existence Score
    {
      rule: 'existence',
      threshold: thresholds.minExistence,
      actualValue: oracle.existence.aggregatedScore,
      passed: oracle.existence.aggregatedScore >= thresholds.minExistence
    },
    
    // Rule 2: Ownership Probability
    {
      rule: 'ownership',
      threshold: thresholds.minOwnership,
      actualValue: oracle.ownership.aggregatedProbability,
      passed: oracle.ownership.aggregatedProbability >= thresholds.minOwnership
    },
    
    // Rule 3: Activity Score
    {
      rule: 'activity',
      threshold: thresholds.minActivity,
      actualValue: oracle.activityScore,
      passed: oracle.activityScore >= thresholds.minActivity
    },
    
    // Rule 4: Fraud Likelihood
    {
      rule: 'fraud',
      threshold: thresholds.maxFraud,
      actualValue: fraud.fraudLikelihood,
      passed: fraud.fraudLikelihood <= thresholds.maxFraud
    },
    
    // Rule 5: Risk Score
    {
      rule: 'risk',
      threshold: thresholds.maxRisk,
      actualValue: abm.overallRiskScore,
      passed: abm.overallRiskScore <= thresholds.maxRisk
    }
  ];
}

// =====================
// REJECTION REASON GENERATOR
// =====================

function generateRejectionReason(rules: ConsensusRuleResult[]): string | null {
  const failedRules = rules.filter(r => !r.passed);
  
  if (failedRules.length === 0) return null;
  
  const reasonMap: Record<string, (r: ConsensusRuleResult) => string> = {
    'existence': (r) => 
      `Existence verification failed: ${(r.actualValue * 100).toFixed(1)}% < ${(r.threshold * 100).toFixed(0)}% required`,
    'ownership': (r) => 
      `Ownership probability insufficient: ${(r.actualValue * 100).toFixed(1)}% < ${(r.threshold * 100).toFixed(0)}% required`,
    'activity': (r) => 
      `Activity signals weak: ${(r.actualValue * 100).toFixed(1)}% < ${(r.threshold * 100).toFixed(0)}% required`,
    'fraud': (r) => 
      `Fraud likelihood too high: ${r.actualValue.toFixed(2)}% > ${r.threshold.toFixed(0)}% maximum`,
    'risk': (r) => 
      `Risk score exceeded: ${r.actualValue.toFixed(1)} > ${r.threshold.toFixed(0)} maximum`
  };
  
  const reasons = failedRules.map(r => reasonMap[r.rule]?.(r) || `${r.rule} check failed`);
  
  return reasons.join('; ');
}

// =====================
// CONFIDENCE CALCULATION
// =====================

function calculateConfidence(
  rules: ConsensusRuleResult[],
  input: ConsensusInput
): number {
  const { oracle, abm, fraud } = input;
  
  // Base confidence from rule margins
  let ruleConfidence = 0;
  rules.forEach(rule => {
    if (rule.passed) {
      // How much margin do we have?
      let margin: number;
      if (rule.rule === 'fraud' || rule.rule === 'risk') {
        // Lower is better for these
        margin = (rule.threshold - rule.actualValue) / rule.threshold;
      } else {
        // Higher is better for these
        margin = (rule.actualValue - rule.threshold) / (1 - rule.threshold);
      }
      ruleConfidence += Math.max(0, Math.min(1, margin)) / rules.length;
    }
  });
  
  // Factor in data quality confidence
  const dataConfidence = (
    oracle.existence.confidence * 0.3 +
    oracle.ownership.confidence * 0.2 +
    abm.confidence * 0.3 +
    (1 - fraud.fraudLikelihood / 100) * 0.2
  );
  
  // Combined confidence
  const allPassed = rules.every(r => r.passed);
  const baseConfidence = allPassed ? 0.7 : 0.3;
  
  return Math.min(0.99, baseConfidence + ruleConfidence * 0.2 + dataConfidence * 0.1);
}

// =====================
// MAIN CONSENSUS ENGINE
// =====================

export function calculateConsensus(
  input: ConsensusInput,
  thresholds: ConsensusThresholds = DEFAULT_THRESHOLDS
): ConsensusScore {
  const { submission, oracle, abm, fraud } = input;
  
  // Evaluate all rules
  const rules = evaluateRules(input, thresholds);
  
  // Check if all rules passed
  const allRulesPassed = rules.every(r => r.passed);
  
  // Generate rejection reason if any rule failed
  const rejectionReason = generateRejectionReason(rules);
  
  // Calculate confidence in the decision
  const confidence = calculateConfidence(rules, input);
  
  return {
    submissionId: submission.id,
    
    // Input scores (for transparency)
    existenceScore: oracle.existence.aggregatedScore,
    ownershipProbability: oracle.ownership.aggregatedProbability,
    activityScore: oracle.activityScore,
    fraudLikelihood: fraud.fraudLikelihood,
    riskScore: abm.overallRiskScore,
    
    // Rule results
    rules,
    allRulesPassed,
    
    // Final decision
    eligible: allRulesPassed,
    confidence,
    rejectionReason,
    
    timestamp: new Date()
  };
}

// =====================
// BATCH CONSENSUS (for multiple submissions)
// =====================

export function calculateBatchConsensus(
  inputs: ConsensusInput[],
  thresholds: ConsensusThresholds = DEFAULT_THRESHOLDS
): ConsensusScore[] {
  return inputs.map(input => calculateConsensus(input, thresholds));
}

// =====================
// CONSENSUS SUMMARY
// =====================

export interface ConsensusSummary {
  totalProcessed: number;
  eligible: number;
  rejected: number;
  eligibilityRate: number;
  commonRejectionReasons: { reason: string; count: number }[];
  averageConfidence: number;
}

export function generateConsensusSummary(scores: ConsensusScore[]): ConsensusSummary {
  const eligible = scores.filter(s => s.eligible);
  const rejected = scores.filter(s => !s.eligible);
  
  // Count rejection reasons
  const reasonCounts: Record<string, number> = {};
  rejected.forEach(s => {
    s.rules.filter(r => !r.passed).forEach(r => {
      reasonCounts[r.rule] = (reasonCounts[r.rule] || 0) + 1;
    });
  });
  
  const commonRejectionReasons = Object.entries(reasonCounts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
  
  return {
    totalProcessed: scores.length,
    eligible: eligible.length,
    rejected: rejected.length,
    eligibilityRate: scores.length > 0 ? eligible.length / scores.length : 0,
    commonRejectionReasons,
    averageConfidence: scores.length > 0
      ? scores.reduce((sum, s) => sum + s.confidence, 0) / scores.length
      : 0
  };
}
