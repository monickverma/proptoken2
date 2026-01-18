# Mock SPV → Token Minting → Activity Feed Flow

## Overview
This document outlines the implemented pipeline for simulating asset tokenization. The system allows a user to submit a "Mock" SPV, which bypasses strict verification rules, automatically mints an ERC-3643 compliant token on the Sepolia testnet (or simulates it), and logs all actions to a queryable activity feed.

## Components Implemented

### 1. Lenient ABM Scoring
*   **File**: `src/abm/abm.service.ts`
*   **Logic**:
    *   `TEST` category assets receive a **20% score boost**.
    *   Threshold for passing is effectively lower (mock score set to 8.5/10).
    *   Ensures consistent "VERIFIED" status for demos.

### 2. Token Minting Service
*   **File**: `src/minting/token-minter.service.ts`
*   **Logic**:
    *   **Live Mode**: If `SEPOLIA_RPC_URL` and `PRIVATE_KEY_SEPOLIA` are set, attempts to interact with the blockchain using `ethers.js`.
    *   **Simulation Mode**: If credentials are missing, it generates a deterministic token address and transaction hash, simulating network delay.
    *   **Standard**: Emulates ERC-3643 behavior (identity-gated security token).

### 3. Activity Feed Service
*   **File**: `src/activity/activity-feed.service.ts`
*   **Logic**:
    *   In-memory event log (Last 50 events).
    *   Events: `SPV_SUBMITTED`, `SPV_VERIFIED`, `TOKEN_MINTING_STARTED`, `TOKEN_DEPLOYED`.

### 4. GraphQL API
*   **File**: `src/submission/submission.resolver.ts`
*   **Endpoint**: `http://localhost:3001/graphql`
*   **Operations**:
    *   `mutation submitMockSPV(name, address, ...)`: Enters the pipeline.
    *   `mutation mintTokenFromSPV(submissionId)`: Fetches token details (auto-minted).
    *   `query getActivityFeed(limit)`: Gets recent events.

## End-to-End Flow

1.  **Submission**: User submits via GraphQL.
    *   `SubmissionService` creates record.
    *   Log: `SPV_SUBMITTED`.
2.  **Verification (Async)**:
    *   `OracleService` checks (stubbed or real).
    *   `ABMService` analyzes (with boost).
    *   `ConsensusService` approves.
    *   Log: `SPV_VERIFIED`.
3.  **Registration**:
    *   Asset is registered in Registry.
4.  **Token Minting**:
    *   `TokenMinterService` is triggered automatically.
    *   Deployed to Sepolia (or simulated).
    *   Log: `TOKEN_DEPLOYED` with explorer URL.

## Usage

### Prerequisites
*   Node.js & NPM
*   `.env` with `SEPOLIA_RPC_URL` (optional for simulation)

### Running
```bash
# Start Backend
npm start

# Run Test Script
./test-mock-spv.sh
```

### Example GraphQL Query
```graphql
mutation {
  submitMockSPV(
    name: "Demo Asset"
    address: "123 Main St"
    longitude: 40.7128
    latitude: -74.0060
  ) {
    submissionId
    status
    abmScore
    nextStep
  }
}
```
