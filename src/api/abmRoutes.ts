// ABM & Asset Intelligence Layer API Routes

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  createSubmission,
  getSubmission,
  getAllSubmissions,
  getProgress,
  runVerificationPipeline,
  getAllEligibleAssets,
  getEligibleAsset,
  claimCashFlowExposure,
  getFullVerificationResult,
  getOracleResult,
  getABMResult,
  getFraudResult,
  getConsensusResult
} from '../services/registryService';
import { AssetCategory } from '../models/abmTypes';

const router = Router();

// =====================
// VALIDATION SCHEMAS
// =====================

const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

const LocationSchema = z.object({
  address: z.string().min(5),
  coordinates: CoordinatesSchema,
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().min(2),
  postalCode: z.string().min(4)
});

const SpecificationsSchema = z.object({
  size: z.number().positive(),
  type: z.string(),
  age: z.number().min(0),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  floors: z.number().optional(),
  units: z.number().optional()
});

const SPVSchema = z.object({
  spvName: z.string().min(3),
  spvRegistrationNumber: z.string().min(3),
  jurisdiction: z.string().min(2),
  incorporationDate: z.string(),
  registeredAddress: z.string().min(5),
  directors: z.array(z.string()).min(1),
  shareholderStructure: z.array(z.object({
    holder: z.string(),
    percentage: z.number().min(0).max(100)
  }))
});

const FinancialsSchema = z.object({
  currentRent: z.number().min(0),
  expectedYield: z.number().min(0).max(50),
  annualExpenses: z.number().min(0),
  occupancyRate: z.number().min(0).max(100),
  tenantCount: z.number().min(0),
  leaseTermsMonths: z.number().min(0),
  historicalCashFlow: z.array(z.object({
    month: z.string(),
    income: z.number(),
    expenses: z.number()
  })).optional().default([])
});

const SubmissionSchema = z.object({
  submitterId: z.string().min(1),
  walletAddress: z.string().min(10),
  did: z.string().optional(),
  signature: z.string().min(10),
  category: z.enum(['real-estate', 'private-credit', 'commodity', 'ip-rights']),
  assetName: z.string().min(3),
  location: LocationSchema,
  specifications: SpecificationsSchema,
  spv: SPVSchema,
  registryIds: z.array(z.string()),
  documentUrls: z.array(z.string()),
  imageUrls: z.array(z.string()),
  videoUrls: z.array(z.string()).optional().default([]),
  financials: FinancialsSchema,
  claimedValue: z.number().positive(),
  tokenizationIntent: z.string().min(10),
  targetRaise: z.number().positive()
});

// =====================
// SUBMISSION ENDPOINTS
// =====================

// Create new asset submission
router.post('/submissions', async (req: Request, res: Response) => {
  try {
    const validatedData = SubmissionSchema.parse(req.body);
    const submission = createSubmission(validatedData as any);
    
    (res as any).status(201).json({
      success: true,
      data: {
        submissionId: submission.id,
        status: submission.status,
        message: 'Asset submission created successfully. Run verification to begin the pipeline.'
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      (res as any).status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid submission data',
          details: error.errors
        }
      });
    } else if (error instanceof SyntaxError) {
      // Handle JSON parsing errors
      (res as any).status(400).json({
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Invalid JSON format in request body'
        }
      });
    } else {
      (res as any).status(500).json({
        success: false,
        error: {
          code: 'SUBMISSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create submission'
        }
      });
    }
  }
});

// Get all submissions
router.get('/submissions', (req: Request, res: Response) => {
  const submissions = getAllSubmissions();
  (res as any).json({
    success: true,
    data: submissions,
    count: submissions.length
  });
});

// Get submission by ID
router.get('/submissions/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const submission = getSubmission(id);
  
  if (!submission) {
    return (res as any).status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Submission not found' }
    });
  }
  
  (res as any).json({ success: true, data: submission });
});

// Get submission progress
router.get('/submissions/:id/progress', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const progress = getProgress(id);
  
  if (!progress) {
    return (res as any).status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Submission not found' }
    });
  }
  
  (res as any).json({ success: true, data: progress });
});

