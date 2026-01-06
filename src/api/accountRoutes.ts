
import { Router, Request, Response } from 'express';
import { db } from '../repositories/db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Fix: Use standard Request/Response in signature and cast inside.
router.get('/profile', requireAuth, (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;
  const user = db.users.find(u => u.id === userId);
  const wallet = db.wallets.find(w => w.userId === userId);
  
  // Fix: Cast res to any to access status and json methods.
  if (!user || !wallet) return (res as any).status(404).json({ success: false });

  const totalAssetsBought = Object.entries(wallet.tokensByAsset).filter(([_, count]) => (count as number) > 0).length;
  const totalTokensBought = db.transactions
    .filter(tx => tx.userId === user.id && tx.type === 'BUY_TOKENS')
    .reduce((sum, tx) => sum + (tx.amountTokens || 0), 0);

  // Fix: Cast res to any to access json method.
  (res as any).json({
    success: true,
    data: {
      name: user.name,
      email: user.email,
      joinedDate: user.createdAt,
      totalAssetsBought,
      totalTokensBought,
      stablecoinBalance: wallet.stablecoinBalance
    }
  });
});

// Fix: Use standard Request/Response in signature and cast inside.
router.get('/recent-actions', requireAuth, (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;
  const txs = db.transactions
    .filter(tx => tx.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  const actions = txs.map(tx => {
    return {
      id: tx.id,
      text: tx.description,
      timestamp: tx.createdAt,
      type: tx.type,
      amount: tx.amountStablecoin ? `₹${tx.amountStablecoin.toLocaleString()}` : undefined
    };
  });

  // Fix: Cast res to any to access json method.
  (res as any).json({ success: true, data: actions });
});

export default router;
