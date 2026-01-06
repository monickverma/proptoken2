
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  walletAddress?: string;
}

export interface Asset {
  id: string;
  name: string;
  location: string;
  yieldPercent: number;
  tokenPrice: number;
  totalTokens: number;
  availableTokens: number;
  image: string;
  risk: RiskLevel;
  contractAddress?: string;
}

export interface Wallet {
  userId: string;
  tokensByAsset: Record<string, number>;
  totalInvested: number;
  stablecoinBalance: number;
  lockedCollateral: number;
  network: string;
}

export interface Verification {
  id: string;
  userId: string;
  assetId: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
  risk: RiskLevel;
  yieldPercent: number;
  summary: string;
  createdAt: Date;
}

export type TransactionType = 'VERIFY' | 'BUY_TOKENS' | 'SWAP' | 'PAYMENT' | 'COLLATERAL_LOCK';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  assetId?: string;
  amountTokens?: number;
  amountStablecoin?: number;
  description: string;
  meta?: any;
  createdAt: Date;
}
