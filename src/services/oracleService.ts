// STEP 1.2 & 1.3 - Oracle Truth Layer & Ownership Probability
// Multi-layer oracle verification system

import {
  AssetSubmission,
  ExistenceVerification,
  OwnershipVerification,
  SatelliteSignal,
  RegistrySignal,
  VisionSignal,
  ActivitySignal,
  HistoricalSignal,
  DIDVerification,
  RegistryOwnershipCheck,
  ReputationSignal
} from '../models/abmTypes';

// =====================
// SATELLITE VERIFICATION
// =====================

function simulateSatelliteVerification(submission: AssetSubmission): SatelliteSignal {
  const claimedSize = submission.specifications.size;

  // Simulate satellite imagery analysis
  // In production: Call Google Earth Engine, Sentinel Hub, Planet Labs APIs

  const structureDetected = Math.random() > 0.05; // 95% detection rate

  // Estimate size from imagery (with some variance)
  const sizeVariance = 0.15; // 15% typical variance
  const estimatedSize = structureDetected
    ? claimedSize * (1 + (Math.random() - 0.5) * sizeVariance * 2)
    : 0;

  // Size match score
  const sizeDiff = Math.abs(estimatedSize - claimedSize) / claimedSize;
  const sizeMatchScore = sizeDiff < 0.2 ? 1 - sizeDiff : 0.5;

  // Overall confidence based on detection and match
  const confidence = structureDetected
    ? 0.7 + (sizeMatchScore * 0.3)
    : 0.3;

  return {
    provider: 'Sentinel-2 / Planet Labs',
    imageUrl: '/evidence/satellite.png',
    captureDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    resolution: 0.5, // 0.5m per pixel
    structureDetected,
    estimatedSize: Math.round(estimatedSize),
    changeDetected: Math.random() > 0.9, // 10% show recent changes
    confidence
  };
}

// =====================
// PROPERTY REGISTRY VERIFICATION
// =====================

function simulateRegistryVerification(submission: AssetSubmission): RegistrySignal {
  // In production: Query IGRS, state land records, RERA databases

  const recordFound = Math.random() > 0.08; // 92% found in records

  // Simulate name matching (fuzzy match)
  const ownerNameMatch = recordFound
    ? 0.7 + Math.random() * 0.3  // 70-100% match
    : 0;

  // Address matching
  const addressMatch = recordFound
    ? 0.75 + Math.random() * 0.25
    : 0;

  // Check for encumbrances (mortgages, liens)
  const hasEncumbrances = Math.random() > 0.7; // 30% have some encumbrance
  const encumbrances = hasEncumbrances
    ? ['Mortgage - Bank of India', 'Property Tax Lien (Cleared)']
    : [];

  const confidence = recordFound
    ? (ownerNameMatch * 0.4 + addressMatch * 0.4 + (hasEncumbrances ? 0.1 : 0.2))
    : 0.2;

  return {
    source: 'IGRS Karnataka / State Land Records',
    recordFound,
    ownerNameMatch,
    addressMatch,
    registeredSize: recordFound ? submission.specifications.size * (0.95 + Math.random() * 0.1) : 0,
    encumbrances,
    lastTransactionDate: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    confidence,
    evidenceUrl: '/evidence/registry.png'
  };
}

// =====================
// COMPUTER VISION VERIFICATION
// =====================

