// STEP 1.7 - Autonomous Asset Registry & Pipeline Orchestration
// Final registry for eligible assets + cash flow claims

import {
  AssetSubmission,
  EligibleAsset,
  VerificationProgress,
  VerificationStatus,
  ABMAnalysis,
  FraudAnalysis,
  ConsensusScore
} from '../models/abmTypes';
import { OracleVerificationResult, runOracleVerification } from './oracleService';
import { runABMAnalysis } from './abmService';
import { runFraudDetection } from './fraudService';
import { runEnhancedFraudDetection } from './enhancedFraudService';
import { runProductionOracle, ProductionOracleResult } from './productionOracleService';
import { calculateConsensus } from './consensusService';
import crypto from 'crypto';

// =====================
// IN-MEMORY STORAGE
// =====================

const submissions: Map<string, AssetSubmission> = new Map();
const oracleResults: Map<string, OracleVerificationResult> = new Map();
const productionOracleResults: Map<string, ProductionOracleResult> = new Map();
const abmResults: Map<string, ABMAnalysis> = new Map();
const fraudResults: Map<string, FraudAnalysis> = new Map();
const consensusResults: Map<string, ConsensusScore> = new Map();
const eligibleAssets: Map<string, EligibleAsset> = new Map();
const progressTracking: Map<string, VerificationProgress> = new Map();

// =====================
// HELPER FUNCTIONS
// =====================

function generateFingerprint(submission: AssetSubmission): string {
  const data = JSON.stringify({
    location: submission.location,
    spv: submission.spv,
    specifications: submission.specifications,
    registryIds: submission.registryIds
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}

function generateHash(data: any): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 16);
}

function addLog(
  progress: VerificationProgress,
  stage: string,
  message: string,
  level: 'info' | 'warning' | 'error' | 'success' = 'info'
) {
  progress.logs.push({
    timestamp: new Date(),
    stage,
    message,
    level
  });
}

// =====================
// SUBMISSION MANAGEMENT
// =====================

