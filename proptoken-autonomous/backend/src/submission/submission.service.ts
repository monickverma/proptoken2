import { Injectable, Logger } from '@nestjs/common';
import { CreateSubmissionDto, AssetCategory } from './dto/create-submission.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';
import { v4 as uuidv4 } from 'uuid';
import { OracleService } from '../oracle/oracle.service';
import { ABMService } from '../abm/abm.service';
import { ConsensusService } from '../consensus/consensus.service';
import { RegistryService } from '../registry/registry.service';
import { LegalWorkflowOrchestrator } from '../legal-workflow/legal-workflow.orchestrator';

@Injectable()
export class SubmissionService {
    private readonly logger = new Logger(SubmissionService.name);

    // In-memory store
    private submissions = new Map<string, any>();

    constructor(
        private readonly oracleService: OracleService,
        private readonly abmService: ABMService,
        private readonly consensusService: ConsensusService,
        private readonly registryService: RegistryService,
        private readonly legalWorkflowOrchestrator: LegalWorkflowOrchestrator,
    ) { }

    async create(createSubmissionDto: CreateSubmissionDto): Promise<SubmissionResponseDto> {
        const isMock = createSubmissionDto.category === AssetCategory.TEST || (createSubmissionDto.location?.city || '').includes('Mock');
        const submissionId = isMock ? `MOCK-${uuidv4()}` : uuidv4();
        const timestamp = new Date().toISOString();

        // Deterministic mock fingerprint if isMock
        const mockFingerprint = isMock ? '0x74657374' + uuidv4().replace(/-/g, '') : null;

        const submission = {
            id: submissionId,
            ...createSubmissionDto,
            status: 'RECEIVED',
            timestamp,
            isMock,
            mockFingerprint, // Store likely fingerprint for verification
            verificationStatus: {
                oracle: 'PENDING',
                abm: 'PENDING',
                consensus: 'PENDING',
                legal: 'PENDING'
            },
            results: {
                oracle: null,
                abm: null,
                consensus: null
            }
        };

        this.submissions.set(submissionId, submission);
        this.logger.log(`Submission received: ${submissionId}`);

        // Trigger async verification
        this.startVerificationProcess(submissionId);

        return {
            submissionId,
            status: 'RECEIVED',
            timestamp
        };
    }

    getSubmission(id: string) {
        return this.submissions.get(id);
    }

    getAll() {
        return Array.from(this.submissions.values());
    }

    // Orchestrator method
    private async startVerificationProcess(id: string) {
        this.logger.log(`Starting verification for ${id}...`);
        const submission = this.submissions.get(id);
        if (!submission) return;

        try {
            // 1. Oracle Verification
            this.updateStatus(id, 'oracle', 'IN_PROGRESS');
            const oracleResult = await this.oracleService.verify(submission);

            submission.results.oracle = oracleResult;
            this.updateStatus(id, 'oracle', 'DONE');
            this.logger.log(`Oracle verification complete for ${id}`);

            // 2. ABM Analysis
            this.updateStatus(id, 'abm', 'IN_PROGRESS');

            const abmMarket = await this.abmService.analyzeMarket(
                { specifications: submission.specifications, type: submission.category },
                submission.location,
                submission.financials,
                oracleResult
            );

            const abmFraud = await this.abmService.analyzeFraud(
                { specifications: submission.specifications, type: submission.category },
                submission.financials,
                oracleResult
            );

            submission.results.abm = { market: abmMarket, fraud: abmFraud };
            this.updateStatus(id, 'abm', 'DONE');
            this.logger.log(`ABM analysis complete for ${id}`);

            // 3. Consensus
            this.updateStatus(id, 'consensus', 'CALCULATING');

            const consensusResult = this.consensusService.calculateScore(oracleResult, { market: abmMarket, fraud: abmFraud });

            submission.results.consensus = consensusResult;
            this.updateStatus(id, 'consensus', consensusResult.eligible ? 'ELIGIBLE' : 'REJECTED');

            submission.status = consensusResult.eligible ? 'VERIFIED' : 'REJECTED';
            this.submissions.set(id, submission);

            this.logger.log(`Consensus reached for ${id}: ${consensusResult.eligible ? 'ELIGIBLE' : 'REJECTED'}`);

            // 4. Registry & Legal Workflow
            if (consensusResult.eligible) {
                await this.registryService.registerAsset(id, consensusResult, submission);

                // Trigger STEP 2: Legal Wrapper Workflow
                this.logger.log(`Triggering Legal Workflow for asset ${id}`);
                this.updateStatus(id, 'legal', 'IN_PROGRESS');

                const workflowId = await this.legalWorkflowOrchestrator.startWorkflow(id);

                // In a real system, we'd poll or use events. 
                // Here we'll just check if it's completed for the mock.
                const status = this.legalWorkflowOrchestrator.getWorkflowStatus(workflowId);
                if (status && status.status === 'COMPLETED') {
                    this.updateStatus(id, 'legal', 'DONE');
                }
            }

        } catch (error) {
            this.logger.error(`Verification failed for ${id}`, error);
            this.updateStatus(id, 'oracle', 'FAILED');
        }
    }

    private updateStatus(id: string, stage: string, status: string) {
        const submission = this.submissions.get(id);
        if (submission) {
            submission.verificationStatus[stage] = status;
            this.submissions.set(id, submission);
        }
    }
}