function simulateVisionVerification(submission: AssetSubmission): VisionSignal {
  // In production: Use Google Cloud Vision, AWS Rekognition, custom CV models

  const hasImages = submission.imageUrls.length > 0;
  const buildingDetected = hasImages && Math.random() > 0.05;

  // Map submission type to detected type
  const typeMapping: Record<string, string[]> = {
    'residential': ['Single Family Home', 'Apartment Complex', 'Villa', 'Townhouse'],
    'commercial': ['Office Building', 'Retail Space', 'Shopping Complex', 'Warehouse'],
    'industrial': ['Factory', 'Manufacturing Unit', 'Industrial Park'],
    'agricultural': ['Farm Land', 'Plantation', 'Agricultural Plot']
  };

  const possibleTypes = typeMapping[submission.specifications.type] || ['Unknown Structure'];
  const buildingType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

  // Estimate age from visual features
  const claimedAge = submission.specifications.age;
  const estimatedAge = claimedAge * (0.8 + Math.random() * 0.4);

  // Condition scoring based on visual analysis
  const conditionMap = { 'excellent': 0.9, 'good': 0.75, 'fair': 0.5, 'poor': 0.25 };
  const expectedCondition = conditionMap[submission.specifications.condition];
  const detectedCondition = expectedCondition * (0.85 + Math.random() * 0.3);

  // Image authenticity (detect manipulation)
  const authenticityScore = 0.85 + Math.random() * 0.15; // Most images are authentic

  return {
    provider: 'Google Cloud Vision / Custom CV',
    buildingDetected,
    buildingType,
    estimatedAge: Math.round(estimatedAge),
    conditionScore: Math.min(1, detectedCondition),
    authenticityScore,
    confidence: buildingDetected ? 0.8 + Math.random() * 0.15 : 0.3,
    analysisUrl: '/evidence/vision.png'
  };
}

// =====================
// ACTIVITY SIGNALS VERIFICATION
// =====================

function simulateActivityVerification(submission: AssetSubmission): ActivitySignal {
  // In production: Query utility companies, tax departments, foot traffic APIs

  const occupancyRate = submission.financials.occupancyRate / 100;

  // Utility activity (power, water consumption)
  const utilityActive = occupancyRate > 0.3 && Math.random() > 0.1;
  const utilityScore = utilityActive
    ? 0.6 + occupancyRate * 0.4
    : 0.2;

  // Tax payment history
  const taxPaymentsCurrent = Math.random() > 0.15; // 85% are current
  const taxScore = taxPaymentsCurrent ? 0.85 + Math.random() * 0.15 : 0.3;

  // Occupancy indicators (mail delivery, security, etc.)
  const occupancyIndicators = occupancyRate * (0.8 + Math.random() * 0.4);

  // Foot traffic (relevant for commercial)
  const isCommercial = submission.specifications.type === 'commercial';
  const footTrafficScore = isCommercial
    ? 0.5 + Math.random() * 0.5
    : 0.5; // Neutral for non-commercial

  const confidence = (utilityScore + taxScore + Math.min(1, occupancyIndicators)) / 3;

  return {
    utilityActive,
    utilityScore,
    taxPaymentsCurrent,
    taxScore,
    occupancyIndicators: Math.min(1, occupancyIndicators),
    footTrafficScore,
    confidence
  };
}

// =====================
// HISTORICAL VERIFICATION
// =====================

function simulateHistoricalVerification(submission: AssetSubmission): HistoricalSignal {
  // In production: Query historical databases, prior submissions, reputation systems

  const yearsOfData = Math.floor(3 + Math.random() * 10); // 3-13 years
  const consistentExistence = Math.random() > 0.1; // 90% consistent

  // Check prior submissions from this wallet
  const priorSubmissions = Math.floor(Math.random() * 5);
  const priorFraudFlags = priorSubmissions > 0 ? Math.floor(Math.random() * 0.5) : 0;

  // Reputation score based on history
  let reputationScore = 0.5; // Base
  if (priorSubmissions > 0 && priorFraudFlags === 0) {
    reputationScore = 0.7 + (priorSubmissions * 0.05);
  } else if (priorFraudFlags > 0) {
    reputationScore = 0.3 - (priorFraudFlags * 0.1);
  }
  reputationScore = Math.min(1, Math.max(0, reputationScore));

  const confidence = consistentExistence
    ? 0.7 + (yearsOfData / 20) * 0.3
    : 0.4;

  return {
    yearsOfData,
    consistentExistence,
    priorSubmissions,
    priorFraudFlags,
    reputationScore,
    confidence
  };
}

