# PropToken - Autonomous RWA Tokenization Platform

A comprehensive Real-World Asset (RWA) tokenization platform featuring autonomous verification, legal automation, and compliant security tokens.

## 🏗️ Architecture Overview

This platform consists of 4 major components:

### 1. **Frontend (React + Vite)**
- Asset submission interface
- Marketplace for fractional ownership
- Oracle evidence vault (satellite imagery, registries)
- Real-time verification status tracking

### 2. **Autonomous Backend (NestJS)**
- Multi-oracle verification system
- Agent-Based Modeling (ABM) for fraud detection
- Consensus engine for eligibility scoring
- Legal workflow orchestration

### 3. **Smart Contracts (Foundry/Solidity)**
- `AssetRegistry.sol` - Immutable asset fingerprints
- `RWASecurityToken.sol` - ERC-3643 compliant security tokens
- `AsyncRedemptionController.sol` - ERC-7540 redemption logic
- `TokenFactory.sol` - Automated token deployment

### 4. **Oracle Network (Go)**
- Satellite imagery verification (OpenStreetMap/Yandex)
- Computer vision analysis (mocked for free tier)
- Corporate registry validation (MCA)
- Merkle proof generation & ECDSA signing
- On-chain attestation publishing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Go 1.21+
- Foundry (for smart contracts)

### Installation

```bash
# 1. Install dependencies
npm install
cd proptoken-autonomous/backend && npm install
cd ../../oracle-network && go mod download

# 2. Start all services (see STARTUP.md for details)
# Terminal 1: Legacy Backend
npm run dev

# Terminal 2: Autonomous Backend
cd proptoken-autonomous/backend && npm start

# Terminal 3: Frontend
npm run dev:frontend

# Terminal 4: Oracle Network
cd oracle-network && go run cmd/oracle/main.go

# Terminal 5: Local Blockchain (optional)
anvil --port 8545
```

## 📋 Key Features

### ✅ Implemented (Steps 1-4)
- **Step 1**: Legacy backend with wallet management
- **Step 2**: Autonomous verification pipeline
  - Oracle Truth Layer (satellite, vision, registry)
  - ABM-based fraud detection
  - Consensus scoring
  - Legal workflow automation
- **Step 3**: On-chain tokenization
  - Asset registry with cryptographic proofs
  - ERC-3643 security tokens
  - Async redemption (ERC-7540)
  - Foundry test suite
- **Step 4**: Oracle & Verification Layer
  - Go-based oracle network
  - Free-tier data sources (mocked APIs)
  - Merkle tree generation
  - Blockchain integration

### 🔄 Pending
- **Step 5**: Application & Market Layer
- **Step 6**: Integration & Deployment

## 🗂️ Project Structure

```
proptoken2/
├── pages/              # Frontend pages (Landing, Marketplace, etc.)
├── components/         # React components
├── src/               # Legacy backend (Express)
├── proptoken-autonomous/
│   ├── backend/       # NestJS autonomous verification
│   └── contracts/     # Foundry smart contracts
├── oracle-network/    # Go oracle service
│   ├── cmd/          # Main entry point
│   ├── internal/     # Core logic (handlers, integrations, crypto)
│   └── pkg/          # Shared types
├── valid_assets.json  # Real Gurugram asset data
└── STARTUP.md        # Detailed startup guide
```

## 🔐 Security & Compliance

- **ERC-3643**: Identity-based transfers with KYC/AML compliance
- **Role-Based Access Control**: Admin, Minter, Compliance, Oracle roles
- **Merkle Proofs**: Cryptographic verification of off-chain data
- **ECDSA Signatures**: Oracle attestations signed with private keys

## 🌍 Real-World Data

The platform uses **real coordinates** for 5 major commercial properties in Gurugram:
- DLF Cyber Hub
- One Horizon Center
- Ambience Mall
- Worldmark Gurugram
- Candor TechSpace

Satellite imagery is fetched from Yandex Static Maps API.

## 🧪 Testing

### Smart Contracts
```bash
cd proptoken-autonomous/contracts
forge test
```

### Oracle Network
```bash
cd oracle-network
go test ./...
```

## 📊 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, TypeScript |
| Backend | NestJS, Express |
| Smart Contracts | Solidity 0.8.20, Foundry |
| Oracle | Go 1.21+, go-ethereum |
| Blockchain | Base/Arbitrum (L2) |
| Data Sources | OpenStreetMap, Yandex Maps |

## 💰 Cost Structure

**Zero-cost implementation** using:
- Free satellite imagery (OpenStreetMap, Yandex)
- Mocked computer vision (simulated scores)
- Mocked registry APIs
- Local blockchain (Anvil)

For production, estimated costs: ~$220/month for real API integrations.

## 📝 License

MIT

## 🤝 Contributing

This is a demonstration project. For production use, replace mocked integrations with real APIs.

---

**Built with ❤️ for the future of Real-World Asset tokenization**
