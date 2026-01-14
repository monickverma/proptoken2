import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConsensusService {
    private readonly logger = new Logger(ConsensusService.name);

    calculateScore(oracleResults: any, abmResults: any) {
        this.logger.log('Calculating consensus score...');

        const existenceScore = oracleResults.existence?.score || 0;
        const ownershipProb = oracleResults.ownership?.probability || 0;
        // Map fraud_score from ABM (0-1) to percentage (0-100) if needed, or just use as is
        const fraudData = abmResults.fraud;
        const fraudLikelihood = (fraudData?.fraud_score || 0) * 100; // Convert 0.05 to 5.0 if scale is 0-1

        // Hard Rules (adjusted for demo)
        const isEligible =
            existenceScore >= 0.7 && // Lowered from 0.9 for demo
            ownershipProb >= 0.7 &&  // Lowered from 0.8 for demo
            fraudLikelihood <= 5.0;  // Threshold 5%

        return {
            eligible: isEligible,
            scores: {
                existence: existenceScore,
                ownership: ownershipProb,
                fraud: fraudLikelihood,
            },
            timestamp: new Date().toISOString()
        };
    }
}