// =====================
// AGGREGATED EXISTENCE VERIFICATION
// =====================

export async function verifyExistence(submission: AssetSubmission): Promise<ExistenceVerification> {
  // Simulate parallel verification across all oracle sources
  const [satellite, registry, vision, activity, historical] = await Promise.all([
    Promise.resolve(simulateSatelliteVerification(submission)),
    Promise.resolve(simulateRegistryVerification(submission)),
    Promise.resolve(simulateVisionVerification(submission)),
    Promise.resolve(simulateActivityVerification(submission)),
    Promise.resolve(simulateHistoricalVerification(submission))
  ]);

  // Weighted aggregation of scores
  const weights = {
    satellite: 0.25,
    registry: 0.30,
    vision: 0.15,
    activity: 0.15,
    historical: 0.15
  };

  // Calculate individual signal scores
  const satelliteScore = satellite.structureDetected
    ? satellite.confidence
    : 0.3;

  const registryScore = registry.recordFound
    ? (registry.ownerNameMatch * 0.5 + registry.addressMatch * 0.3 + registry.confidence * 0.2)
    : 0.2;

  const visionScore = vision.buildingDetected
    ? (vision.conditionScore * 0.3 + vision.authenticityScore * 0.4 + vision.confidence * 0.3)
    : 0.3;

  const activityScore = (activity.utilityScore + activity.taxScore + activity.occupancyIndicators) / 3;

  const historicalScore = historical.consistentExistence
    ? (historical.reputationScore * 0.5 + historical.confidence * 0.5)
    : 0.3;

  // Weighted average
  const aggregatedScore =
    satelliteScore * weights.satellite +
    registryScore * weights.registry +
    visionScore * weights.vision +
    activityScore * weights.activity +
    historicalScore * weights.historical;

  // Confidence is weighted average of individual confidences
  const confidence =
    satellite.confidence * weights.satellite +
    registry.confidence * weights.registry +
    vision.confidence * weights.vision +
    activity.confidence * weights.activity +
    historical.confidence * weights.historical;

  return {
    satellite,
    registry,
    vision,
    activity,
    historical,
    aggregatedScore: Math.min(1, aggregatedScore),
    confidence: Math.min(1, confidence),
    passed: aggregatedScore >= 0.9
  };
}

// =====================
// DID VERIFICATION
// =====================

function simulateDIDVerification(submission: AssetSubmission): DIDVerification {
  // In production: Resolve DID via Polygon ID, Civic, ENS

  const hasDID = !!submission.did;
  const didResolved = hasDID && Math.random() > 0.1;

  // Verification levels
  const levels: Array<'none' | 'basic' | 'verified' | 'institutional'> =
    ['none', 'basic', 'verified', 'institutional'];
  const verificationLevel = didResolved
    ? levels[1 + Math.floor(Math.random() * 3)]
    : 'none';

  const levelScores = { 'none': 0.2, 'basic': 0.5, 'verified': 0.8, 'institutional': 0.95 };

  return {
    didResolved,
    linkedWallets: didResolved ? [submission.walletAddress] : [],
    nameFromDID: didResolved ? submission.spv.directors[0] || 'Unknown' : '',
    verificationLevel,
    score: levelScores[verificationLevel]
  };
}

// =====================
// REGISTRY OWNERSHIP CHECK
// =====================