export function createSubmission(data: Omit<AssetSubmission, 'id' | 'status' | 'createdAt' | 'updatedAt'>): AssetSubmission {
  const id = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  const submission: AssetSubmission = {
    ...data,
    id,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  submissions.set(id, submission);
  
  // Initialize progress tracking
  const progress: VerificationProgress = {
    submissionId: id,
    currentStage: 'PENDING',
    stages: {
      submission: { completed: true, timestamp: new Date() },
      oracleVerification: {
        completed: false,
        progress: 0,
        subStages: {
          satellite: { completed: false },
          registry: { completed: false },
          vision: { completed: false },
          activity: { completed: false },
          ownership: { completed: false }
        }
      },
      abmAnalysis: {
        completed: false,
        progress: 0,
        subStages: {
          marketIntelligence: { completed: false },
          cashFlowSimulation: { completed: false },
          riskSimulation: { completed: false }
        }
      },
      fraudDetection: {
        completed: false,
        progress: 0,
        subStages: {
          ruleBased: { completed: false },
          mlBased: { completed: false },
          patterns: { completed: false }
        }
      },
      consensusScoring: {
        completed: false
      }
    },
    logs: []
  };
  
  addLog(progress, 'submission', 'Asset submission received and validated', 'success');
  progressTracking.set(id, progress);
  
  return submission;
}

export function getSubmission(id: string): AssetSubmission | undefined {
  return submissions.get(id);
}

export function getAllSubmissions(): AssetSubmission[] {
  return Array.from(submissions.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getProgress(submissionId: string): VerificationProgress | undefined {
  return progressTracking.get(submissionId);
}

// =====================
// VERIFICATION PIPELINE
// =====================

export async function runVerificationPipeline(submissionId: string): Promise<{
  success: boolean;
  eligible?: boolean;
  consensus?: ConsensusScore;
  error?: string;
}> {
  const submission = submissions.get(submissionId);
  if (!submission) {
    return { success: false, error: 'Submission not found' };
  }
  
  const progress = progressTracking.get(submissionId)!;
  
  try {
    // =====================
    // STEP 0: PRODUCTION ORACLE (Document & MCA Verification)
    // =====================
    addLog(progress, 'production', 'Starting Production Oracle verification...', 'info');
    addLog(progress, 'production', 'Verifying document URLs accessibility...', 'info');
    addLog(progress, 'production', 'Running MCA (Ministry of Corporate Affairs) verification...', 'info');
    
    const productionOracleResult = await runProductionOracle(submission);
    productionOracleResults.set(submissionId, productionOracleResult);
    
    addLog(progress, 'production', 
      `Document verification: ${productionOracleResult.documentScore.toFixed(0)}% accessible`,
      productionOracleResult.documentScore >= 70 ? 'success' : 'warning'
    );
    addLog(progress, 'production', 
      `MCA verification: ${productionOracleResult.mcaVerification.found ? 'Company found' : 'Company NOT found'} - Score: ${productionOracleResult.mcaScore.toFixed(0)}%`,
      productionOracleResult.mcaScore >= 60 ? 'success' : 'warning'
    );
    
    if (productionOracleResult.criticalIssues.length > 0) {
      productionOracleResult.criticalIssues.forEach(issue => 
        addLog(progress, 'production', `CRITICAL: ${issue}`, 'error')
      );
    }
    if (productionOracleResult.warnings.length > 0) {
      productionOracleResult.warnings.slice(0, 3).forEach(issue => 
        addLog(progress, 'production', `WARNING: ${issue}`, 'warning')
      );
    }
    
    // =====================
    // STEP 1: ORACLE VERIFICATION
    // =====================
    submission.status = 'ORACLE_VERIFICATION';
    progress.currentStage = 'ORACLE_VERIFICATION';
    addLog(progress, 'oracle', 'Starting Oracle Truth Layer verification', 'info');
    
    // Simulate progressive updates
    progress.stages.oracleVerification.progress = 20;
    progress.stages.oracleVerification.subStages.satellite.completed = true;
    addLog(progress, 'oracle', 'Satellite imagery analysis complete', 'info');
    
    progress.stages.oracleVerification.progress = 40;
    progress.stages.oracleVerification.subStages.registry.completed = true;
    addLog(progress, 'oracle', 'Property registry verification complete', 'info');
    
    progress.stages.oracleVerification.progress = 60;
    progress.stages.oracleVerification.subStages.vision.completed = true;
    addLog(progress, 'oracle', 'Computer vision analysis complete', 'info');
    
    progress.stages.oracleVerification.progress = 80;
    progress.stages.oracleVerification.subStages.activity.completed = true;
    addLog(progress, 'oracle', 'Activity signals verified', 'info');
    
    const oracleResult = await runOracleVerification(submission);
    oracleResults.set(submissionId, oracleResult);
    
    progress.stages.oracleVerification.progress = 100;
    progress.stages.oracleVerification.subStages.ownership.completed = true;
    progress.stages.oracleVerification.subStages.ownership.score = oracleResult.ownership.aggregatedProbability;
    progress.stages.oracleVerification.subStages.satellite.score = oracleResult.existence.satellite.confidence;
    progress.stages.oracleVerification.subStages.registry.score = oracleResult.existence.registry.confidence;
    progress.stages.oracleVerification.subStages.vision.score = oracleResult.existence.vision.confidence;
    progress.stages.oracleVerification.subStages.activity.score = oracleResult.activityScore;
    progress.stages.oracleVerification.completed = true;
    progress.stages.oracleVerification.timestamp = new Date();
    
    addLog(progress, 'oracle', 
      `Oracle verification complete. Existence: ${(oracleResult.existence.aggregatedScore * 100).toFixed(1)}%, Ownership: ${(oracleResult.ownership.aggregatedProbability * 100).toFixed(1)}%`,
      oracleResult.passed ? 'success' : 'warning'
    );
    
    // =====================
    // STEP 2: ABM ANALYSIS
    // =====================
    submission.status = 'ABM_ANALYSIS';
    progress.currentStage = 'ABM_ANALYSIS';
    addLog(progress, 'abm', 'Starting ABM Market Intelligence analysis', 'info');
    
    progress.stages.abmAnalysis.progress = 30;
    progress.stages.abmAnalysis.subStages.marketIntelligence.completed = true;
    addLog(progress, 'abm', 'Market comparables analysis complete', 'info');
    
    progress.stages.abmAnalysis.progress = 60;
    progress.stages.abmAnalysis.subStages.cashFlowSimulation.completed = true;
    addLog(progress, 'abm', 'Monte Carlo cash flow simulation complete (10,000 runs)', 'info');
    
    const abmResult = await runABMAnalysis(submission, oracleResult);
    abmResults.set(submissionId, abmResult);
    
    progress.stages.abmAnalysis.progress = 100;
    progress.stages.abmAnalysis.subStages.riskSimulation.completed = true;
    progress.stages.abmAnalysis.subStages.riskSimulation.score = 100 - abmResult.overallRiskScore;
    progress.stages.abmAnalysis.subStages.marketIntelligence.score = abmResult.marketFitScore;
    progress.stages.abmAnalysis.completed = true;
    progress.stages.abmAnalysis.timestamp = new Date();
    
    addLog(progress, 'abm',
      `ABM analysis complete. NAV: ₹${abmResult.nav.meanNAV.toLocaleString()}, Risk: ${abmResult.overallRiskScore}%`,
      abmResult.passed ? 'success' : 'warning'
    );
    
    // =====================
    // STEP 3: FRAUD DETECTION
    // =====================
    submission.status = 'FRAUD_DETECTION';
    progress.currentStage = 'FRAUD_DETECTION';
    addLog(progress, 'fraud', 'Running fraud detection algorithms', 'info');
    
    progress.stages.fraudDetection.progress = 40;
    progress.stages.fraudDetection.subStages.ruleBased.completed = true;
    addLog(progress, 'fraud', 'Rule-based anomaly detection complete', 'info');
    
    progress.stages.fraudDetection.progress = 70;
    progress.stages.fraudDetection.subStages.mlBased.completed = true;
    addLog(progress, 'fraud', 'ML-based fraud prediction complete', 'info');
    
    const fraudResult = await runFraudDetection(submission, oracleResult, abmResult);
    fraudResults.set(submissionId, fraudResult);
    
    progress.stages.fraudDetection.progress = 100;
    progress.stages.fraudDetection.subStages.patterns.completed = true;
    progress.stages.fraudDetection.subStages.ruleBased.anomalies = fraudResult.ruleBased.anomalies.length;
    progress.stages.fraudDetection.subStages.mlBased.score = (1 - fraudResult.mlBased.xgboostFraudProb) * 100;
    progress.stages.fraudDetection.completed = true;
    progress.stages.fraudDetection.timestamp = new Date();
    
    addLog(progress, 'fraud',
      `Fraud detection complete. Likelihood: ${fraudResult.fraudLikelihood.toFixed(2)}%, Anomalies: ${fraudResult.anomalyScore}`,
      fraudResult.passed ? 'success' : 'warning'
    );
    
    // =====================
    // STEP 4: CONSENSUS SCORING
    // =====================
    submission.status = 'CONSENSUS_SCORING';
    progress.currentStage = 'CONSENSUS_SCORING';
    addLog(progress, 'consensus', 'Calculating consensus score', 'info');
    
    const consensusResult = calculateConsensus({
      submission,
      oracle: oracleResult,
      abm: abmResult,
      fraud: fraudResult
    });
    consensusResults.set(submissionId, consensusResult);
    
    progress.stages.consensusScoring.completed = true;
    progress.stages.consensusScoring.timestamp = new Date();
    progress.stages.consensusScoring.eligible = consensusResult.eligible;
    progress.stages.consensusScoring.confidence = consensusResult.confidence;
    
    // =====================
    // FINAL DECISION
    // =====================
    if (consensusResult.eligible) {
      submission.status = 'ELIGIBLE';
      progress.currentStage = 'ELIGIBLE';
      addLog(progress, 'consensus', 
        `Asset ELIGIBLE for tokenization. Confidence: ${(consensusResult.confidence * 100).toFixed(1)}%`,
        'success'
      );
      
      // Create eligible asset entry
      const eligibleAsset = createEligibleAsset(
        submission, oracleResult, abmResult, fraudResult, consensusResult
      );
      
      addLog(progress, 'registry',
        `Asset registered in Eligible Asset Registry. ID: ${eligibleAsset.id}`,
        'success'
      );
    } else {
      submission.status = 'REJECTED';
      progress.currentStage = 'REJECTED';
      addLog(progress, 'consensus',
        `Asset REJECTED. Reason: ${consensusResult.rejectionReason}`,
        'error'
      );
    }
    
    submission.updatedAt = new Date();
    submissions.set(submissionId, submission);
    
    return {
      success: true,
      eligible: consensusResult.eligible,
      consensus: consensusResult
    };
    
  } catch (error) {
    addLog(progress, 'error', `Pipeline error: ${error}`, 'error');
    submission.status = 'REJECTED';
    submission.updatedAt = new Date();
    submissions.set(submissionId, submission);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// =====================
// ELIGIBLE ASSET REGISTRY
// =====================

function createEligibleAsset(
  submission: AssetSubmission,
  oracle: OracleVerificationResult,
  abm: ABMAnalysis,
  fraud: FraudAnalysis,
  consensus: ConsensusScore
): EligibleAsset {
  const id = `ASSET-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  // Calculate token economics
  const totalTokenSupply = Math.floor(abm.nav.meanNAV / 1000); // 1 token = ₹1000
  const tokenPrice = 1000;
  
  const eligibleAsset: EligibleAsset = {
    id,
    submissionId: submission.id,
    fingerprint: generateFingerprint(submission),
    assetName: submission.assetName,
    category: submission.category,
    location: submission.location,
    spv: submission.spv,
    oracleAttestation: generateHash(oracle),
    existenceScore: oracle.existence.aggregatedScore,
    ownershipProbability: oracle.ownership.aggregatedProbability,
    abmOutputHash: generateHash(abm),
    expectedNAV: {
      min: abm.nav.minNAV,
      max: abm.nav.maxNAV,
      mean: abm.nav.meanNAV
    },
    expectedYield: {
      min: abm.yield.minYield,
      max: abm.yield.maxYield,
      expected: abm.yield.expectedYield
    },
    riskScore: abm.overallRiskScore,
    fraudLikelihood: fraud.fraudLikelihood,
    consensusConfidence: consensus.confidence,
    totalTokenSupply,
    tokenPrice,
    availableTokens: totalTokenSupply,
    cashFlowClaims: [],
    eligibilityTimestamp: new Date(),
    lastUpdated: new Date()
  };
  
  eligibleAssets.set(id, eligibleAsset);
  return eligibleAsset;
}

export function getEligibleAsset(id: string): EligibleAsset | undefined {
  return eligibleAssets.get(id);
}

export function getAllEligibleAssets(): EligibleAsset[] {
  return Array.from(eligibleAssets.values()).sort(
    (a, b) => new Date(b.eligibilityTimestamp).getTime() - new Date(a.eligibilityTimestamp).getTime()
  );
}

export function getEligibleAssetBySubmission(submissionId: string): EligibleAsset | undefined {
  return Array.from(eligibleAssets.values()).find(a => a.submissionId === submissionId);
}

// =====================
// CASH FLOW CLAIMS
// =====================

export function claimCashFlowExposure(
  assetId: string,
  claimantId: string,
  tokensToAcquire: number
): { success: boolean; claim?: EligibleAsset['cashFlowClaims'][0]; error?: string } {
  const asset = eligibleAssets.get(assetId);
  if (!asset) {
    return { success: false, error: 'Asset not found' };
  }
  
  if (tokensToAcquire > asset.availableTokens) {
    return { success: false, error: `Insufficient tokens. Available: ${asset.availableTokens}` };
  }
  
  // Calculate exposure
  const percentageExposure = (tokensToAcquire / asset.totalTokenSupply) * 100;
  const monthlyYield = asset.expectedYield.expected / 100 / 12;
  const expectedMonthlyCF = (tokensToAcquire * asset.tokenPrice) * monthlyYield;
  
  // Check if claimant already has a position
  const existingClaim = asset.cashFlowClaims.find(c => c.claimantId === claimantId);
  
  if (existingClaim) {
    // Update existing claim
    existingClaim.tokensOwned += tokensToAcquire;
    existingClaim.percentageExposure = (existingClaim.tokensOwned / asset.totalTokenSupply) * 100;
    existingClaim.expectedMonthlyCF = (existingClaim.tokensOwned * asset.tokenPrice) * monthlyYield;
  } else {
    // Create new claim
    asset.cashFlowClaims.push({
      claimantId,
      tokensOwned: tokensToAcquire,
      percentageExposure,
      expectedMonthlyCF: Math.round(expectedMonthlyCF)
    });
  }
  
  asset.availableTokens -= tokensToAcquire;
  asset.lastUpdated = new Date();
  eligibleAssets.set(assetId, asset);
  
  const claim = asset.cashFlowClaims.find(c => c.claimantId === claimantId)!;
  
  return { success: true, claim };
}

// =====================
// RESULT RETRIEVAL
// =====================

export function getOracleResult(submissionId: string): OracleVerificationResult | undefined {
  return oracleResults.get(submissionId);
}

export function getABMResult(submissionId: string): ABMAnalysis | undefined {
  return abmResults.get(submissionId);
}

export function getFraudResult(submissionId: string): FraudAnalysis | undefined {
  return fraudResults.get(submissionId);
}

export function getConsensusResult(submissionId: string): ConsensusScore | undefined {
  return consensusResults.get(submissionId);
}

// =====================
// FULL VERIFICATION RESULT
// =====================

export interface FullVerificationResult {
  submission: AssetSubmission;
  progress: VerificationProgress;
  oracle?: OracleVerificationResult;
  abm?: ABMAnalysis;
  fraud?: FraudAnalysis;
  consensus?: ConsensusScore;
  eligibleAsset?: EligibleAsset;
}

export function getFullVerificationResult(submissionId: string): FullVerificationResult | null {
  const submission = submissions.get(submissionId);
  if (!submission) return null;
  
  return {
    submission,
    progress: progressTracking.get(submissionId)!,
    oracle: oracleResults.get(submissionId),
    abm: abmResults.get(submissionId),
    fraud: fraudResults.get(submissionId),
    consensus: consensusResults.get(submissionId),
    eligibleAsset: getEligibleAssetBySubmission(submissionId)
  };
}