// Get full verification result
router.get('/submissions/:id/full', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = getFullVerificationResult(id);
  
  if (!result) {
    return (res as any).status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Submission not found' }
    });
  }
  
  (res as any).json({ success: true, data: result });
});

// =====================
// VERIFICATION PIPELINE
// =====================

// Run verification pipeline
router.post('/submissions/:id/verify', async (req: Request, res: Response) => {
  const submissionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const submission = getSubmission(submissionId);
  
  if (!submission) {
    return (res as any).status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Submission not found' }
    });
  }
  
  if (submission.status !== 'PENDING') {
    return (res as any).status(400).json({
      success: false,
      error: { 
        code: 'ALREADY_PROCESSED', 
        message: `Submission already processed. Current status: ${submission.status}` 
      }
    });
  }
  
  try {
    const result = await runVerificationPipeline(submissionId);
    
    (res as any).json({
      success: true,
      data: {
        eligible: result.eligible,
        consensus: result.consensus,
        message: result.eligible 
          ? 'Asset verified and eligible for tokenization!'
          : `Asset rejected: ${result.consensus?.rejectionReason}`
      }
    });
  } catch (error) {
    (res as any).status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: error instanceof Error ? error.message : 'Verification pipeline failed'
      }
    });
  }
});

// =====================
// INDIVIDUAL RESULT ENDPOINTS
// =====================

// Get Oracle results
router.get('/submissions/:id/oracle', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = getOracleResult(id);
  
  if (!result) {
    return (res as any).status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Oracle results not found' }
    });
  }
  
  (res as any).json({ success: true, data: result });
});

// Get ABM results
router.get('/submissions/:id/abm', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = getABMResult(id);
  
  if (!result) {
    return (res as any).status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'ABM results not found' }
    });
  }
  
  (res as any).json({ success: true, data: result });
});

// Get Fraud results
router.get('/submissions/:id/fraud', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = getFraudResult(id);
  
  if (!result) {
    return (res as any).status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Fraud results not found' }
    });
  }
  
  (res as any).json({ success: true, data: result });
});

// Get Consensus results
router.get('/submissions/:id/consensus', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = getConsensusResult(id);
  
  if (!result) {
    return (res as any).status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Consensus results not found' }
    });
  }
  
  (res as any).json({ success: true, data: result });
});

// =====================
// ELIGIBLE ASSET REGISTRY
// =====================

// Get all eligible assets
router.get('/registry', (req: Request, res: Response) => {
  const assets = getAllEligibleAssets();
  (res as any).json({
    success: true,
    data: assets,
    count: assets.length
  });
});

// Get eligible asset by ID
router.get('/registry/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const asset = getEligibleAsset(id);
  
  if (!asset) {
    return (res as any).status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Asset not found in registry' }
    });
  }
  
  (res as any).json({ success: true, data: asset });
});

// =====================
// CASH FLOW CLAIMS
// =====================

const ClaimSchema = z.object({
  claimantId: z.string().min(1),
  tokensToAcquire: z.number().positive().int()
});

// Claim cash flow exposure
router.post('/registry/:id/claim', (req: Request, res: Response) => {
  try {
    const { claimantId, tokensToAcquire } = ClaimSchema.parse(req.body);
    const assetId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    
    const result = claimCashFlowExposure(assetId, claimantId, tokensToAcquire);
    
    if (!result.success) {
      return (res as any).status(400).json({
        success: false,
        error: { code: 'CLAIM_FAILED', message: result.error }
      });
    }
    
    (res as any).json({
      success: true,
      data: {
        claim: result.claim,
        message: `Successfully claimed ${tokensToAcquire} tokens with ${result.claim?.percentageExposure.toFixed(2)}% cash flow exposure`
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      (res as any).status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid claim data',
          details: error.errors
        }
      });
    } else {
      (res as any).status(500).json({
        success: false,
        error: {
          code: 'CLAIM_ERROR',
          message: error instanceof Error ? error.message : 'Failed to process claim'
        }
      });
    }
  }
});

export default router;
