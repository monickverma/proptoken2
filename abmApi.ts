import { SubmissionFormData, AssetSubmission, VerificationProgress, EligibleAsset, ConsensusScore } from './abmTypes';

const API_BASE = '';

// Helper for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'API request failed');
  }

  return data.data;
}

// =====================
// SUBMISSION API
// =====================

export async function createSubmission(formData: SubmissionFormData): Promise<{ submissionId: string; status: string; message: string }> {
  return apiCall('/abm/submissions', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

export async function getAllSubmissions(): Promise<AssetSubmission[]> {
  return apiCall('/abm/submissions');
}

export async function getSubmission(id: string): Promise<AssetSubmission> {
  return apiCall(`/abm/submissions/${id}`);
}

export async function getSubmissionProgress(id: string): Promise<VerificationProgress> {
  return apiCall(`/abm/submissions/${id}/progress`);
}

export async function getFullVerificationResult(id: string): Promise<any> {
  return apiCall(`/abm/submissions/${id}/full`);
}

// =====================
// VERIFICATION API
// =====================

export async function runVerification(submissionId: string): Promise<{ eligible: boolean; consensus: ConsensusScore; message: string }> {
  return apiCall(`/abm/submissions/${submissionId}/verify`, {
    method: 'POST',
  });
}

export async function getOracleResults(submissionId: string): Promise<any> {
  return apiCall(`/abm/submissions/${submissionId}/oracle`);
}

export async function getABMResults(submissionId: string): Promise<any> {
  return apiCall(`/abm/submissions/${submissionId}/abm`);
}

export async function getFraudResults(submissionId: string): Promise<any> {
  return apiCall(`/abm/submissions/${submissionId}/fraud`);
}

export async function getConsensusResults(submissionId: string): Promise<ConsensusScore> {
  return apiCall(`/abm/submissions/${submissionId}/consensus`);
}

// =====================
// REGISTRY API
// =====================

export async function getEligibleAssets(): Promise<EligibleAsset[]> {
  return apiCall('/abm/registry');
}

export async function getEligibleAsset(id: string): Promise<EligibleAsset> {
  return apiCall(`/abm/registry/${id}`);
}

export async function claimCashFlowExposure(
  assetId: string,
  claimantId: string,
  tokensToAcquire: number
): Promise<{ claim: any; message: string }> {
  return apiCall(`/abm/registry/${assetId}/claim`, {
    method: 'POST',
    body: JSON.stringify({ claimantId, tokensToAcquire }),
  });
}
