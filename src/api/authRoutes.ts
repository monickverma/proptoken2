
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../repositories/db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { getWalletSummary } from '../services/walletService';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);
    
    if (db.users.find(u => u.email === email)) {
      return (res as any).status(400).json({ success: false, error: { message: 'Email already registered' } });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = Math.random().toString(36).substring(2, 9);
    
    const newUser = { id: userId, name, email, passwordHash, createdAt: new Date() };
    db.users.push(newUser);

    const newWallet = {
      userId,
      tokensByAsset: {},
      totalInvested: 0,
      stablecoinBalance: 100000, 
      lockedCollateral: 0,
      network: 'Polygon Mainnet'
    };
    db.wallets.push(newWallet);

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '1d' });

    (res as any).json({
      success: true,
      data: {
        token,
        user: { id: userId, name, email },
        wallet: getWalletSummary(userId)
      }
    });
  } catch (err) {
    (res as any).status(400).json({ success: false, error: err });
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return (res as any).status(401).json({ success: false, error: { message: 'Invalid credentials' } });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

  (res as any).json({
    success: true,
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, walletAddress: user.walletAddress },
      wallet: getWalletSummary(user.id)
    }
  });
});

// Fix: Use standard Request/Response in signature and cast inside to satisfy RequestHandler type.
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const user = db.users.find(u => u.id === authReq.user?.id);
  // Fix: Cast res to any to access status and json methods.
  if (!user) return (res as any).status(404).json({ success: false });

  // Fix: Cast res to any to access json method.
  (res as any).json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, walletAddress: user.walletAddress },
      wallet: getWalletSummary(user.id)
    }
  });
});

export default router;
