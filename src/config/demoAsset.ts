// Demo Asset Configuration
// Pre-configured mock SPV with real asset data for testing

export const DEMO_ASSET = {
    // SPV Details - Mock pattern triggers skip of legal wrapper
    spv: {
        spvName: 'DLF Cyber Hub Demo SPV',
        spvRegistrationNumber: 'DEMO-DLF-CYBER-HUB-2024',  // Mock pattern
        jurisdiction: 'Telangana',
        incorporationDate: '2024-01-01',
        registeredAddress: 'Gachibowli, Hyderabad, Telangana 500032',
        directors: ['Demo Director 1', 'Demo Director 2'],
        shareholderStructure: [
            { holder: 'Demo Shareholder 1', percentage: 60 },
            { holder: 'Demo Shareholder 2', percentage: 40 }
        ]
    },

    // Asset Details - REAL DATA
    assetName: 'DLF Cyber Hub',
    category: 'real-estate' as const,

    // Location - REAL COORDINATES
    location: {
        address: 'DLF Cyber City, Gachibowli',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postalCode: '500032',
        coordinates: {
            lat: 17.4435,  // Actual DLF Cyber Hub coordinates
            lng: 78.3772
        }
    },

    // Specifications - REAL DATA
    specifications: {
        size: 450000,  // 450,000 sq ft
        type: 'commercial',
        age: 12,
        condition: 'excellent' as const
    },

    // Financials - REALISTIC DATA
    financials: {
        currentRent: 4500000,      // ₹45 lakh/month
        expectedYield: 10.5,       // 10.5% annual yield
        annualExpenses: 12000000,  // ₹1.2 crore/year
        occupancyRate: 96,         // 96% occupied
        tenantCount: 45,
        leaseTermsMonths: 48,
        historicalCashFlow: []
    },

    // Valuation
    claimedValue: 500000000,    // ₹50 crore
    targetRaise: 100000000,     // ₹10 crore

    // Documents - Point to real evidence
    registryIds: ['DEMO-REG-001'],
    documentUrls: ['/evidence/registry.png'],
    imageUrls: ['/evidence/satellite.png', '/evidence/vision.png'],
    videoUrls: [],

    tokenizationIntent: 'Raise capital for expansion while maintaining operational control'
};

// Alternative mock SPVs for testing
export const MOCK_SPVS = {
    'MOCK-COMMERCIAL-BANGALORE': {
        name: 'Bangalore Tech Park Mock SPV',
        cin: 'MOCK-BLR-TECH-2024',
        location: { lat: 12.9716, lng: 77.5946 }
    },
    'MOCK-RESIDENTIAL-MUMBAI': {
        name: 'Mumbai Residential Complex Mock SPV',
        cin: 'MOCK-MUM-RES-2024',
        location: { lat: 19.0760, lng: 72.8777 }
    },
    'TEST-INDUSTRIAL-PUNE': {
        name: 'Pune Industrial Park Test SPV',
        cin: 'TEST-PUNE-IND-2024',
        location: { lat: 18.5204, lng: 73.8567 }
    }
};
