/// <reference types="vite/client" />
// Addresses of the testnet market, written by
// proptoken-autonomous/contracts/script/DeployTestnetMarket.s.sol.
// If the deployment file is missing, on-chain trading is turned off and the
// app runs in simulated mode only.
import { getAddress, type Address } from 'viem';

interface RawAsset {
  name: string;
  symbol: string;
  priceUsd: number;
  token: string;
}

interface RawDeployment {
  chainId: number;
  deployedAtBlock: number;
  deployer: string;
  assetRegistry: string;
  testUsd: string;
  market: string;
  assets: Record<string, RawAsset>;
}

export interface OnchainAsset {
  id: string;
  name: string;
  symbol: string;
  priceUsd: number;
  token: Address;
}

export interface Deployment {
  chainId: number;
  deployedAtBlock: bigint;
  assetRegistry: Address;
  testUsd: Address;
  market: Address;
  assets: Record<string, OnchainAsset>;
}

const files = import.meta.glob<{ default: RawDeployment }>(
  '../proptoken-autonomous/contracts/deployments/*.json',
  { eager: true },
);

// VITE_DEPLOYMENT picks another file in deployments/ (e.g. local-fork for testing)
const name = import.meta.env.VITE_DEPLOYMENT || 'base-sepolia';
const raw = Object.entries(files).find(([path]) => path.endsWith(`/${name}.json`))?.[1].default;

function load(r: RawDeployment): Deployment {
  const assets: Record<string, OnchainAsset> = {};
  for (const [id, a] of Object.entries(r.assets)) {
    assets[id] = { id, name: a.name, symbol: a.symbol, priceUsd: a.priceUsd, token: getAddress(a.token) };
  }
  return {
    chainId: r.chainId,
    deployedAtBlock: BigInt(r.deployedAtBlock),
    assetRegistry: getAddress(r.assetRegistry),
    testUsd: getAddress(r.testUsd),
    market: getAddress(r.market),
    assets,
  };
}

export const deployment: Deployment | null = raw ? load(raw) : null;

export const ONCHAIN_ENABLED = deployment !== null;

export function onchainAsset(assetId: string): OnchainAsset | undefined {
  return deployment?.assets[assetId];
}

export const EXPLORER_URL = 'https://sepolia.basescan.org';

export const txUrl = (hash: string) => `${EXPLORER_URL}/tx/${hash}`;
export const addressUrl = (address: string) => `${EXPLORER_URL}/address/${address}`;

export const ETH_FAUCET_URL = 'https://docs.base.org/base-chain/tools/network-faucets';
