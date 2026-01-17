import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { Injectable } from '@nestjs/common';
import { SubmissionService, SubmissionResult } from '../submission/submission.service';
import { TokenMinterService, TokenMintingResult } from '../minting/token-minter.service';
import { ActivityFeedService, ActivityFeedEvent } from '../activity/activity-feed.service';
import { ABMService } from '../abm/abm.service';

@Injectable()
@Resolver()
export class MutationResolver {
  constructor(
    private submissionService: SubmissionService,
    private tokenMinterService: TokenMinterService,
    private activityFeedService: ActivityFeedService,
    private abmService: ABMService
  ) {}

  /**
   * GraphQL Mutation: Submit mock SPV for verification
   *
   * Example:
   * mutation {
   *   submitMockSPV(
   *     name: "DLF Cyber Hub"
   *     address: "Plot No. 123, Sector 43, Gurugram"
   *     longitude: 77.0123
   *     latitude: 28.4567
   *     assetCategory: "COMMERCIAL_REAL_ESTATE"
   *   ) {
   *     submissionId
   *     status
   *     abmScore
   *     satImageUrl
   *   }
   * }
   */
  @Mutation()
  async submitMockSPV(
    @Args('name') name: string,
    @Args('address') address: string,
    @Args('longitude') longitude: number,
    @Args('latitude') latitude: number,
    @Args('assetCategory', { nullable: true }) assetCategory?: string
  ): Promise<any> {
    try {
      // Submit for verification
      const result = await this.submissionService.submitMockSPV({
        name,
        address,
        longitude,
        latitude,
        assetCategory
      });

      // Log submission event
      this.activityFeedService.logSubmissionEvent(result);

      // Log verification result
      this.activityFeedService.logVerificationEvent(result);

      return {
        submissionId: result.submissionId,
        spvName: result.spv.name,
        status: result.passed ? 'VERIFIED' : 'FAILED',
        abmScore: (result.abmScore.overallScore * 100).toFixed(0),
        abmDetails: {
          locationConsistency: (result.abmScore.locationConsistency * 100).toFixed(0),
          satelliteConfidence: (result.abmScore.satelliteConfidence * 100).toFixed(0),
          registryMatch: (result.abmScore.registryMatch * 100).toFixed(0)
        },
        satImageUrl: result.spv.satImageUrl,
        assetFingerprint: result.assetFingerprint,
        coordinates: {
          latitude: result.spv.latitude,
          longitude: result.spv.longitude
        },
        message: result.message,
        nextStep: result.nextStep
      };
    } catch (error) {
      return {
        submissionId: null,
        status: 'ERROR',
        message: `Failed to submit SPV: ${error.message}`
      };
    }
  }

  /**
   * GraphQL Mutation: Mint token from verified SPV
   *
   * Example:
   * mutation {
   *   mintTokenFromSPV(submissionId: "0x123...") {
   *     tokenAddress
   *     tokenName
   *     totalSupply
   *     transactionHash
   *     explorerUrl
   *     status
   *   }
   * }
   */
  @Mutation()
  async mintTokenFromSPV(@Args('submissionId') submissionId: string): Promise<any> {
    try {
      // Retrieve submission
      const submission = this.submissionService.getSubmission(submissionId);
      if (!submission) {
        throw new Error(`Submission not found: ${submissionId}`);
      }

      // Verify it passed
      if (!submission.passed) {
        throw new Error('Cannot mint token from failed verification');
      }

      // Mint token
      const minting = await this.tokenMinterService.mintTokenFromSubmission(submission);

      // Log minting event
      this.activityFeedService.logTokenMintingEvent(submission, minting);

      // If successful, log deployment confirmation
      if (minting.status !== 'FAILED') {
        this.activityFeedService.logTokenDeploymentConfirmed(minting);
      }

      return {
        success: minting.status !== 'FAILED',
        tokenAddress: minting.tokenAddress,
        tokenName: minting.tokenName,
        totalSupply: minting.totalSupply,
        transactionHash: minting.transactionHash,
        blockNumber: minting.blockNumber,
        explorerUrl: minting.explorerUrl,
        status: minting.status,
        message: minting.message
      };
    } catch (error) {
      return {
        success: false,
        status: 'ERROR',
        message: `Token minting failed: ${error.message}`
      };
    }
  }

