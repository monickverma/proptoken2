# PropToken

Real-world-asset (RWA) tokenization prototype: an asset is submitted, scored by an off-chain verification pipeline, recorded in an on-chain registry, and issued as a permissioned security token with an asynchronous redemption flow.

**Block 2026 Hackathon, IIT Kharagpur: winner of the Streaming Utility Track and overall Runner-Up.**

[![CI](https://github.com/monickverma/proptoken2/actions/workflows/ci.yml/badge.svg)](https://github.com/monickverma/proptoken2/actions/workflows/ci.yml)

- **Live demo:** https://proptoken2.vercel.app (React app + demo API on Vercel; API data is in memory and resets)
- **Testnet trading:** connect a wallet on the live demo to buy and sell the demo property tokens with real Base Sepolia transactions (valueless test tokens). See [Trying the testnet market](#trying-the-testnet-market).

## What's in the repo

| Part | Path | Stack | What it does |
|---|---|---|---|
| Smart contracts | `proptoken-autonomous/contracts/src` | Solidity 0.8.20, Foundry, OpenZeppelin 5.5 | Asset registry, ERC-3643-style security token, token factory, ERC-7540-style async redemption, Merkle attestation verifier, and a testnet market (TestUSD faucet + `PropTokenMarket`). 37 Foundry tests. |
| Legacy snapshot | `proptoken-autonomous/contracts/contracts` | Hardhat | The sources of the January 2026 Base Sepolia deployment (see [Deployments](#deployments)). |
| Oracle node | `oracle-network/` | Go, go-ethereum | HTTP `/verify`: runs existence + ownership checks, commits to each signal as a leaf of a keccak256 Merkle tree, returns an inclusion proof per signal, signs the root with secp256k1 ECDSA, and can push the result to `AssetRegistry.registerAsset`. |
| Oracle stub | `proptoken-autonomous/oracle-network/` | Go (stdlib) | Fixed-score `/verify/{existence,ownership,activity}` endpoints, started by Docker Compose. The current submission flow doesn't call it. |
| Verification backend | `proptoken-autonomous/backend` | NestJS, GraphQL (Apollo) | REST `POST/GET /submissions`: weighted heuristic scoring in-process and a keccak256 asset fingerprint. GraphQL market queries. |
| Submission UI | `proptoken-autonomous/frontend` | Next.js 16 | Asset submission form and verification progress page for the backend. |
| Main web app | repo root (`App.tsx`, `pages/`, `components/`) | React, Vite, wagmi/viem | The live demo: investor/issuer dashboards, fractional purchase, swap, yield, verification views. With a connected wallet, Buy (Fractional) and Sell (Swap) send real Base Sepolia transactions to the testnet market; without one, they are simulated in the browser. |
| Demo API | `src/`, `api/index.ts` | Express, JWT, zod | Auth, assets, wallet ledger and ABM routes behind the live demo (in-memory store). |
| ABM engine | `proptoken-autonomous/abm-engine` | Python, FastAPI | Rule-based fraud and market-intelligence heuristics (mock comparables). |
| Subgraph | `subgraph/` | The Graph | Schema and mappings for token transfers and NAV updates (not deployed; see limitations). |

## Architecture

```mermaid
flowchart LR
    subgraph Web["Live demo (Vercel)"]
        UI["React + Vite app<br/>wagmi / viem"]
        API["Express demo API<br/>JWT auth, in-memory store"]
        UI -- REST --> API
    end

    subgraph Verify["Verification services"]
        NEXT["Next.js submission UI"]
        NEST["NestJS backend<br/>REST + GraphQL"]
        STUB["Go oracle stub :8081"]
        ORACLE["Go oracle node<br/>mocked satellite / vision / MCA<br/>Merkle root + ECDSA signature"]
        ABM["Python ABM engine<br/>(FastAPI)"]
        NEXT -- REST --> NEST
    end

    subgraph Chain["Base Sepolia"]
        REG["AssetRegistry"]
        FACT["TokenFactory"]
        TOK["RWASecurityToken"]
        RED["AsyncRedemptionController"]
        VER["OracleAttestationVerifier"]
        MKT["PropTokenMarket"]
        USD["TestUSD (faucet)"]
        FACT -- "isEligible / markAsTokenized" --> REG
        MKT -- "mint / burn / whitelist" --> TOK
        MKT -- "price paid / payout" --> USD
        FACT -- deploys --> TOK
        RED -- "lock / burn" --> TOK
    end

    UI -- "wallet txs: faucet, buy, sell" --> MKT
    UI -. "balances, Bought / Sold events" .-> Chain
    ORACLE -- "registerAsset (optional)" --> REG
    TOK -. "Transfer / NAVUpdated" .-> SG["Subgraph"]
```

## Smart contracts

All in `proptoken-autonomous/contracts/src`, using OpenZeppelin `AccessControl` and `ReentrancyGuard`.

| Contract | Purpose | Roles |
|---|---|---|
| `AssetRegistry` | Stores one record per asset fingerprint: oracle attestation root, ABM output hash, existence/ownership/fraud scores (1e18 scale), risk score, eligibility, mock flag, token address. Fingerprints starting with `"test"` are flagged as mock assets. | `CONSENSUS_ROLE` registers and updates assets; `DEFAULT_ADMIN_ROLE` marks them tokenized |
| `RWASecurityToken` | ERC-20 with ERC-3643-style transfer rules: verified-investor whitelist, frozen wallets, pause, investor cap, forced transfer, NAV and NAV per token. | `MINTER_ROLE`, `COMPLIANCE_ROLE`, `AGENT_ROLE`, `DEFAULT_ADMIN_ROLE` |
| `TokenFactory` | Deploys a token only for an eligible, untokenized registry asset, marks it tokenized, hands the token roles to the caller and renounces its own. | `FACTORY_ROLE` |
| `AsyncRedemptionController` | ERC-7540-style request → approve → settle (burn) / cancel (return) flow for illiquid assets; payout happens off-chain. | `OPERATOR_ROLE` |
| `TestUSD` (`src/testnet`) | Valueless 6-decimal stablecoin with a public faucet: 10,000 tUSD per wallet per day. | `MINTER_ROLE` (reserve funding) |
| `PropTokenMarket` (`src/testnet`) | Testnet primary market: `buy` takes tUSD at a fixed price per token and mints the security token, whitelisting first-time buyers; `sell` takes tokens back, burns them and pays the price minus a spread (2%) from its tUSD reserve. Needs `MINTER_ROLE` and `COMPLIANCE_ROLE` on each listed token. | `LISTER_ROLE` sets prices; `DEFAULT_ADMIN_ROLE` sets the spread |
| `OracleAttestationVerifier` | Stores attestation Merkle roots and verifies one oracle signal against a root: it recomputes the leaf from the signal's fields and checks the proof with OpenZeppelin `MerkleProof` (sorted-pair keccak256). | `ORACLE_ROLE` (granted/revoked via `authorizeOracle`) |

"ERC-3643-style" and "ERC-7540-style" mean the contracts follow those standards' ideas; they do not implement the full interfaces (no ONCHAINID identity registry, no ERC-4626 vault).

### Deployments

**Testnet market (current).** `script/DeployTestnetMarket.s.sol` deploys the `src/` contracts to Base Sepolia (chain ID 84532): registry, verifier, factory, redemption controller, TestUSD and the market, plus one token per demo asset with a funded buyback reserve. It writes every address to [`deployments/base-sepolia.json`](proptoken-autonomous/contracts/deployments/base-sepolia.json), which the web app reads.

Deployed October 2026 (from block 48360415):

| Contract | Address |
|---|---|
| PropTokenMarket | [`0xF11F58F6AFEd12c7CecD5453A2a3bE50d3303158`](https://sepolia.basescan.org/address/0xF11F58F6AFEd12c7CecD5453A2a3bE50d3303158) |
| TestUSD (tUSD) | [`0x6e3Ff450b299a4dDb51A65552AbBBe7877Fe31fd`](https://sepolia.basescan.org/address/0x6e3Ff450b299a4dDb51A65552AbBBe7877Fe31fd) |
| AssetRegistry | [`0x97f6Fe807e72BB21E5D37a67E6fA6901d8040Ca1`](https://sepolia.basescan.org/address/0x97f6Fe807e72BB21E5D37a67E6fA6901d8040Ca1) |
| TokenFactory | [`0x39Acaa83c399d14F2A7F01AbA81AeaB60b9913F1`](https://sepolia.basescan.org/address/0x39Acaa83c399d14F2A7F01AbA81AeaB60b9913F1) |
| AsyncRedemptionController | [`0x18c34E6955D251480C81c8fB927657bFa413F8cf`](https://sepolia.basescan.org/address/0x18c34E6955D251480C81c8fB927657bFa413F8cf) |
| OracleAttestationVerifier | [`0x9d1e369579e52f2BcBd3f17E7B03794415B7c796`](https://sepolia.basescan.org/address/0x9d1e369579e52f2BcBd3f17E7B03794415B7c796) |
| DLF Cyber Hub (PT-DLFCH, 50 tUSD) | [`0xEd60Ba578F28BF8DBb161d8d44DbdC91Bcb6D972`](https://sepolia.basescan.org/address/0xEd60Ba578F28BF8DBb161d8d44DbdC91Bcb6D972) |
| One Horizon Center (PT-OHC, 120 tUSD) | [`0x12435B6205905d0DdfaeE52c64842d10751B46FA`](https://sepolia.basescan.org/address/0x12435B6205905d0DdfaeE52c64842d10751B46FA) |
| Ambience Mall Complex (PT-AMC, 25 tUSD) | [`0x38591E78E71A6B5df5B2eaf15d6eAeC6129A9842`](https://sepolia.basescan.org/address/0x38591E78E71A6B5df5B2eaf15d6eAeC6129A9842) |
| Worldmark Gurugram (PT-WMG, 45 tUSD) | [`0x2BF4CdF0d37a2Ea7Eb536f2587D00aBFa554792C`](https://sepolia.basescan.org/address/0x2BF4CdF0d37a2Ea7Eb536f2587D00aBFa554792C) |
| Candor TechSpace (PT-CTS, 35 tUSD) | [`0xF0c46D3Ed352a22e5B03cb8f78C23f8eC59547AC`](https://sepolia.basescan.org/address/0xF0c46D3Ed352a22e5B03cb8f78C23f8eC59547AC) |

**Legacy (January 2026).** Deployed with Hardhat from `contracts/contracts/`; no longer used by the app:

| Contract | Address |
|---|---|
| AssetRegistry | [`0x61bfab5D232429512c4D183a05Ec22F7e64B1562`](https://sepolia.basescan.org/address/0x61bfab5D232429512c4D183a05Ec22F7e64B1562) |
| RWASecurityToken ("PropToken RWA Test", PRWA) | [`0x2feD68a1B753395d1BD4899438d9A37A21176cC4`](https://sepolia.basescan.org/address/0x2feD68a1B753395d1BD4899438d9A37A21176cC4) |

The deployed bytecode matches the Hardhat sources in `contracts/contracts/` (checked with metadata stripped). That snapshot predates the fixes in `src/`: its `AssetRegistry` uses an `ORACLE_ROLE` + `verifyAsset` flow instead of `CONSENSUS_ROLE`.

### Trying the testnet market

1. Open https://proptoken2.vercel.app, sign in (demo account), and connect a wallet such as MetaMask. The app asks to switch it to Base Sepolia.
2. Get a little Base Sepolia ETH for gas from a faucet such as [Coinbase's](https://portal.cdp.coinbase.com/products/faucet), or mine Sepolia ETH at [sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de) and bridge it with [Superbridge](https://testnets.superbridge.app).
3. On **Fractional**, press **Get 10,000 test USD**, pick an asset and **Buy**: one approval, then the purchase.
4. On **Swap**, **Sell** tokens back for tUSD: one approval, then the sale.

Every step is a Base Sepolia transaction with a BaseScan link, and the dashboard's live feed shows market trades as they happen. The tokens and tUSD have no value.

### Deploying the testnet market

The deploy script takes its signer from the command line, so the key never goes into a file or an environment variable. With a fresh testnet-only key and about 0.01 Base Sepolia ETH (the whole deploy is 45 transactions, roughly 19M gas):

```bash
cast wallet import proptoken-deployer --interactive   # stores the key encrypted in ~/.foundry/keystores
cd proptoken-autonomous/contracts
forge script script/DeployTestnetMarket.s.sol \
  --rpc-url https://sepolia.base.org \
  --account proptoken-deployer --sender <DEPLOYER_ADDRESS> \
  --broadcast
```

Set `ORACLE_ADDRESS` to give an oracle node `CONSENSUS_ROLE` on the new registry. Commit the updated `deployments/base-sepolia.json`; the web app picks it up on the next build.

## Running it

Prerequisites: Node.js 20+, Go 1.25+, [Foundry](https://getfoundry.sh), Python 3.11+ (ABM engine only). Copy each `.env.example` to `.env` where you need one; nothing requires real keys to run locally.

```bash
git clone --recursive https://github.com/monickverma/proptoken2.git
cd proptoken2
```

**Contracts**

```bash
cd proptoken-autonomous/contracts
forge build
forge test -vvv
```

If you cloned without `--recursive`, run `git submodule update --init --recursive` first.

**Main web app + demo API** (what the live demo runs)

```bash
npm ci
npm run dev            # Express API on :3002
npm run dev:frontend   # Vite app on :3003, proxies API routes to :3002
```

Frontend settings (all optional, see `.env.example`): `VITE_WALLETCONNECT_PROJECT_ID` enables WalletConnect and mobile wallets (without it only browser-extension wallets are offered), `VITE_BASE_SEPOLIA_RPC_URL` overrides the public read RPC, and `VITE_DEPLOYMENT` picks another file in `deployments/` (for example a local fork).

Set `JWT_SECRET` for anything beyond local use. Without it the API uses a random per-process secret in development and refuses to issue tokens in production.

**Verification backend + submission UI**

```bash
cd proptoken-autonomous/backend && npm ci && npm run start:dev   # :3001 (REST /submissions, GraphQL /graphql)
cd proptoken-autonomous/frontend && npm ci && npm run dev        # Next.js on :3000
```

**Go oracle node**

```bash
cd oracle-network
go run ./cmd/oracle    # :8080, POST /verify
go test ./...
```

Without `ORACLE_PRIVATE_KEY` it signs with a throwaway key generated at startup and stays off-chain. To publish to a registry, set `ORACLE_PRIVATE_KEY`, `BLOCKCHAIN_RPC_URL` and `REGISTRY_CONTRACT_ADDRESS`. The key's address needs `CONSENSUS_ROLE` on a registry built from `src/`.

**Everything with Docker Compose** (backend, ABM engine, oracle stub, Next.js UI)

```bash
cd proptoken-autonomous
docker compose up --build
```

## Limitations

This is a hackathon prototype. In particular:

- **Verification inputs are mocked.** The Go oracle's satellite client only builds a Yandex static-map URL (it never fetches or analyses the image), the vision score is random in 0.85–0.99, and the MCA company check always passes. The NestJS satellite check returns a fixed 0.92 for any valid coordinates. The oracle stub returns fixed scores.
- **The Merkle root is not stored in the verifier automatically.** The Go node builds a keccak256 sorted-pair Merkle tree over its signals (one leaf per signal: `keccak256(bytes.concat(keccak256(abi.encode(submissionId, category, signal, source, score))))`, the OpenZeppelin `StandardMerkleTree` encoding) and `/verify` returns a proof for each signal. `OracleAttestationVerifier.verifyOracleResult` recomputes that leaf on-chain and checks the proof; `test/Contracts.t.sol` checks a vector generated by the Go code. But the node pushes the root to `AssetRegistry.registerAsset`, not to the verifier, so someone with `ORACLE_ROLE` still has to call `storeAttestation`. Leaves commit to each signal's name, source and score (rounded to 6 decimals, 1e18 scale), not to its raw data or timestamp.
- **Oracle signatures are not checked on-chain.** The node signs its commitment with ECDSA, but the contracts authorise oracles by role (`msg.sender`), not by recovering a signature.
- **The Go oracle node targets the `src/` registry ABI.** It can publish to a registry deployed by `DeployTestnetMarket.s.sol` once its address holds `CONSENSUS_ROLE`; the legacy January registry has a different interface.
- **The demo API and NestJS backend keep data in memory**, and market data on the GraphQL API (`tokens`, `orderBook`, `recentTrades`) is mock data. The GraphQL mock-SPV mutations in `src/api/mutation.resolver.ts` and `MOCK_SPV_FLOW.md` are not registered in a Nest module yet.
- **KYC is a whitelist** (`verifyInvestor`), not an identity registry, and the testnet market whitelists any wallet on its first purchase.
- **The testnet market is a primary market with fixed prices**, set by the deployer (the demo assets' rupee prices divided by 100, in tUSD). There is no order book or price discovery, and the buyback reserve is minted tUSD.
- **Without a connected wallet, the app's wallet is simulated:** the dashboard portfolio, purchases and swaps live in the browser's local storage. Sign-in is a browser-only demo, not the Express API's JWT auth.
- **The subgraph is not deployable as-is:** `subgraph.yaml` points at a local Hardhat address and the ABI file it references isn't committed.

## License

MIT
