
import { User, Asset, Wallet, Verification, Transaction } from '../models/types';

class MemoryDB {
  public users: User[] = [];
  public assets: Asset[] = [
    {
      id: 'plot-001',
      name: 'Emerald Meadows',
      location: 'Sarjapur, Bengaluru',
      risk: 'Low',
      yieldPercent: 9.2,
      tokenPrice: 5000,
      totalTokens: 20000,
      availableTokens: 15000,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800&h=600'
    },
    {
      id: 'plot-002',
      name: 'Heritage Acres',
      location: 'Nandi Hills, Karnataka',
      risk: 'Medium',
      yieldPercent: 12.5,
      tokenPrice: 8500,
      totalTokens: 15000,
      availableTokens: 12000,
      image: 'https://images.unsplash.com/photo-1592591502264-74a342dddf93?auto=format&fit=crop&q=80&w=800&h=600'
    },
    {
      id: 'plot-003',
      name: 'Royal Palm Grove',
      location: 'ECR, Chennai',
      risk: 'Low',
      yieldPercent: 8.8,
      tokenPrice: 12000,
      totalTokens: 10000,
      availableTokens: 8500,
      image: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&q=80&w=800&h=600'
    }
  ];
  public wallets: Wallet[] = [];
  public verifications: Verification[] = [];
  public transactions: Transaction[] = [];

  constructor() {
    console.log('MemoryDB Initialized with seeded assets');
  }
}

export const db = new MemoryDB();
