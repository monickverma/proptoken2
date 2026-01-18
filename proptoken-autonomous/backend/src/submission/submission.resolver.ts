import { Resolver, Query, Mutation, Args, ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { SubmissionService } from './submission.service';
import { ActivityFeedService, ActivityType } from '../activity/activity-feed.service'; // Adjust path if needed
import { AssetCategory } from './dto/create-submission.dto';

@ObjectType()
class MockSPVResponse {
    @Field()
    submissionId: string;

    @Field()
    status: string;

    @Field(() => Float, { nullable: true })
    abmScore: number;

    @Field({ nullable: true })
    satImageUrl: string;

    @Field({ nullable: true })
    assetFingerprint: string;

    @Field({ nullable: true })
    nextStep: string;
}

@ObjectType()
class TokenResponse {
    @Field({ nullable: true })
    tokenAddress: string;

    @Field({ nullable: true })
    tokenName: string;

    @Field({ nullable: true })
    totalSupply: string;

    @Field({ nullable: true })
    explorerUrl: string;
}

@ObjectType()
class ActivityEvent {
    @Field()
    type: string;

    @Field()
    message: string;

    @Field({ nullable: true })
    explorerUrl: string;
}

@ObjectType()
class ActivityFeedResponse {
    @Field(() => [ActivityEvent])
    events: ActivityEvent[];
}

@Resolver()
export class SubmissionResolver {
    constructor(
        private readonly submissionService: SubmissionService,
        private readonly activityFeedService: ActivityFeedService
    ) { }

    @Mutation(() => MockSPVResponse)
    async submitMockSPV(
        @Args('name') name: string,
        @Args('address') address: string,
        @Args('longitude') longitude: number,
        @Args('latitude') latitude: number
    ) {
        // Construct the DTO from inputs
        const dto: any = {
            spvName: name,
            category: AssetCategory.TEST,
            location: {
                address,
                city: 'Mock City', // Default for mock
                state: 'Mock State',
                country: 'Mockland',
                coordinates: { lat: latitude, lng: longitude }
            },
            specifications: { size: 1000, type: 'commercial' }, // Defaults
            financials: { expectedYield: 8.5, expenses: 0, cashFlow: 100000 },
            registryIds: ['MOCK-REG-001'],
            did: 'did:ethr:mock',
            walletSignature: '0xmocksignature',
            tokenizationIntent: 'Demo'
        };

        const result = await this.submissionService.create(dto);

        // In this implementation, verification is async. 
        // We'll return the initial status or wait a bit if we want to show immediate verification.
        // For the demo "Mutation: Submit Mock SPV -> returns VERIFIED", we might want to wait.
        // But create() is async only for initiation.
        // However, since everything is in-memory and fast, we can try to fetch the updated state after a short delay
        // or just return "RECEIVED" and let the frontend poll.
        // The user example shows "status: VERIFIED".
        // I'll add a small delay to allow the async process (which calls verify) to likely complete.

        await new Promise(r => setTimeout(r, 1500));
        const updated = this.submissionService.getSubmission(result.submissionId);

        return {
            submissionId: result.submissionId,
            status: updated ? updated.status : 'RECEIVED',
            abmScore: updated?.results?.consensus?.scores?.existence * 100 || 0, // Mapping existence score to abmScore for display
            satImageUrl: 'https://static-maps.yandex.ru/1.x/?l=sat&ll=' + longitude + ',' + latitude + '&z=17', // Mock URL
            assetFingerprint: updated?.mockFingerprint,
            nextStep: updated?.status === 'VERIFIED' ? 'READY_FOR_TOKEN_MINT' : 'PENDING_VERIFICATION'
        };
    }

    @Mutation(() => TokenResponse)
    async mintTokenFromSPV(@Args('submissionId') submissionId: string) {
        // The service logic auto-mints. We just fetch the result.
        const submission = this.submissionService.getSubmission(submissionId);
        if (!submission || !submission.results.token) {
            return {
                tokenAddress: null,
                tokenName: null,
                totalSupply: null,
                explorerUrl: null
            };
        }
        return submission.results.token;
    }

    @Query(() => ActivityFeedResponse)
    async getActivityFeed(@Args('limit', { type: () => Int, defaultValue: 20 }) limit: number) {
        const events = this.activityFeedService.getFeed(limit);
        return { events };
    }
}
