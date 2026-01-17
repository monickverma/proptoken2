import { Injectable, Logger } from '@nestjs/common';
import { ABMService, ABMAsset, ABMScore } from '../abm/abm.service';
import { ethers } from 'ethers';

export interface MockSPV {
  id: string;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
  assetCategory: string;
  satImageUrl: string;
  registryData?: Record<string, any>;
  timestamp: number;
}

export interface SubmissionResult {
  submissionId: string;
  spv: MockSPV;
  abmScore: ABMScore;
  assetFingerprint: string; // Merkle root
  passed: boolean;
  nextStep: 'READY_FOR_TOKEN_MINT' | 'VERIFICATION_FAILED';
  message: string;
}

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);
  private submissions: Map<string, SubmissionResult> = new Map();

  constructor(private abmService: ABMService) {}

  /**
   * Submit mock SPV for verification
   * Includes satellite imagery, coordinates, and registry mock data
   */
  async submitMockSPV(input: {
    name: string;
    address: string;
    longitude: number;
    latitude: number;
    assetCategory?: string;
  }): Promise<SubmissionResult> {
    const submissionId = ethers.id(`${input.name}-${Date.now()}`);
    this.logger.log(`[Submission] New SPV submission: ${submissionId}`);

    // Step 1: Create mock SPV entity
    const spv = this.createMockSPV(input, submissionId);
    this.logger.log(`[Submission] Mock SPV created: ${spv.name} at (${spv.latitude}, ${spv.longitude})`);

    // Step 2: Fetch satellite imagery
    const satImageUrl = this.generateSatelliteImageUrl(spv.longitude, spv.latitude);
    spv.satImageUrl = satImageUrl;
    this.logger.log(`[Submission] Satellite imagery URL: ${satImageUrl}`);

    // Step 3: Generate registry mock data
    spv.registryData = this.generateRegistryMockData(input);
    this.logger.log(`[Submission] Registry mock data generated`);

    // Step 4: Run ABM scoring
    const abmAsset: ABMAsset = {
      id: submissionId,
      address: spv.address,
      longitude: spv.longitude,
      latitude: spv.latitude,
      name: spv.name,
      category: 'TEST', // Mock SPV category
      satImageUrl: satImageUrl
    };

    const abmScore = await this.abmService.scoreAsset(abmAsset);
    this.logger.log(
      `[Submission] ABM Score: ${(abmScore.overallScore * 100).toFixed(0)}% (pass=${abmScore.passes})`
    );

    // Step 5: Generate asset fingerprint (Merkle root)
    const assetFingerprint = this.generateAssetFingerprint(spv);
    this.logger.log(`[Submission] Asset fingerprint: ${assetFingerprint}`);

    // Step 6: Compile result
    const result: SubmissionResult = {
      submissionId,
      spv,
      abmScore,
      assetFingerprint,
      passed: abmScore.passes,
      nextStep: abmScore.passes ? 'READY_FOR_TOKEN_MINT' : 'VERIFICATION_FAILED',
      message: abmScore.passes
        ? `✅ SPV "${spv.name}" verified successfully (Score: ${(abmScore.overallScore * 100).toFixed(0)}%). Ready for token minting.`
        : `❌ SPV "${spv.name}" failed verification (Score: ${(abmScore.overallScore * 100).toFixed(0)}%). Below 40% threshold.`
    };

    // Store submission
    this.submissions.set(submissionId, result);

    this.logger.log(`[Submission] Result stored: ${result.nextStep}`);
    return result;
  }

  /**
   * Create mock SPV entity
   */
  private createMockSPV(
    input: any,
    id: string
  ): MockSPV {
    return {
      id,
      name: input.name,
      address: input.address || `MOCK_SPV_${id.slice(0, 8)}`,
      longitude: input.longitude,
      latitude: input.latitude,
      assetCategory: input.assetCategory || 'COMMERCIAL_REAL_ESTATE',
      satImageUrl: '', // Will be set later
      timestamp: Date.now()
    };
  }

  /**
   * Generate Yandex Static Maps URL for satellite imagery
   * Free tier endpoint - no API key required for basic usage
   */
  private generateSatelliteImageUrl(longitude: number, latitude: number): string {
    // Yandex Static Maps API
    // Returns 450x450 satellite imagery at zoom level 18 (street level)
    return `https://static-maps.yandex.ru/1.x/?ll=${longitude},${latitude}&z=18&size=450,450&layer=sat&lang=en`;
  }

  /**
   * Generate mock registry data
   * Simulates MCA (Ministry of Corporate Affairs) response
   */
  private generateRegistryMockData(input: any): Record<string, any> {
    return {
      registryId: `REG_${ethers.id(input.address).slice(0, 16)}`,
      entityName: input.name,
      entityType: 'Special Purpose Vehicle (SPV)',
      registrationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
      status: 'ACTIVE',
      address: input.address,
      coordinates: {
        latitude: input.latitude,
        longitude: input.longitude,
        verified: true
      },
      documentHash: ethers.id(JSON.stringify(input)),
      verificationMethod: 'SATELLITE_IMAGERY + MOCK_REGISTRY',
      confidence: 0.95
    };
  }

  /**
   * Generate cryptographic asset fingerprint
   * In production: This would be a Merkle root of all asset data
   * For now: Hash of SPV data
   */
  private generateAssetFingerprint(spv: MockSPV): string {
    const dataToHash = JSON.stringify({
      name: spv.name,
      address: spv.address,
      longitude: spv.longitude,
      latitude: spv.latitude,
      timestamp: spv.timestamp,
      satImageUrl: spv.satImageUrl
    });

    return ethers.id(dataToHash);
  }

  /**
   * Retrieve submission by ID
   */
  getSubmission(submissionId: string): SubmissionResult | undefined {
    return this.submissions.get(submissionId);
  }

  /**
   * List all submissions (for dashboard)
   */
  listSubmissions(): SubmissionResult[] {
    return Array.from(this.submissions.values());
  }

  /**
   * Get verified submissions ready for token minting
   */
  getVerifiedSubmissions(): SubmissionResult[] {
    return Array.from(this.submissions.values()).filter(
      result => result.nextStep === 'READY_FOR_TOKEN_MINT'
    );
  }
}
