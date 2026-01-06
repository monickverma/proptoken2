
import { Router, Request, Response } from 'express';
import { db } from '../repositories/db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { getWalletSummary } from '../services/walletService';

const router = Router();

// Fix: Use standard Request/Response in signature and cast inside.
router.post('/purchase', requireAuth, (req: Request, res: Response) => {
  // Fix: Cast req to any to access body properties correctly.
  const { assetId, amountStablecoin } = (req as any).body;
  const asset = db.assets.find(a => a.id === assetId);
  const wallet = db.wallets.find(w => w.userId === (req as AuthRequest).user!.id);

  // Fix: Cast res to any to access status and json methods.
  if (!asset || !wallet) return (res as any).status(404).json({ success: false });

  if (wallet.stablecoinBalance < amountStablecoin) {
    // Fix: Cast res to any to access status and json methods.
    return (res as any).status(400).json({ success: false, error: { message: 'Insufficient stablecoin balance' } });
  }

  const tokensToBuy = Math.floor(amountStablecoin / asset.tokenPrice);
  // Fix: Cast res to any to access status and json methods.
  if (tokensToBuy <= 0) return (res as any).status(400).json({ success: false, error: { message: 'Investment too low for 1 token' } });
  
  const actualCost = tokensToBuy * asset.tokenPrice;

  asset.availableTokens -= tokensToBuy;
  wallet.tokensByAsset[assetId] = (wallet.tokensByAsset[assetId] || 0) + tokensToBuy;
  wallet.stablecoinBalance -= actualCost;
  wallet.totalInvested += actualCost;

  const transaction = {
    id: 'tx-' + Math.random().toString(36).substring(2, 9),
    userId: (req as AuthRequest).user!.id,
    type: 'BUY_TOKENS' as const,
    assetId,
    amountTokens: tokensToBuy,
    amountStablecoin: actualCost,
    description: `Bought ${tokensToBuy} units of ${asset.name}`,
    createdAt: new Date()
  };
  db.transactions.push(transaction);

  // Fix: Cast res to any to access json method.
  (res as any).json({ success: true, data: { transaction, wallet: getWalletSummary((req as AuthRequest).user!.id) } });
});

// Fix: Use standard Request/Response in signature and cast inside.
router.post('/', requireAuth, (req: Request, res: Response) => {
  // Fix: Cast req to any to access query properties correctly.
  const { type } = (req as any).query; 
  // Fix: Cast res to any to access status and json methods.
  (res as any).status(400).json({ success: false, message: 'Use specific sub-endpoints' });
});

// Fix: Use standard Request/Response in signature and cast inside.
router.post('/swap', requireAuth, (req: Request, res: Response) => {
  // Fix: Cast req to any to access body properties correctly.
  const { assetId, tokenAmount } = (req as any).body;
  const wallet = db.wallets.find(w => w.userId === (req as AuthRequest).user!.id);
  const asset = db.assets.find(a => a.id === assetId);

  // Fix: Cast res to any to access status and json methods.
  if (!wallet || !asset) return (res as any).status(404).json({ success: false });

  const owned = (wallet.tokensByAsset[assetId] || 0);
  // Fix: Cast res to any to access status and json methods.
  if (owned < tokenAmount) return (res as any).status(400).json({ success: false, error: { message: 'Insufficient tokens' } });

  const stablecoinOut = tokenAmount * asset.tokenPrice;

  wallet.tokensByAsset[assetId] -= tokenAmount;
  wallet.stablecoinBalance += stablecoinOut;
  wallet.totalInvested -= stablecoinOut;
  asset.availableTokens += tokenAmount;

  const transaction = {
    id: 'sw-' + Math.random().toString(36).substring(2, 9),
    userId: (req as AuthRequest).user!.id,
    type: 'SWAP' as const,
    assetId,
    amountTokens: tokenAmount,
    amountStablecoin: stablecoinOut,
    description: `Swapped ${tokenAmount} units of ${asset.name} for ₹${stablecoinOut.toLocaleString()}`,
    createdAt: new Date()
  };
  db.transactions.push(transaction);

  // Fix: Cast res to any to access json method.
  (res as any).json({ success: true, data: { transaction, wallet: getWalletSummary((req as AuthRequest).user!.id) } });
});

// Fix: Use standard Request/Response in signature and cast inside.
router.post('/pay', requireAuth, (req: Request, res: Response) => {
  // Fix: Cast req to any to access body properties correctly.
  const { amountStablecoin } = (req as any).body;
  const wallet = db.wallets.find(w => w.userId === (req as AuthRequest).user!.id);

  // Fix: Cast res to any to access status and json methods.
  if (!wallet) return (res as any).status(404).json({ success: false });
  // Fix: Cast res to any to access status and json methods.
  if (wallet.stablecoinBalance < amountStablecoin) return (res as any).status(400).json({ success: false, error: { message: 'Insufficient balance' } });

  wallet.stablecoinBalance -= amountStablecoin;

  const transaction = {
    id: 'py-' + Math.random().toString(36).substring(2, 9),
    userId: (req as AuthRequest).user!.id,
    type: 'PAYMENT' as const,
    amountStablecoin,
    description: `Processed payment of ₹${amountStablecoin.toLocaleString()}`,
    createdAt: new Date()
  };
  db.transactions.push(transaction);

  // Fix: Cast res to any to access json method.
  (res as any).json({ success: true, data: { transaction, wallet: getWalletSummary((req as AuthRequest).user!.id) } });
});

// Fix: Use standard Request/Response in signature and cast inside.
router.post('/lock', requireAuth, (req: Request, res: Response) => {
  // Fix: Cast req to any to access body properties correctly.
  const { assetId, tokenAmountToLock } = (req as any).body;
  const wallet = db.wallets.find(w => w.userId === (req as AuthRequest).user!.id);
  const asset = db.assets.find(a => a.id === assetId);

  // Fix: Cast res to any to access status and json methods.
  if (!wallet || !asset) return (res as any).status(404).json({ success: false });
  
  const owned = wallet.tokensByAsset[assetId] || 0;
  // Fix: Cast res to any to access status and json methods.
  if (owned < tokenAmountToLock) return (res as any).status(400).json({ success: false, error: { message: 'Insufficient free tokens' } });

  const value = tokenAmountToLock * asset.tokenPrice;
  wallet.tokensByAsset[assetId] -= tokenAmountToLock;
  wallet.lockedCollateral += value;

  const transaction = {
    id: 'cl-' + Math.random().toString(36).substring(2, 9),
    userId: (req as AuthRequest).user!.id,
    type: 'COLLATERAL_LOCK' as const,
    assetId,
    amountTokens: tokenAmountToLock,
    amountStablecoin: value,
    description: `Locked ${tokenAmountToLock} units of ${asset.name} as collateral`,
    createdAt: new Date()
  };
  db.transactions.push(transaction);

  // Fix: Cast res to any to access json method.
  (res as any).json({ success: true, data: { transaction, wallet: getWalletSummary((req as AuthRequest).user!.id) } });
});

export default router;
