
export interface Asset {
  id: string;
  name: string;
  location: string;
  yieldPercent: number;
  tokenPrice: number;
  totalTokens: number;
  image: string;
  risk: 'Low' | 'Medium' | 'High';
  contractAddress?: string;
}

export interface User {
  name: string;
  email: string;
  walletAddress?: string;
}

export interface Wallet {
  tokensByAsset: Record<string, number>;
  totalInvested: number;
  stablecoinBalance: number;
  lockedCollateral: number;
  history: ActionHistory[];
  network: string;
}

export interface ActionHistory {
  id: string;
  type: 'VERIFY' | 'BUY_TOKENS' | 'SWAP' | 'PAYMENT' | 'COLLATERAL_LOCK';
  description: string;
  timestamp: string;
  amount?: string;
  txHash?: string;
}

export interface AuthContextType {
  user: User | null;
  wallet: Wallet;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  signIn: (email: string) => Promise<void>;
  signUp: (email: string, name: string) => Promise<void>;
  signOut: () => void;
  buyTokens: (assetId: string, amount: number) => Promise<string>;
  swapToStablecoin: (assetId: string, tokenAmount: number) => Promise<string>;
  lockAsCollateral: (assetId: string, tokenAmount: number) => Promise<string>;
  makePayment: (amount: number) => Promise<boolean>;
}