function simulateRegistryOwnershipCheck(
  submission: AssetSubmission,
  registrySignal: RegistrySignal
): RegistryOwnershipCheck {
  // Check if SPV/submitter matches registry owner

  const ownerNameSimilarity = registrySignal.recordFound
    ? registrySignal.ownerNameMatch
    : 0.3;

  const addressMatch = registrySignal.recordFound && registrySignal.addressMatch > 0.8;

  // Check if wallet is linked to ownership documents
  const walletLinked = Math.random() > 0.3; // 70% have wallet linkage

  // Verify document hashes
  const documentHashesValid = submission.documentUrls.length > 0 && Math.random() > 0.15;

  const score =
    ownerNameSimilarity * 0.35 +
    (addressMatch ? 0.25 : 0.1) +
    (walletLinked ? 0.2 : 0.05) +
    (documentHashesValid ? 0.2 : 0.05);

  return {
    ownerNameSimilarity,
    addressMatch,
    walletLinked,
    documentHashesValid,
    score: Math.min(1, score)
  };
}

// =====================
// REPUTATION CHECK
// =====================

function simulateReputationCheck(submission: AssetSubmission): ReputationSignal {
  // In production: Query platform history, social graph analysis

  const priorSuccessfulSubmissions = Math.floor(Math.random() * 5);
  const priorRejections = Math.floor(Math.random() * 2);
  const platformTenureMonths = Math.floor(Math.random() * 36); // 0-3 years

  // Social graph score (connections to verified entities)
  const socialGraphScore = 0.3 + Math.random() * 0.5;

  // Calculate reputation
  let score = 0.5; // Base
  score += priorSuccessfulSubmissions * 0.1;
  score -= priorRejections * 0.15;
  score += (platformTenureMonths / 36) * 0.2;
  score += socialGraphScore * 0.2;

  return {
    priorSuccessfulSubmissions,
    priorRejections,
    platformTenureMonths,
    socialGraphScore,
    score: Math.min(1, Math.max(0, score))
  };
}

// =====================
// AGGREGATED OWNERSHIP VERIFICATION
// =====================

export async function verifyOwnership(
  submission: AssetSubmission,
  existenceResult: ExistenceVerification
): Promise<OwnershipVerification> {
  const didVerification = simulateDIDVerification(submission);
  const registryOwnership = simulateRegistryOwnershipCheck(submission, existenceResult.registry);
  const reputation = simulateReputationCheck(submission);

  // Weighted aggregation
  const weights = {
    did: 0.30,
    registry: 0.45,
    reputation: 0.25
  };

  const aggregatedProbability =
    didVerification.score * weights.did +
    registryOwnership.score * weights.registry +
    reputation.score * weights.reputation;

  // Confidence based on data quality
  const confidence =
    (didVerification.didResolved ? 0.3 : 0.1) +
    (registryOwnership.documentHashesValid ? 0.4 : 0.2) +
    (reputation.priorSuccessfulSubmissions > 0 ? 0.3 : 0.1);

  return {
    didVerification,
    registryOwnership,
    reputation,
    aggregatedProbability: Math.min(1, aggregatedProbability),
    confidence: Math.min(1, confidence),
    passed: aggregatedProbability >= 0.8
  };
}

// =====================
// FULL ORACLE VERIFICATION
// =====================

export interface OracleVerificationResult {
  existence: ExistenceVerification;
  ownership: OwnershipVerification;

  // Activity Score (from existence)
  activityScore: number;

  // Combined Results
  overallScore: number;
  passed: boolean;
}

export async function runOracleVerification(
  submission: AssetSubmission
): Promise<OracleVerificationResult> {
  // Step 1: Existence Verification
  const existence = await verifyExistence(submission);

  // Step 2: Ownership Verification (uses existence results)
  const ownership = await verifyOwnership(submission, existence);

  // Activity score from existence verification
  const activityScore = (
    existence.activity.utilityScore * 0.3 +
    existence.activity.taxScore * 0.3 +
    existence.activity.occupancyIndicators * 0.25 +
    existence.activity.footTrafficScore * 0.15
  );

  // Overall score
  const overallScore =
    existence.aggregatedScore * 0.5 +
    ownership.aggregatedProbability * 0.35 +
    activityScore * 0.15;

  return {
    existence,
    ownership,
    activityScore,
    overallScore,
    passed: existence.passed && ownership.passed
  };
}
