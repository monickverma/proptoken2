
import { Router, Request, Response } from 'express';
import { db } from '../repositories/db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { getWalletSummary } from '../services/walletService';

const router = Router();

router.get('/', (req, res) => {
  (res as any).json({ success: true, data: db.assets });
});

// Fix: Use standard Request/Response in signature and cast inside.
router.post('/', requireAuth, (req: Request, res: Response) => {
  // Fix: Cast req to any to access body property correctly and avoid property collision.
  const { assetId } = (req as any).body;
  const asset = db.assets.find(a => a.id === assetId || a.name.includes(assetId));

  // Fix: Cast res to any to access status and json methods.
  if (!asset) return (res as any).status(404).json({ success: false, error: { message: 'Asset not found' } });

  const verificationId = Math.random().toString(36).substring(2, 9);
  const verification = {
    id: verificationId,
    userId: (req as AuthRequest).user!.id,
    assetId,
    status: 'VERIFIED' as const,
    risk: asset.risk,
    yieldPercent: asset.yieldPercent,
    summary: `${asset.name} in ${asset.location} has been cleared for tokenization. Title deeds confirmed.`,
    createdAt: new Date()
  };

  db.verifications.push(verification);
  db.transactions.push({
    id: 'tx-' + Math.random().toString(36).substring(2, 9),
    userId: (req as AuthRequest).user!.id,
    type: 'VERIFY',
    assetId: asset.id,
    description: `Verified asset ${asset.name}`,
    createdAt: new Date()
  });

  // Fix: Cast res to any to access json method.
  (res as any).json({ success: true, data: verification });
});

// Fix: Use standard Request/Response in signature and cast inside.
router.get('/yield-projection', requireAuth, (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;
  const wallet = db.wallets.find(w => w.userId === userId);
  // Fix: Cast res to any to access json method.
  if (!wallet) return (res as any).json({ success: true, data: [] });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const summary = getWalletSummary(userId);
  const baseMonthly = summary?.estimatedMonthlyIncome || 0;

  const data = months.map(month => ({
    month,
    income: Math.round(baseMonthly * (0.95 + Math.random() * 0.1))
  }));

  // Fix: Cast res to any to access json method.
  (res as any).json({ success: true, data });
});

export default router;
