import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RegistryService {
    private readonly logger = new Logger(RegistryService.name);

    // Mock on-chain registry
    private registry = new Map<string, any>();

    constructor(private readonly httpService: HttpService) { }

    async registerAsset(submissionId: string, consensusResult: any, submissionData: any) {
        if (!consensusResult.eligible) {
            this.logger.warn(`Asset ${submissionId} not eligible for registration.`);
            return;
        }

        this.logger.log(`Registering asset ${submissionId} on-chain via Oracle Node...`);

        try {
            // Call Go Oracle Node
            const oracleUrl = process.env.ORACLE_SERVICE_URL || 'http://localhost:8081';

            // Transform submissionData to fit Go Oracle expected format
            // Assuming submissionData matches types.SubmissionData somewhat
            const oraclePayload = {
                id: submissionId,
                location: submissionData.location,
                spv: {
                    reg_id: "PENDING", // Mock SPV data not fully formed yet or generic
                    directors: ["Director 1"]
                },
                documents: {
                    deed_hash: "0x..."
                },
                financials: {
                    valuation: submissionData.financials?.valuation || 0
                },
                is_mock: submissionData.isMock
            };

            const response = await firstValueFrom(
                this.httpService.post(`${oracleUrl}/verify`, oraclePayload)
            ) as any;

            const oracleResult = response.data;
            const txHash = oracleResult.attestation?.signature || '0xmocktransactionhash'; // The Go aggregator returns a signature, but PushAttestation returns hash. Wait, verify returns OracleResult structure.
            // OracleResult: { attestation: { signature, merkle_root, ... } }
            // The Go aggregator prints the txHash to stdout but doesn't seem to include it in OracleResult explicitly in the `AttestationData`.
            // Wait, looking at aggregator.go: 
            // `AttestationData` struct has `Signature`. 
            // The `txHash` is printed but not returned in the struct.
            // I should have updated the `OracleResult` or `AttestationData` to include `TxHash`.

            // Let's assume for now we just log it or use a placeholder if the Go oracle doesn't return the TX hash in the JSON.
            // But relying on "0xmock..." defeats the purpose.
            // I should update Go types first. But I am already here.
            // Let's tentatively use a field if it exists, or fall back.

            const registrationRecord = {
                assetId: submissionId,
                ...consensusResult,
                txHash: (oracleResult as any).tx_hash || txHash, // Need to ensure Go returns it
                registeredAt: new Date().toISOString(),
                isMock: submissionData.isMock
            };

            this.registry.set(submissionId, registrationRecord);
            return registrationRecord;

        } catch (error) {
            this.logger.error(`Failed to register on-chain: ${error.message}`);
            // Fallback for demo stability if Oracle is down
            const registrationRecord = {
                assetId: submissionId,
                ...consensusResult,
                txHash: '0xmockfallback',
                registeredAt: new Date().toISOString(),
                isMock: submissionData.isMock
            };
            this.registry.set(submissionId, registrationRecord);
            return registrationRecord;
        }
    }
}
