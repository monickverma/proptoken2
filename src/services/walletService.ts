
import { db } from '../repositories/db';
import { Wallet, Asset } from '../models/types';

export const getWalletSummary = (userId: string) => {
  const wallet = db.wallets.find(w => w.userId === userId);
  if (!wallet) return null;

  const totalTokens = Object.values(wallet.tokensByAsset).reduce((sum, count) => sum + (count as number), 0);
  
  // Calculate estimated monthly income based on tokens and asset yields
  let monthlyIncome = 0;
  Object.entries(wallet.tokensByAsset).forEach(([assetId, count]) => {
    const asset = db.assets.find(a => a.id === assetId);
    if (asset) {
      const annualIncome = (count as number * asset.tokenPrice) * (asset.yieldPercent / 100);
      monthlyIncome += annualIncome / 12;
    }
  });

  return {
    stablecoinBalance: wallet.stablecoinBalance,
    totalInvested: wallet.totalInvested,
    totalTokens,
    estimatedMonthlyIncome: Math.round(monthlyIncome),
    lockedCollateral: wallet.lockedCollateral,
    network: wallet.network
  };
};

export const getWalletPositions = (userId: string) => {
  const wallet = db.wallets.find(w => w.userId === userId);
  if (!wallet) return [];

  return Object.entries(wallet.tokensByAsset)
    .filter(([_, count]) => (count as number) > 0)
    .map(([assetId, count]) => {
      const asset = db.assets.find(a => a.id === assetId);
      return {
        assetId,
        assetName: asset?.name || 'Unknown Asset',
        location: asset?.location || 'Unknown',
        tokensOwned: count,
        currentValue: (count as number) * (asset?.tokenPrice || 0),
        yieldPercentage: asset?.yieldPercent || 0,
        risk: asset?.risk || 'Low'
      };
    });
};
