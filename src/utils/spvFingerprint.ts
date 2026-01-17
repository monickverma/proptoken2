// Mock SPV Detection Utility
// Detects if an SPV is a test/demo SPV based on CIN fingerprint pattern

export interface SPVFingerprint {
    isMockSPV: boolean;
    skipLegalWrapper: boolean;
    useRealOracle: boolean;
    useRealABM: boolean;
    useRealTokenization: boolean;
    pattern: string | null;
}

/**
 * Detects if an SPV is a mock/demo SPV based on CIN pattern
 * Mock SPV patterns:
 * - Starts with "MOCK-"
 * - Starts with "DEMO-"
 * - Starts with "TEST-"
 */
export function detectSPVFingerprint(cin: string): SPVFingerprint {
    const upperCIN = cin.toUpperCase().trim();

    // Check for mock patterns
    const mockPatterns = ['MOCK-', 'DEMO-', 'TEST-'];
    const matchedPattern = mockPatterns.find(pattern => upperCIN.startsWith(pattern));

    const isMockSPV = !!matchedPattern;

    return {
        isMockSPV,
        skipLegalWrapper: isMockSPV,      // Skip legal checks for mock SPVs
        useRealOracle: true,               // ALWAYS use real oracle
        useRealABM: true,                  // ALWAYS use real ABM
        useRealTokenization: true,         // ALWAYS use real tokenization
        pattern: matchedPattern || null
    };
}

/**
 * Check if SPV requires legal wrapper verification
 */
export function requiresLegalWrapper(cin: string): boolean {
    const fingerprint = detectSPVFingerprint(cin);
    return !fingerprint.skipLegalWrapper;
}

/**
 * Get verification mode for SPV
 */
export function getVerificationMode(cin: string): 'FULL' | 'SKIP_LEGAL' {
    const fingerprint = detectSPVFingerprint(cin);
    return fingerprint.skipLegalWrapper ? 'SKIP_LEGAL' : 'FULL';
}

/**
 * Log SPV detection for debugging
 */
export function logSPVDetection(cin: string): void {
    const fingerprint = detectSPVFingerprint(cin);

    console.log('='.repeat(60));
    console.log('SPV FINGERPRINT DETECTION');
    console.log('='.repeat(60));
    console.log(`CIN: ${cin}`);
    console.log(`Is Mock SPV: ${fingerprint.isMockSPV ? 'YES' : 'NO'}`);

    if (fingerprint.isMockSPV) {
        console.log(`Pattern Matched: ${fingerprint.pattern}`);
        console.log(`\n✅ REAL VERIFICATION ENABLED:`);
        console.log(`   - Oracle Truth Layer: REAL`);
        console.log(`   - ABM Market Intelligence: REAL`);
        console.log(`   - Tokenization: REAL (Testnet)`);
        console.log(`   - DeFi Operations: REAL`);
        console.log(`\n⏭️  SKIPPED:`);
        console.log(`   - Legal Wrapper Formation: MOCKED`);
        console.log(`   - SPV Incorporation: MOCKED`);
    } else {
        console.log(`\n✅ FULL VERIFICATION MODE`);
        console.log(`   - All steps including legal wrapper`);
    }
    console.log('='.repeat(60));
}
