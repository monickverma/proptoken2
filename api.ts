
import { db } from './db';
import { User, Wallet, ActionHistory } from './types';
import { DUMMY_ASSETS } from './constants';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // --- Auth API ---
  async login(email: string): Promise<User | null> {
    await sleep(800);
    const users = db.getUsers();
    const user = users.find(u => u.email === email);
    if (user) db.setCurrentUser(user);
    return user || null;
  },

  async register(name: string, email: string): Promise<User> {
    await sleep(1000);
    const existing = db.getUsers().find(u => u.email === email);
    if (existing) return existing;

    const newUser: User = { name, email };
    db.saveUser(newUser);
    db.setCurrentUser(newUser);
    return newUser;
  },

  async logout() {
    db.setCurrentUser(null);
  },

  async connectWallet(email: string, address: string): Promise<User> {
    await sleep(1200);
    db.updateUser(email, { walletAddress: address });
    const user = db.getCurrentUser();
    if (!user) throw new Error("Session lost during connection");
    return user;
  },

  // --- Ledger API ---
  async getWallet(email: string): Promise<Wallet> {
    await sleep(400);
    return db.getWallet(email);
  },

  async buyTokens(email: string, assetId: string, amount: number): Promise<{ txHash: string; wallet: Wallet }> {
    await sleep(2000); 
    const wallet = db.getWallet(email);
    const asset = DUMMY_ASSETS.find(a => a.id === assetId);
    if (!asset) throw new Error("Asset not found in registry");

    const cost = asset.tokenPrice * amount;
    if (wallet.stablecoinBalance < cost) throw new Error("Insufficient balance in settlement wallet");

    const txHash = '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
    
    const updatedWallet: Wallet = {
      ...wallet,
      stablecoinBalance: wallet.stablecoinBalance - cost,
      totalInvested: wallet.totalInvested + cost,
      tokensByAsset: {
        ...wallet.tokensByAsset,
        [assetId]: (wallet.tokensByAsset[assetId] || 0) + amount
      },
      history: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'BUY_TOKENS',
          description: `Minted ${amount} units of ${asset.name}`,
          timestamp: new Date().toISOString(),
          amount: `₹${cost.toLocaleString()}`,
          txHash
        },
        ...wallet.history
      ]
    };

    db.updateWallet(email, updatedWallet);
    return { txHash, wallet: updatedWallet };
  },

  async swapToStable(email: string, assetId: string, amount: number): Promise<{ txHash: string; wallet: Wallet }> {
    await sleep(1500);
    const wallet = db.getWallet(email);
    const asset = DUMMY_ASSETS.find(a => a.id === assetId);
    if (!asset) throw new Error("Asset configuration missing");
    if ((wallet.tokensByAsset[assetId] || 0) < amount) throw new Error("Insufficient tokens in vault");

    const value = asset.tokenPrice * amount;
    const txHash = '0x' + Math.random().toString(16).slice(2);

    const updatedWallet: Wallet = {
      ...wallet,
      stablecoinBalance: wallet.stablecoinBalance + value,
      totalInvested: wallet.totalInvested - value,
      tokensByAsset: {
        ...wallet.tokensByAsset,
        [assetId]: (wallet.tokensByAsset[assetId] || 0) - amount
      },
      history: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'SWAP',
          description: `Liquidated ${amount} units of ${asset.name}`,
          timestamp: new Date().toISOString(),
          amount: `₹${value.toLocaleString()}`,
          txHash
        },
        ...wallet.history
      ]
    };

    db.updateWallet(email, updatedWallet);
    return { txHash, wallet: updatedWallet };
  },

  async lockCollateral(email: string, assetId: string, amount: number): Promise<{ txHash: string; wallet: Wallet }> {
    await sleep(1800);
    const wallet = db.getWallet(email);
    const asset = DUMMY_ASSETS.find(a => a.id === assetId);
    if (!asset) throw new Error("Asset not found");
    if ((wallet.tokensByAsset[assetId] || 0) < amount) throw new Error("Insufficient free units for locking");

    const value = asset.tokenPrice * amount;
    const txHash = '0x' + Math.random().toString(16).slice(2);

    const updatedWallet: Wallet = {
      ...wallet,
      lockedCollateral: wallet.lockedCollateral + value,
      tokensByAsset: {
        ...wallet.tokensByAsset,
        [assetId]: (wallet.tokensByAsset[assetId] || 0) - amount
      },
      history: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'COLLATERAL_LOCK',
          description: `Vault locked ${amount} units of ${asset.name}`,
          timestamp: new Date().toISOString(),
          amount: `₹${value.toLocaleString()}`,
          txHash
        },
        ...wallet.history
      ]
    };

    db.updateWallet(email, updatedWallet);
    return { txHash, wallet: updatedWallet };
  },

  async pay(email: string, amount: number): Promise<{ txHash: string; wallet: Wallet }> {
    await sleep(1200);
    const wallet = db.getWallet(email);
    if (wallet.stablecoinBalance < amount) throw new Error("Insufficient settlement funds");

    const txHash = '0x' + Math.random().toString(16).slice(2);
    const updatedWallet: Wallet = {
      ...wallet,
      stablecoinBalance: wallet.stablecoinBalance - amount,
      history: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'PAYMENT',
          description: `On-chain merchant settlement`,
          timestamp: new Date().toISOString(),
          amount: `₹${amount.toLocaleString()}`,
          txHash
        },
        ...wallet.history
      ]
    };

    db.updateWallet(email, updatedWallet);
    return { txHash, wallet: updatedWallet };
  }
};
