# Mock SPV Tokenization Flow - Complete Implementation Guide

## Overview

This document describes the **end-to-end mock SPV tokenization pipeline** that enables:

1. **Mock SPV Creation** with lenient ABM scoring (40% threshold)
2. **Satellite Imagery Verification** via Yandex Static Maps API
3. **Asset Fingerprinting** with cryptographic proofs
4. **Token Minting** on Sepolia testnet
5. **Activity Feed Tracking** with transaction monitoring

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. MOCK SPV SUBMISSION                                              │
│    - Name, Address, Coordinates (longitude, latitude)               │
│    - Category: COMMERCIAL_REAL_ESTATE                              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 2. SATELLITE IMAGERY VERIFICATION                                   │
│    - Fetch from Yandex Static Maps API (FREE TIER)                 │
│    - URL: https://static-maps.yandex.ru/1.x/                      │
│    - Confirms physical asset existence                             │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 3. MOCK REGISTRY DATA GENERATION                                    │
│    - Simulates MCA (Ministry of Corporate Affairs) response        │
│    - Includes entity type, registration date, status               │
│    - Coordinates validation                                        │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 4. ABM SCORING (LENIENT FOR MOCKS)                                  │
│    - Location Consistency: 95%                                      │
│    - Satellite Confidence: 92%                                      │
│    - Registry Match: 95% (mocked)                                   │
│    - Fraud Risk: 5% (baseline)                                      │
│    - WEIGHTED SCORE + 20% BOOST FOR TEST CATEGORY                  │
│    - THRESHOLD: 40% (vs 60% for real assets)                       │
│    - RESULT: ✅ PASS for all properly formatted mocks              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 5. ASSET FINGERPRINTING                                             │
│    - Generate cryptographic hash of SPV data                       │
│    - Hash includes: name, address, coordinates, timestamp          │
│    - This fingerprint is immutable on-chain                        │
│    - Prevents tampering with submitted asset claims                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 6. TOKEN MINTING (ON SEPOLIA)                                       │
│    - Deploy RWASecurityToken (ERC-3643 compliant)                  │
│    - Initial supply: 1000 tokens (18 decimals)                     │
│    - Token symbol: Auto-generated from SPV name                    │
│    - TokenFactory creates token instance                           │
│    - Links to asset fingerprint on-chain                           │
│    - Status: PENDING (if no wallet funds)                          │
│    - Status: CONFIRMED (if mined)                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 7. ACTIVITY FEED LOGGING                                            │
│    - SPV_SUBMITTED: Log coordinates + satellite URL                │
│    - SPV_VERIFIED: Log ABM scores + fingerprint                    │
│    - TOKEN_MINTED: Log token address + initial supply              │
│    - TOKEN_DEPLOYED: Log transaction hash + block number           │
│    - All events include BaseScan/Etherscan URLs                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Setup

### Prerequisites

```bash
Node.js 18+
Go 1.21+
Foundry (for smart contracts)
```

### 1. Install Backend Dependencies

```bash
cd proptoken-autonomous/backend
npm install --legacy-peer-deps
```

### 2. Set Up Environment Variables

Create `.env` in `proptoken-autonomous/backend/`:

```bash
# Sepolia RPC (use Infura, Alchemy, or QuickNode)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Private key for token deployment (optional - for real on-chain deployment)
# NEVER commit this to repo
PRIVATE_KEY_SEPOLIA=0x0000000000000000000000000000000000000000000000000000000000000001

# NestJS config
NEST_ENV=development
PORT=3001
```

### 3. Start the Backend

```bash
cd proptoken-autonomous/backend
npm start
```

Server will start on `http://localhost:3001`

### 4. Access GraphQL Playground

Navigate to: `http://localhost:3001/graphql`

---

## Testing: Mock SPV → Token Minting Flow

### Test 1: Submit Mock SPV

**GraphQL Mutation:**

```graphql
mutation {
  submitMockSPV(
    name: "DLF Cyber Hub Gurugram"
    address: "Plot No. 123, Sector 43, Gurugram, Haryana"
    longitude: 77.0123
    latitude: 28.4567
    assetCategory: "COMMERCIAL_REAL_ESTATE"
  ) {
    submissionId
    spvName
    status
    abmScore
    abmDetails {
      locationConsistency
      satelliteConfidence
      registryMatch
    }
    satImageUrl
    coordinates {
      latitude
      longitude
    }
    assetFingerprint
    message
    nextStep
  }
}
```

**Expected Response:**

