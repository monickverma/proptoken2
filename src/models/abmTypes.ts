// ABM & Asset Intelligence Layer - Complete Type Definitions

export type AssetCategory = 'real-estate' | 'private-credit' | 'commodity' | 'ip-rights';
export type VerificationStatus = 'PENDING' | 'PROCESSING' | 'ORACLE_VERIFICATION' | 'ABM_ANALYSIS' | 'FRAUD_DETECTION' | 'CONSENSUS_SCORING' | 'ELIGIBLE' | 'REJECTED';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// =====================
// STEP 1.1 - SUBMISSION
// =====================

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface AssetLocation {
  address: string;
  coordinates: GeoCoordinates;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface AssetSpecifications {
  size: number;           // in sq ft
  type: string;           // residential, commercial, industrial, agricultural
  age: number;            // years
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  floors?: number;
  units?: number;         // for multi-unit properties
}

export interface SPVDetails {
  spvName: string;
  spvRegistrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
  registeredAddress: string;
  directors: string[];
  shareholderStructure: {
    holder: string;
    percentage: number;
  }[];
}

export interface AssetFinancials {
  currentRent: number;          // monthly rent in INR
  expectedYield: number;        // annual yield %
  annualExpenses: number;       // maintenance, tax, insurance
  occupancyRate: number;        // 0-100%
  tenantCount: number;
  leaseTermsMonths: number;
  historicalCashFlow: {
    month: string;
    income: number;
    expenses: number;
  }[];
}

export interface AssetSubmission {
  id: string;

  // Identity & Ownership
  submitterId: string;
  walletAddress: string;
  did?: string;                 // Decentralized ID
  signature: string;

  // Asset Information
  category: AssetCategory;
  assetName: string;
  location: AssetLocation;
  specifications: AssetSpecifications;

  // SPV Structure
  spv: SPVDetails;

  // Proofs & Documents
  registryIds: string[];        // Property registry IDs
  documentUrls: string[];       // Title deeds, etc.
  imageUrls: string[];
  videoUrls: string[];

  // Financial Data
  financials: AssetFinancials;

  // Valuation
  claimedValue: number;         // Owner's claimed value in INR

  // Intent
  tokenizationIntent: string;
  targetRaise: number;          // Amount to raise through tokenization

  // Meta
  status: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// =====================
// STEP 1.2 - ORACLE TRUTH LAYER
// =====================

export interface SatelliteSignal {
  provider: string;             // e.g., 'Sentinel', 'Planet'
  imageUrl: string;
  captureDate: string;
  resolution: number;           // meters per pixel
  structureDetected: boolean;
  estimatedSize: number;        // sq ft from imagery
  changeDetected: boolean;      // vs historical
  confidence: number;           // 0-1
}

export interface RegistrySignal {
  source: string;               // e.g., 'IGRS', 'State Registry'
  recordFound: boolean;
  ownerNameMatch: number;       // 0-1 similarity score
  addressMatch: number;         // 0-1 similarity score
  registeredSize: number;
  encumbrances: string[];
  lastTransactionDate: string;
  confidence: number;
  evidenceUrl?: string;
}

export interface VisionSignal {
  provider: string;
  buildingDetected: boolean;
  buildingType: string;
  estimatedAge: number;
  conditionScore: number;       // 0-1
  authenticityScore: number;    // image manipulation detection
  confidence: number;
  analysisUrl?: string;
}

export interface ActivitySignal {
  utilityActive: boolean;
  utilityScore: number;         // 0-1
  taxPaymentsCurrent: boolean;
  taxScore: number;             // 0-1
  occupancyIndicators: number;  // 0-1
  footTrafficScore: number;     // 0-1 for commercial
  confidence: number;
}

export interface HistoricalSignal {
  yearsOfData: number;
  consistentExistence: boolean;
  priorSubmissions: number;
  priorFraudFlags: number;
  reputationScore: number;      // 0-1
  confidence: number;
}

export interface ExistenceVerification {
  satellite: SatelliteSignal;
  registry: RegistrySignal;
  vision: VisionSignal;
  activity: ActivitySignal;
  historical: HistoricalSignal;

  aggregatedScore: number;      // 0-1
  confidence: number;
  passed: boolean;
}

// =====================
// STEP 1.3 - OWNERSHIP PROBABILITY
// =====================

export interface DIDVerification {
  didResolved: boolean;
  linkedWallets: string[];
  nameFromDID: string;
  verificationLevel: 'none' | 'basic' | 'verified' | 'institutional';
  score: number;
}

export interface RegistryOwnershipCheck {
  ownerNameSimilarity: number;  // 0-1
  addressMatch: boolean;
  walletLinked: boolean;
  documentHashesValid: boolean;
  score: number;
}

export interface ReputationSignal {
  priorSuccessfulSubmissions: number;
  priorRejections: number;
  platformTenureMonths: number;
  socialGraphScore: number;     // 0-1
  score: number;
}

export interface OwnershipVerification {
  didVerification: DIDVerification;
  registryOwnership: RegistryOwnershipCheck;
  reputation: ReputationSignal;

  aggregatedProbability: number; // 0-1
  confidence: number;
  passed: boolean;
}

// =====================
// STEP 1.4 - ABM MARKET INTELLIGENCE
// =====================

export interface MarketComparable {
  id: string;
  distance: number;             // km from subject
  size: number;
  pricePerSqFt: number;
  yield: number;
  condition: number;            // 0-1
  transactionDate: string;
  similarity: number;           // 0-1
}

export interface NAVCalculation {
  comparablesUsed: number;
  avgPricePerSqFt: number;
  adjustedPricePerSqFt: number;

  minNAV: number;
  maxNAV: number;
  meanNAV: number;
  medianNAV: number;

  downsideNAV: number;          // 5th percentile
  upsideNAV: number;            // 95th percentile

  claimedVsCalculated: number;  // ratio
  confidence: number;
}

export interface YieldAnalysis {
  marketMedianYield: number;
  subjectYield: number;
  yieldSpread: number;          // vs market

  minYield: number;
  maxYield: number;
  expectedYield: number;

  sustainabilityScore: number;  // 0-1
  confidence: number;
}

export interface CashFlowSimulation {
  simulationRuns: number;
  yearsSimulated: number;

  // Monte Carlo Results
  meanAnnualCF: number[];
  medianAnnualCF: number[];
  percentile5CF: number[];
  percentile95CF: number[];

  totalCFDistribution: {
    mean: number;
    std: number;
    min: number;
    max: number;
    percentile5: number;
    percentile95: number;
  };

  probabilityPositiveCF: number;
  breakEvenYear: number | null;
}

export interface RiskSimulation {
  // Vacancy Risk
  vacancyRiskScore: number;     // 0-100
  expectedVacancyRate: number;
  worstCaseVacancy: number;

  // Market Risk
  marketVolatility: number;     // 0-100
  correlationToIndex: number;
  betaCoefficient: number;

  // Interest Rate Risk
  interestRateSensitivity: number;
  durationYears: number;

  // Liquidity Risk
  liquidityScore: number;       // 0-100
  estimatedTimeToSell: number;  // days
  marketDepth: number;          // 0-1

  // Stress Test Results
  stressTests: {
    scenario: string;
    navImpact: number;          // % change
    cfImpact: number;           // % change
    probability: number;
  }[];

  // Tail Risk
  var95: number;                // Value at Risk 95%
  var99: number;                // Value at Risk 99%
  expectedShortfall: number;
  tailRiskScore: number;        // 0-1
}

export interface ABMAnalysis {
  // Market Intelligence
  comparables: MarketComparable[];
  nav: NAVCalculation;
  yield: YieldAnalysis;

  // Simulations
  cashFlowSimulation: CashFlowSimulation;
  riskSimulation: RiskSimulation;

  // Summary Metrics
  overallRiskScore: number;     // 0-100
  investabilityScore: number;   // 0-100
  marketFitScore: number;       // 0-100

  confidence: number;
  passed: boolean;

  timestamp: Date;
}

// =====================
// STEP 1.5 - FRAUD DETECTION
// =====================

export interface FraudAnomaly {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detail: string;
  score: number;                // contribution to fraud likelihood
  evidence: string[];
}

export interface RuleBasedDetection {
  anomalies: FraudAnomaly[];
  rulesTriggered: string[];
  totalScore: number;
}

export interface MLBasedDetection {
  isolationForestScore: number;
  xgboostFraudProb: number;
  anomalies: FraudAnomaly[];
  featureImportance: { feature: string; importance: number }[];
}

export interface PatternDetection {
  duplicateSubmissions: boolean;
  linkedFraudulentAccounts: boolean;
  suspiciousTimingPatterns: boolean;
  anomalies: FraudAnomaly[];
}

export interface FraudAnalysis {
  ruleBased: RuleBasedDetection;
  mlBased: MLBasedDetection;
  patterns: PatternDetection;

  fraudLikelihood: number;      // 0-100%
  anomalyScore: number;         // count of anomalies
  riskLevel: RiskLevel;

  passed: boolean;              // fraud <= 5%
  timestamp: Date;
}

// =====================
// STEP 1.6 - CONSENSUS SCORING
// =====================

export interface ConsensusThresholds {
  minExistence: number;         // 0.9
  minOwnership: number;         // 0.8
  minActivity: number;          // 0.6
  maxFraud: number;             // 5.0
  maxRisk: number;              // 70
}

export interface ConsensusRuleResult {
  rule: string;
  threshold: number;
  actualValue: number;
  passed: boolean;
}

export interface ConsensusScore {
  submissionId: string;

  // Input Scores
  existenceScore: number;
  ownershipProbability: number;
  activityScore: number;
  fraudLikelihood: number;
  riskScore: number;

  // Rule Results
  rules: ConsensusRuleResult[];
  allRulesPassed: boolean;

  // Final Decision
  eligible: boolean;
  confidence: number;
  rejectionReason: string | null;

  timestamp: Date;
}

// =====================
// STEP 1.7 - ASSET REGISTRY
// =====================

export interface EligibleAsset {
  id: string;
  submissionId: string;

  // Asset Fingerprint
  fingerprint: string;          // hash of all data

  // Core Data
  assetName: string;
  category: AssetCategory;
  location: AssetLocation;
  spv: SPVDetails;

  // Oracle Attestations
  oracleAttestation: string;    // hash
  existenceScore: number;
  ownershipProbability: number;

  // ABM Results
  abmOutputHash: string;
  expectedNAV: { min: number; max: number; mean: number };
  expectedYield: { min: number; max: number; expected: number };
  riskScore: number;

  // Fraud Results
  fraudLikelihood: number;

  // Consensus
  consensusConfidence: number;

  // Cash Flow Claims
  totalTokenSupply: number;
  tokenPrice: number;
  availableTokens: number;
  cashFlowClaims: {
    claimantId: string;
    tokensOwned: number;
    percentageExposure: number;
    expectedMonthlyCF: number;
  }[];

  // Timestamps
  eligibilityTimestamp: Date;
  lastUpdated: Date;
}

// =====================
// VERIFICATION PIPELINE STATUS
// =====================

export interface VerificationProgress {
  submissionId: string;
  currentStage: VerificationStatus;

  stages: {
    submission: { completed: boolean; timestamp?: Date };
    oracleVerification: {
      completed: boolean;
      timestamp?: Date;
      progress: number;         // 0-100
      subStages: {
        satellite: { completed: boolean; score?: number };
        registry: { completed: boolean; score?: number };
        vision: { completed: boolean; score?: number };
        activity: { completed: boolean; score?: number };
        ownership: { completed: boolean; score?: number };
      };
    };
    abmAnalysis: {
      completed: boolean;
      timestamp?: Date;
      progress: number;
      subStages: {
        marketIntelligence: { completed: boolean; score?: number };
        cashFlowSimulation: { completed: boolean };
        riskSimulation: { completed: boolean; score?: number };
      };
    };
    fraudDetection: {
      completed: boolean;
      timestamp?: Date;
      progress: number;
      subStages: {
        ruleBased: { completed: boolean; anomalies?: number };
        mlBased: { completed: boolean; score?: number };
        patterns: { completed: boolean };
      };
    };
    consensusScoring: {
      completed: boolean;
      timestamp?: Date;
      eligible?: boolean;
      confidence?: number;
    };
  };

  logs: {
    timestamp: Date;
    stage: string;
    message: string;
    level: 'info' | 'warning' | 'error' | 'success';
  }[];
}
