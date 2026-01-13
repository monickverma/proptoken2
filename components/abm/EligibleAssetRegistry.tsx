import React, { useEffect, useState } from 'react';
import {
  Building2, MapPin, TrendingUp, Shield, DollarSign,
  Users, ChevronRight, Search, Filter, RefreshCw, Loader2,
  CheckCircle2, AlertTriangle
} from 'lucide-react';
import { EligibleAsset } from '../abmTypes';
import { getEligibleAssets, claimCashFlowExposure } from '../abmApi';

const EligibleAssetRegistry: React.FC = () => {
  const [assets, setAssets] = useState<EligibleAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<EligibleAsset | null>(null);
  const [claimTokens, setClaimTokens] = useState(100);
  const [claiming, setClaiming] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await getEligibleAssets();
      setAssets(data);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleClaim = async () => {
    if (!selectedAsset) return;
    setClaiming(true);
    try {
      await claimCashFlowExposure(selectedAsset.id, 'user-' + Date.now(), claimTokens);
      await fetchAssets();
      setSelectedAsset(null);
    } catch (err) {
      console.error('Claim failed:', err);
    } finally {
      setClaiming(false);
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
    if (score <= 50) return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Eligible Asset Registry</h1>
          <p className="text-slate-500 dark:text-slate-400">Verified assets ready for tokenization</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              className="pl-10 pr-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={fetchAssets}
            className="p-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{assets.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Assets</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{(assets.reduce((sum, a) => sum + a.expectedNAV.mean, 0) / 10000000).toFixed(1)}Cr
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total NAV</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {assets.length > 0 ? (assets.reduce((sum, a) => sum + a.expectedYield.expected, 0) / assets.length).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Avg Yield</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {assets.reduce((sum, a) => sum + a.cashFlowClaims.length, 0)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Claims</p>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 mx-auto animate-spin" />
          <p className="text-slate-500 mt-2">Loading assets...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-bold">
            {searchTerm ? 'No matching assets found' : 'No eligible assets yet'}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Submit an asset for verification to get started
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden hover:border-indigo-500 transition-colors cursor-pointer"
              onClick={() => setSelectedAsset(asset)}
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{asset.assetName}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                      <MapPin className="w-3 h-3" />
                      {asset.location.city}, {asset.location.state}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${getRiskColor(asset.riskScore)}`}>
                    Risk: {asset.riskScore.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">NAV</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{(asset.expectedNAV.mean / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Expected Yield</span>
                  <span className="font-bold text-emerald-600">{asset.expectedYield.expected.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Token Price</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{asset.tokenPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Available</span>
                  <span className="font-bold text-indigo-600">{asset.availableTokens.toLocaleString()} / {asset.totalTokenSupply.toLocaleString()}</span>
                </div>

                {/* Progress bar */}
                <div className="pt-2">
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${((asset.totalTokenSupply - asset.availableTokens) / asset.totalTokenSupply) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {((asset.totalTokenSupply - asset.availableTokens) / asset.totalTokenSupply * 100).toFixed(1)}% claimed
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600">Verified</span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(asset.eligibilityTimestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedAsset.assetName}</h2>
              <p className="text-slate-500 dark:text-slate-400">{selectedAsset.location.city}, {selectedAsset.location.state}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Asset Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500">NAV</p>
                  <p className="font-bold text-slate-900 dark:text-white">₹{selectedAsset.expectedNAV.mean.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500">Yield</p>
                  <p className="font-bold text-emerald-600">{selectedAsset.expectedYield.expected.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500">Token Price</p>
                  <p className="font-bold text-slate-900 dark:text-white">₹{selectedAsset.tokenPrice}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500">Available</p>
                  <p className="font-bold text-indigo-600">{selectedAsset.availableTokens.toLocaleString()}</p>
                </div>
              </div>

              {/* SPV Details */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1">SPV</p>
                <p className="font-bold text-slate-900 dark:text-white">{selectedAsset.spv.spvName}</p>
                <p className="text-sm text-slate-500">{selectedAsset.spv.spvRegistrationNumber}</p>
              </div>

              {/* Claim Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Tokens to Acquire
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedAsset.availableTokens}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                  value={claimTokens}
                  onChange={e => setClaimTokens(Math.min(selectedAsset.availableTokens, parseInt(e.target.value) || 0))}
                />
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-slate-500">Cost: ₹{(claimTokens * selectedAsset.tokenPrice).toLocaleString()}</span>
                  <span className="text-indigo-600">
                    {((claimTokens / selectedAsset.totalTokenSupply) * 100).toFixed(2)}% exposure
                  </span>
                </div>
              </div>

              {/* Monthly CF Preview */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  Expected Monthly Cash Flow: <strong>₹{Math.round((claimTokens * selectedAsset.tokenPrice) * (selectedAsset.expectedYield.expected / 100) / 12).toLocaleString()}</strong>
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => setSelectedAsset(null)}
                className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClaim}
                disabled={claiming || claimTokens <= 0 || claimTokens > selectedAsset.availableTokens}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Claim Cash Flow Exposure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EligibleAssetRegistry;