```json
{
  "data": {
    "submitMockSPV": {
      "submissionId": "0x7a3f2c8e9b1d4a5f6c7e8f9a0b1c2d3e4f5a6b7c",
      "spvName": "DLF Cyber Hub Gurugram",
      "status": "VERIFIED",
      "abmScore": "92",
      "abmDetails": {
        "locationConsistency": "95",
        "satelliteConfidence": "92",
        "registryMatch": "95"
      },
      "satImageUrl": "https://static-maps.yandex.ru/1.x/?ll=77.0123,28.4567&z=18&size=450,450&layer=sat&lang=en",
      "coordinates": {
        "latitude": 28.4567,
        "longitude": 77.0123
      },
      "assetFingerprint": "0x3a2f5c8e9b1d4a5f6c7e8f9a0b1c2d3e4f5a6b7c",
      "message": "✅ Mock SPV \"DLF Cyber Hub Gurugram\" scored 92% (threshold: 40%). Lenient scoring applied for test assets. Location: (28.4567, 77.0123). Satellite imagery verified.",
      "nextStep": "READY_FOR_TOKEN_MINT"
    }
  }
}
```

### Test 2: Retrieve Submission Details

**GraphQL Query:**

```graphql
query {
  getSubmission(submissionId: "0x7a3f2c8e9b1d4a5f6c7e8f9a0b1c2d3e4f5a6b7c") {
    spvName
    address
    satImageUrl
    status
    abmScore
    abmReasoning
    coordinates {
      latitude
      longitude
    }
  }
}
```

### Test 3: Get Verified Submissions Ready for Minting

**GraphQL Query:**

```graphql
query {
  getVerifiedSubmissions {
    submissionId
    spvName
    abmScore
    status
  }
}
```

### Test 4: Mint Token from SPV

**GraphQL Mutation:**

```graphql
mutation {
  mintTokenFromSPV(submissionId: "0x7a3f2c8e9b1d4a5f6c7e8f9a0b1c2d3e4f5a6b7c") {
    success
    tokenAddress
    tokenName
    totalSupply
    transactionHash
    blockNumber
    explorerUrl
    status
    message
  }
}
```

**Expected Response (Simulated Mode - No Wallet Funds):**

```json
{
  "data": {
    "mintTokenFromSPV": {
      "success": true,
      "tokenAddress": "0x4b8e9c7f5a3d2c1e9f8a7b6c5d4e3f2a1b0c9d8e",
      "tokenName": "DLF Cyber Hub Gurugram Token",
      "totalSupply": "1000",
      "transactionHash": "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b",
      "blockNumber": 6200123,
      "explorerUrl": "https://sepolia.etherscan.io/token/0x4b8e9c7f5a3d2c1e9f8a7b6c5d4e3f2a1b0c9d8e",
      "status": "SUCCESS",
      "message": "✅ Token \"DLF Cyber Hub Gurugram Token\" simulated (deployment requires funded wallet). Ready for real deployment. Address: 0x4b8e9c7f5a3d2c1e9f8a7b6c5d4e3f2a1b0c9d8e"
    }
  }
}
```

### Test 5: Get Activity Feed

**GraphQL Query:**

```graphql
query {
  getActivityFeed(limit: 50, offset: 0) {
    events {
      id
      type
      message
      assetName
      timestamp
      status
      txHash
      explorerUrl
    }
    total
    hasMore
  }
}
```

**Sample Response:**

```json
{
  "data": {
    "getActivityFeed": {
      "events": [
        {
          "id": "evt_1705482342123_a7f8c9d",
          "type": "SPV_SUBMITTED",
          "message": "📋 SPV \"DLF Cyber Hub Gurugram\" submitted for verification from (28.4567, 77.0123)",
          "assetName": "DLF Cyber Hub Gurugram",
          "timestamp": 1705482342123,
          "status": "CONFIRMED",
          "txHash": null,
          "explorerUrl": null
        },
        {
          "id": "evt_1705482343456_b8f9c0a",
          "type": "SPV_VERIFIED",
          "message": "✅ Mock SPV \"DLF Cyber Hub Gurugram\" scored 92% (threshold: 40%). Lenient scoring applied...",
          "assetName": "DLF Cyber Hub Gurugram",
          "timestamp": 1705482343456,
          "status": "CONFIRMED",
          "txHash": null,
          "explorerUrl": null
        },
        {
          "id": "evt_1705482344789_c9a0d1b",
          "type": "TOKEN_MINTED",
          "message": "✨ Token \"DLF Cyber Hub Gurugram Token\" minting initiated. Supply: 1000 tokens. Status: SUCCESS",
          "assetName": "DLF Cyber Hub Gurugram",
          "timestamp": 1705482344789,
          "status": "PENDING",
          "txHash": "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b",
          "explorerUrl": "https://sepolia.etherscan.io/token/0x4b8e9c7f5a3d2c1e9f8a7b6c5d4e3f2a1b0c9d8e"
        }
      ],
      "total": 3,
      "hasMore": false
    }
  }
}
```

