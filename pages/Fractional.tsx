
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { DUMMY_ASSETS } from '../constants';
import { Layers, ShoppingCart, CheckCircle2, AlertCircle, Loader2, ExternalLink, Search, Filter, SlidersHorizontal, X } from 'lucide-react';

const Fractional: React.FC = () => {
  const { buyTokens, wallet } = useAuth();
  const [selectedAssetId, setSelectedAssetId] = useState(DUMMY_ASSETS[0].id);
  const [tokenCount, setTokenCount] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [minYield, setMinYield] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  const filteredAssets = useMemo(() => {
    return DUMMY_ASSETS.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            asset.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'All' || asset.risk === riskFilter;
      const matchesYield = asset.yieldPercent >= minYield;
      return matchesSearch && matchesRisk && matchesYield;
    });
  }, [searchTerm, riskFilter, minYield]);

  const selectedAsset = DUMMY_ASSETS.find(a => a.id === selectedAssetId) || filteredAssets[0] || DUMMY_ASSETS[0];
  const totalPrice = selectedAsset.tokenPrice * tokenCount;
  const canAfford = wallet.stablecoinBalance >= totalPrice;

  const handlePurchase = async () => {
    if (!canAfford) return;
    setIsProcessing(true);
    setTxHash(null);
    setError(null);
    try {
      const hash = await buyTokens(selectedAssetId, tokenCount);
      setTxHash(hash);
    } catch (err: any) {
      setError(err.message || 'Transaction failed on network');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setRiskFilter('All');
    setMinYield(0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Marketplace</h1>
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Acquire On-Chain Fractional Units</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-slate-900 dark:text-slate-100">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <Layers className="w-4 h-4" />
                </div>
                Available Land Lots
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search location..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-lg text-sm font-bold outline-none focus:border-indigo-600 transition-all dark:text-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg border-2 transition-all ${showFilters ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-indigo-600'}`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Risk Level</label>
                    <select 
                      className="w-full p-2 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-600 dark:text-slate-200"
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value)}
                    >
                      <option value="All">All Risks</option>
                      <option value="Low">Low Risk</option>
                      <option value="Medium">Medium Risk</option>
                      <option value="High">High Risk</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Min Yield ({minYield}%)</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="15" 
                      step="0.5"
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      value={minYield}
                      onChange={(e) => setMinYield(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={resetFilters}
                      className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              {filteredAssets.length > 0 ? (
                filteredAssets.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => { setSelectedAssetId(asset.id); setError(null); }}
                    className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                      selectedAssetId === asset.id 
                        ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/10' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <img src={asset.image} className="w-16 h-16 rounded-lg object-cover grayscale" alt="" />
                      <div>
                        <p className="font-black text-slate-900 dark:text-slate-100 tracking-tight">{asset.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                             asset.risk === 'Low' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                           }`}>
                             {asset.risk}
                           </span>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">₹{asset.tokenPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    {selectedAssetId === asset.id && (
                      <div className="absolute top-4 right-4 text-indigo-600">
                        <CheckCircle2 className="w-5 h-5 fill-indigo-600 text-white" />
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="col-span-2 py-12 flex flex-col items-center justify-center text-slate-400">
                  <Search className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-black uppercase tracking-widest text-sm">No matching assets found</p>
                  <button onClick={resetFilters} className="mt-4 text-xs font-bold text-indigo-600 hover:underline uppercase tracking-widest">Clear all filters</button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-800 transition-colors">
            <h2 className="text-lg font-black uppercase tracking-widest mb-8 text-slate-900 dark:text-slate-100">Transaction Details</h2>
            <div className="space-y-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Units to Mint</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full px-6 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 focus:border-indigo-600 outline-none text-2xl font-black transition-all"
                    value={tokenCount}
                    onChange={e => { setTokenCount(Math.max(1, parseInt(e.target.value) || 0)); setError(null); }}
                  />
                </div>
                <div className="flex flex-wrap items-end gap-3 pb-2">
                  {[10, 50, 100].map(val => (
                    <button 
                      key={val}
                      onClick={() => { setTokenCount(val); setError(null); }}
                      className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg text-xs font-black uppercase tracking-widest transition-colors"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Contract Asset</span>
                  <span className="font-black text-slate-900 dark:text-slate-100">{selectedAsset.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Price Per Unit</span>
                  <span className="font-black text-slate-900 dark:text-slate-100">₹{selectedAsset.tokenPrice.toLocaleString()}</span>
                </div>
                <div className="h-[2px] bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Protocol Settle</span>
                  <span className="text-4xl font-black text-indigo-600">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-xl text-white">
            <h2 className="text-lg font-black uppercase tracking-widest mb-6">Ledger Execution</h2>
            <div className="space-y-6 mb-10">
              <div className="p-4 bg-white/10 rounded-lg flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">Network</span>
                <span className="font-black text-indigo-400">Polygon</span>
              </div>
              {!canAfford && (
                <div className="p-4 bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" /> Insufficient Funds
                </div>
              )}
              {error && (
                <div className="p-4 bg-amber-500/20 text-amber-500 border border-amber-500/50 rounded-lg flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
            </div>

            <button 
              onClick={handlePurchase}
              disabled={isProcessing || !canAfford || filteredAssets.length === 0}
              className="w-full bg-indigo-600 text-white py-5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 btn-flat"
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <> <ShoppingCart className="w-5 h-5" /> Sign & Mint Units </>
              )}
            </button>
            <p className="text-center text-[10px] text-white/40 mt-6 uppercase font-black leading-tight tracking-widest">
              Transaction will be broadcasted to the Polygon network for finality.
            </p>
          </div>

          {txHash && (
            <div className="bg-emerald-500 text-white p-8 rounded-xl space-y-4 animate-in zoom-in duration-300">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-8 h-8 shrink-0" />
                <p className="font-black text-lg uppercase tracking-tight">Minted</p>
              </div>
              <div className="bg-black/20 p-4 rounded-lg">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Transaction Hash</p>
                <p className="text-[10px] font-mono break-all opacity-90">{txHash}</p>
              </div>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:underline">
                View on Polygonscan <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fractional;
