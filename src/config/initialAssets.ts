import { AssetSubmission } from '../models/abmTypes';

export const INITIAL_ASSETS: Partial<AssetSubmission>[] = [
    {
        assetName: "DLF Cyber Hub",
        category: "real-estate",
        location: {
            address: "DLF Cyber City, Gachibowli",
            city: "Hyderabad",
            state: "Telangana",
            country: "India",
            postalCode: "500032",
            coordinates: { lat: 17.4435, lng: 78.3772 }
        },
        specifications: {
            size: 450000,
            type: "commercial",
            age: 12,
            condition: "excellent"
        },
        spv: {
            spvName: "DLF Cyber Hub Demo SPV",
            spvRegistrationNumber: "DEMO-DLF-CYBER-HUB-2024",
            jurisdiction: "Telangana",
            incorporationDate: "2024-01-01",
            registeredAddress: "Gachibowli, Hyderabad, Telangana 500032",
            directors: ["Demo Director 1", "Demo Director 2"],
            shareholderStructure: [{ holder: "Promoter Group", percentage: 100 }]
        },
        registryIds: ["DEMO-REG-HYD-001", "DEMO-TAX-HYD-001", "DEMO-TITLE-HYD-001"],
        documentUrls: [
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "https://www.africau.edu/images/default/sample.pdf",
            "https://www.clickdimensions.com/links/TestPDFfile.pdf"
        ],
        imageUrls: [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
            "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800",
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"
        ],
        videoUrls: [],
        financials: {
            currentRent: 4500000,
            expectedYield: 10.5,
            annualExpenses: 12000000,
            occupancyRate: 96,
            tenantCount: 45,
            leaseTermsMonths: 48,
            historicalCashFlow: []
        },
        claimedValue: 500000000,
        targetRaise: 100000000,
        tokenizationIntent: "Raise capital for expansion while maintaining operational control.",
        submitterId: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        signature: "0xmocksignature"
    },
    {
        assetName: "Prestige Tech Park",
        category: "real-estate",
        location: {
            address: "Outer Ring Road, Kadubeesanahalli",
            city: "Bangalore",
            state: "Karnataka",
            country: "India",
            postalCode: "560103",
            coordinates: { lat: 12.9352, lng: 77.6905 }
        },
        specifications: {
            size: 350000,
            type: "commercial",
            age: 8,
            condition: "excellent"
        },
        spv: {
            spvName: "Prestige Tech Park Demo SPV",
            spvRegistrationNumber: "MOCK-PRESTIGE-BLR-2024",
            jurisdiction: "Karnataka",
            incorporationDate: "2024-02-15",
            registeredAddress: "Outer Ring Road, Bangalore, Karnataka 560103",
            directors: ["Tech Director A", "Tech Director B"],
            shareholderStructure: [{ holder: "Tech Park Holdings", percentage: 100 }]
        },
        registryIds: ["MOCK-REG-BLR-002", "MOCK-TAX-BLR-002", "MOCK-TITLE-BLR-002"],
        documentUrls: [
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "https://www.africau.edu/images/default/sample.pdf",
            "https://www.clickdimensions.com/links/TestPDFfile.pdf"
        ],
        imageUrls: [
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
        ],
        videoUrls: [],
        financials: {
            currentRent: 3800000,
            expectedYield: 9.8,
            annualExpenses: 9500000,
            occupancyRate: 94,
            tenantCount: 38,
            leaseTermsMonths: 36,
            historicalCashFlow: []
        },
        claimedValue: 420000000,
        targetRaise: 85000000,
        tokenizationIntent: "Provide liquidity for institutional investors.",
        submitterId: "0x8B3c5F8d9A2E1b4C7D6E5F4A3B2C1D0E9F8A7B6C",
        walletAddress: "0x8B3c5F8d9A2E1b4C7D6E5F4A3B2C1D0E9F8A7B6C",
        signature: "0xmocksignature"
    },
    {
        assetName: "Phoenix Marketcity Retail Wing",
        category: "real-estate",
        location: {
            address: "LBS Marg, Kurla West",
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
            postalCode: "400070",
            coordinates: { lat: 19.0825, lng: 72.8885 }
        },
        specifications: {
            size: 280000,
            type: "commercial",
            age: 6,
            condition: "excellent"
        },
        spv: {
            spvName: "Phoenix Retail Demo SPV",
            spvRegistrationNumber: "TEST-PHOENIX-MUM-2024",
            jurisdiction: "Maharashtra",
            incorporationDate: "2024-03-10",
            registeredAddress: "LBS Marg, Mumbai, Maharashtra 400070",
            directors: ["Retail Director 1", "Retail Director 2"],
            shareholderStructure: [{ holder: "Phoenix Group", percentage: 100 }]
        },
        registryIds: ["TEST-REG-MUM-003", "TEST-TAX-MUM-003", "TEST-TITLE-MUM-003"],
        documentUrls: [
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "https://www.africau.edu/images/default/sample.pdf",
            "https://www.clickdimensions.com/links/TestPDFfile.pdf"
        ],
        imageUrls: [
            "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800",
            "https://images.unsplash.com/photo-1567958451986-2de427a4a0be?w=800",
            "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800",
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
        ],
        videoUrls: [],
        financials: {
            currentRent: 5200000,
            expectedYield: 12.2,
            annualExpenses: 15000000,
            occupancyRate: 98,
            tenantCount: 62,
            leaseTermsMonths: 60,
            historicalCashFlow: []
        },
        claimedValue: 580000000,
        targetRaise: 120000000,
        tokenizationIntent: "Democratize access to premium Mumbai retail real estate.",
        submitterId: "0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B",
        walletAddress: "0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B",
        signature: "0xmocksignature"
    },
    {
        assetName: "Lodha World Towers Residential",
        category: "real-estate",
        location: {
            address: "Lower Parel, Senapati Bapat Marg",
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
            postalCode: "400013",
            coordinates: { lat: 19.0010, lng: 72.8263 }
        },
        specifications: {
            size: 180000,
            type: "residential",
            age: 5,
            condition: "excellent"
        },
        spv: {
            spvName: "Lodha Residential Demo SPV",
            spvRegistrationNumber: "DEMO-LODHA-MUM-2024",
            jurisdiction: "Maharashtra",
            incorporationDate: "2024-04-01",
            registeredAddress: "Lower Parel, Mumbai, Maharashtra 400013",
            directors: ["Residential Director A", "Residential Director B"],
            shareholderStructure: [{ holder: "Lodha Group", percentage: 100 }]
        },
        registryIds: ["DEMO-REG-MUM-004", "DEMO-TAX-MUM-004", "DEMO-TITLE-MUM-004"],
        documentUrls: [
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "https://www.africau.edu/images/default/sample.pdf",
            "https://www.clickdimensions.com/links/TestPDFfile.pdf"
        ],
        imageUrls: [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800"
        ],
        videoUrls: [],
        financials: {
            currentRent: 3200000,
            expectedYield: 8.5,
            annualExpenses: 8000000,
            occupancyRate: 92,
            tenantCount: 28,
            leaseTermsMonths: 24,
            historicalCashFlow: []
        },
        claimedValue: 380000000,
        targetRaise: 75000000,
        tokenizationIntent: "Enable fractional ownership of luxury residential real estate.",
        submitterId: "0x9F8E7D6C5B4A3928171605F4E3D2C1B0A9F8E7D6",
        walletAddress: "0x9F8E7D6C5B4A3928171605F4E3D2C1B0A9F8E7D6",
        signature: "0xmocksignature"
    },
    {
        assetName: "Cyber Towers IT Complex",
        category: "real-estate",
        location: {
            address: "HITEC City, Madhapur",
            city: "Hyderabad",
            state: "Telangana",
            country: "India",
            postalCode: "500081",
            coordinates: { lat: 17.4485, lng: 78.3908 }
        },
        specifications: {
            size: 320000,
            type: "commercial",
            age: 15,
            condition: "good"
        },
        spv: {
            spvName: "Cyber Towers Demo SPV",
            spvRegistrationNumber: "MOCK-CYBER-HYD-2024",
            jurisdiction: "Telangana",
            incorporationDate: "2024-05-20",
            registeredAddress: "HITEC City, Hyderabad, Telangana 500081",
            directors: ["IT Director 1", "IT Director 2"],
            shareholderStructure: [{ holder: "Telangana Govt", percentage: 100 }]
        },
        registryIds: ["MOCK-REG-HYD-005", "MOCK-TAX-HYD-005", "MOCK-TITLE-HYD-005"],
        documentUrls: [
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "https://www.africau.edu/images/default/sample.pdf",
            "https://www.clickdimensions.com/links/TestPDFfile.pdf"
        ],
        imageUrls: [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"
        ],
        videoUrls: [],
        financials: {
            currentRent: 2800000,
            expectedYield: 9.2,
            annualExpenses: 7500000,
            occupancyRate: 88,
            tenantCount: 32,
            leaseTermsMonths: 36,
            historicalCashFlow: []
        },
        claimedValue: 340000000,
        targetRaise: 68000000,
        tokenizationIntent: "Tokenize established IT park with stable tenant base.",
        submitterId: "0x5C4B3A2918273645F6E7D8C9B0A1F2E3D4C5B6A7",
        walletAddress: "0x5C4B3A2918273645F6E7D8C9B0A1F2E3D4C5B6A7",
        signature: "0xmocksignature"
    }
];