  /**
   * GraphQL Query: Get SPV submission details
   *
   * Example:
   * query {
   *   getSubmission(submissionId: "0x123...") {
   *     spvName
   *     status
   *     abmScore
   *     satImageUrl
   *   }
   * }
   */
  @Query()
  async getSubmission(@Args('submissionId') submissionId: string): Promise<any> {
    const submission = this.submissionService.getSubmission(submissionId);
    if (!submission) {
      return null;
    }

    return {
      submissionId,
      spvName: submission.spv.name,
      address: submission.spv.address,
      coordinates: {
        latitude: submission.spv.latitude,
        longitude: submission.spv.longitude
      },
      satImageUrl: submission.spv.satImageUrl,
      assetFingerprint: submission.assetFingerprint,
      status: submission.passed ? 'VERIFIED' : 'FAILED',
      abmScore: (submission.abmScore.overallScore * 100).toFixed(0),
      abmReasoning: submission.abmScore.reasoning,
      message: submission.message,
      timestamp: submission.spv.timestamp
    };
  }

  /**
   * GraphQL Query: List verified submissions ready for minting
   *
   * Example:
   * query {
   *   getVerifiedSubmissions {
   *     submissionId
   *     spvName
   *     status
   *   }
   * }
   */
  @Query()
  async getVerifiedSubmissions(): Promise<any[]> {
    const submissions = this.submissionService.getVerifiedSubmissions();
    return submissions.map(s => ({
      submissionId: s.submissionId,
      spvName: s.spv.name,
      address: s.spv.address,
      abmScore: (s.abmScore.overallScore * 100).toFixed(0),
      satImageUrl: s.spv.satImageUrl,
      status: 'READY_FOR_MINTING'
    }));
  }

  /**
   * GraphQL Query: Get token minting result
   *
   * Example:
   * query {
   *   getTokenMinting(submissionId: "0x123...") {
   *     tokenAddress
   *     tokenName
   *     totalSupply
   *     explorerUrl
   *   }
   * }
   */
  @Query()
  async getTokenMinting(@Args('submissionId') submissionId: string): Promise<any> {
    const minting = this.tokenMinterService.getMintingResult(submissionId);
    if (!minting) {
      return null;
    }

    return {
      tokenAddress: minting.tokenAddress,
      tokenName: minting.tokenName,
      totalSupply: minting.totalSupply,
      transactionHash: minting.transactionHash,
      blockNumber: minting.blockNumber,
      explorerUrl: minting.explorerUrl,
      status: minting.status,
      message: minting.message,
      timestamp: minting.timestamp
    };
  }

  /**
   * GraphQL Query: Get activity feed
   *
   * Example:
   * query {
   *   getActivityFeed(limit: 50, offset: 0) {
   *     events {
   *       id
   *       type
   *       message
   *       timestamp
   *       txHash
   *       explorerUrl
   *     }
   *     total
   *     hasMore
   *   }
   * }
   */
  @Query()
  async getActivityFeed(
    @Args('limit', { nullable: true }) limit?: number,
    @Args('offset', { nullable: true }) offset?: number
  ): Promise<any> {
    const feed = this.activityFeedService.getActivityFeed(limit || 50, offset || 0);
    return {
      events: feed.events.map(e => ({
        id: e.id,
        type: e.type,
        message: e.message,
        assetName: e.assetName,
        timestamp: e.timestamp,
        status: e.status,
        txHash: e.txHash,
        explorerUrl: e.explorerUrl,
        details: e.details
      })),
      total: feed.total,
      hasMore: feed.hasMore
    };
  }

  /**
   * GraphQL Query: Get dashboard summary
   *
   * Example:
   * query {
   *   getDashboardSummary {
   *     totalSubmissions
   *     verifiedCount
   *     failedCount
   *     tokensMinted
   *     recentEvents { ... }
   *   }
   * }
   */
  @Query()
  async getDashboardSummary(): Promise<any> {
    const summary = this.activityFeedService.getDashboardSummary();
    return {
      totalSubmissions: summary.totalSubmissions,
      verifiedCount: summary.verifiedCount,
      failedCount: summary.failedCount,
      tokensMinted: summary.tokensMinted,
      recentEvents: summary.recentEvents.map(e => ({
        id: e.id,
        type: e.type,
        message: e.message,
        timestamp: e.timestamp,
        explorerUrl: e.explorerUrl
      }))
    };
  }

  /**
   * GraphQL Query: Get Sepolia provider info
   */
  @Query()
  async getProviderInfo(): Promise<any> {
    const info = this.tokenMinterService.getProviderInfo();
    return {
      chainId: info.chainId,
      chainName: 'Sepolia',
      walletAddress: info.walletAddress,
      connected: info.connected,
      explorerUrl: 'https://sepolia.etherscan.io'
    };
  }
}