### Test 6: Get Dashboard Summary

**GraphQL Query:**

```graphql
query {
  getDashboardSummary {
    totalSubmissions
    verifiedCount
    failedCount
    tokensMinted
    recentEvents {
      id
      type
      message
      timestamp
      explorerUrl
    }
  }
}
```

### Test 7: Get Provider Info (Sepolia Connection)

**GraphQL Query:**

```graphql
query {
  getProviderInfo {
    chainId
    chainName
    walletAddress
    connected
    explorerUrl
  }
}
```

---

## Key Features Implemented

✅ **Mock SPV Creation**
- Accepts name, address, coordinates
- Generates pseudo-random SPV entity ID
- Creates registry mock data

✅ **Satellite Imagery Verification**
- Uses Yandex Static Maps API (free tier)
- Returns satellite imagery URL at coordinates
- Zoom level 18 (street-level detail)
- URL format: `https://static-maps.yandex.ru/1.x/?ll={lon},{lat}&z=18&size=450,450&layer=sat`

✅ **Lenient ABM Scoring**
- Mock SPVs: 40% threshold (vs 60% for real)
- 20% score boost for TEST category
- Breakdown: Location (25%) + Satellite (35%) + Registry (25%) + Fraud Risk (15%)
- All properly formatted mocks pass

✅ **Asset Fingerprinting**
- Cryptographic hash of SPV data
- Immutable on-chain
- Links token to specific asset

✅ **Token Minting on Sepolia**
- Deploys RWASecurityToken (ERC-3643)
- Initial supply: 1000 tokens
- Simulated mode (no funds) + real mode (funded wallet)
- Token name auto-generated
- Symbol auto-generated from SPV name

✅ **Activity Feed**
- Logs all events: submission, verification, minting, deployment
- Includes transaction hashes and Etherscan URLs
- Supports filtering by type and asset
- Dashboard summary with statistics

✅ **Sepolia Integration**
- RPC endpoint via Infura/Alchemy
- Wallet management with private key
- Block number tracking
- Explorer URLs for all transactions

---

## Advanced Customization

### Lower ABM Threshold Further

Edit `ABM_SERVICE.ts`:

```typescript
private readonly MOCK_THRESHOLD = 0.2; // Even more lenient (20%)
```

### Add Real Coordinates

```graphql
mutation {
  submitMockSPV(
    name: "Ambience Mall"
    longitude: 77.0456
    latitude: 28.4789
  ) { ... }
}
```

### Change Initial Token Supply

Edit `TOKEN_MINTER_SERVICE.ts`:

```typescript
const initialSupply = ethers.parseUnits('5000', 18); // 5000 tokens
```

---

## Troubleshooting

### "SEPOLIA_RPC_URL not set"

Set environment variable in `.env`:

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### Token deployment says "requires funded wallet"

You're in simulation mode (no wallet funds). To fund wallet:
1. Get wallet address from `getProviderInfo` query
2. Get Sepolia ETH from faucet: https://www.alchemy.com/faucets/ethereum
3. Set `PRIVATE_KEY_SEPOLIA` in `.env`
4. Retry minting

### Activity feed not showing events

Clear and restart:

```bash
# In backend:
npm start
```

---

## Production Roadmap

**Next Steps:**
1. Deploy TokenFactory to Sepolia
2. Integrate real wallet funding (Circle/Stripe)
3. Add KYC/AML provider (Onfido/Persona)
4. Enable WebSocket real-time updates
5. Deploy to mainnet (Base/Arbitrum)

---

## Resources

- [Yandex Static Maps API](https://yandex.com/dev/maps/staticapi/)
- [Sepolia Testnet Faucet](https://sepoliafaucet.com/)
- [BaseScan Explorer](https://sepolia.etherscan.io/)
- [ERC-3643 Security Tokens](https://erc3643.org/)
- [ERC-7540 Redemption](https://ethereum.org/en/developers/)

---

**Built with ❤️ for autonomous RWA tokenization**
