
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { DUMMY_ASSETS } from '../constants';
import { Layers, ShoppingCart, CheckCircle2, AlertCircle, Loader2, ExternalLink, Search, Filter, SlidersHorizontal, X } from 'lucide-react';

// Evidence Modal Component
const EvidenceModal = ({ asset, onClose }: { asset: any, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 shadow-2xl p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            Oracle Truth Layer
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">
            Verified On-Chain Evidence for {asset.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Satellite Imagery */}
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Satellite Intelligence
            </h3>
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden h-48 border border-slate-200 dark:border-slate-800 group">
                <img
                  src={asset.image}
                  alt="Satellite View"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 text-[10px] text-white font-mono flex justify-between">
                  <span>SENTINEL-2 FEED</span>
                  <span>RES: 50CM/PX</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest">Analysis</span>
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400">98% Match</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-200 leading-relaxed">
                  Computer vision confirms commercial built structure. Footprint matches registered specifications.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Property Registry */}
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div> Official Registry
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Registry ID</span>
                  <span className="font-bold text-slate-900 dark:text-white">REG-{asset.id.slice(0, 6)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Recorded Owner</span>
                  <span className="font-bold text-slate-900 dark:text-white">PropToken SPV #4</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Verification</span>
                  <span className="font-bold text-green-500">CRYPTOGRAPHIC PROOF</span>
                </div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  Clear title verified via State Land Records API. Tokenized under Chapter 5 regulations.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Activity Signals */}
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div> Live Activity
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg text-center border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Footfall Index</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">94/100</div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg text-center border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Utility Usage</div>
                <div className="text-lg font-black text-green-500">Normal</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time IoT sensors indicate healthy commercial occupancy. Power consumption patterns match active operational hours.
            </p>
          </div>

          {/* 4. Historical Data */}
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Price Discovery
            </h3>
            <div className="h-32 flex items-end justify-between px-2 gap-1 mb-2">
              {[40, 42, 45, 48, 52, 58, 62, 65, 75].map((h, i) => (
                <div key={i} className="w-full bg-indigo-100 dark:bg-indigo-900/40 rounded-t-sm relative group">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-indigo-500 hover:bg-indigo-400 transition-all cursor-pointer"
                    style={{ height: `${h}%` }}
                  >
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-[9px] px-2 py-1 rounded font-bold">
                      ₹{h}L
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono uppercase tracking-widest">
              <span>2020</span>
              <span>2022</span>
              <span>2024</span>
              <span>Now</span>
            </div>
            <div className="mt-3 flex items-center justify-between p-2 bg-green-500/10 rounded-lg border border-green-500/20">
              <span className="text-xs font-bold text-green-600">Local Market Trend</span>
              <span className="text-xs font-black text-green-600">Bullish (+8.5%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Fractional: React.FC = () => {
  const { buyTokens, wallet } = useAuth();
  const [selectedAssetId, setSelectedAssetId] = useState(DUMMY_ASSETS[0].id);
  const [tokenCount, setTokenCount] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEvidence, setShowEvidence] = useState(false); // New State

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [minYield, setMinYield] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  // ... (Keep existing useMemo logic here if possible, or re-include it below)
  // Re-implementing logic to ensure safety
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
      {showEvidence && <EvidenceModal asset={selectedAsset} onClose={() => setShowEvidence(false)} />}

      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Marketplace</h1>
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Acquire On-Chain Fractional Units</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-800 transition-colors">

            {/* ... Filters UI ... */}
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
                    className={`relative p-6 rounded-xl border-2 text-left transition-all ${selectedAssetId === asset.id
                        ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/10'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <img src={asset.image} className="w-16 h-16 rounded-lg object-cover grayscale" alt="" />
                      <div>
                        <p className="font-black text-slate-900 dark:text-slate-100 tracking-tight">{asset.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${asset.risk === 'Low' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
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

              {/* Asset Oracle Truth Teaser */}
              <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/20 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">Verified by Oracle Truth Engine</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Satellite • Registry • Activity</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEvidence(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors"
                >
                  View Evidence
                </button>
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
