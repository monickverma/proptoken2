
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DUMMY_ASSETS } from '../constants';
import { RefreshCcw, ArrowDown, Wallet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const Swap: React.FC = () => {
  const { wallet, swapToStablecoin } = useAuth();
  const [assetId, setAssetId] = useState(DUMMY_ASSETS[0].id);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAsset = DUMMY_ASSETS.find(a => a.id === assetId)!;
  const ownedTokens = wallet.tokensByAsset[assetId] || 0;
  const outputINR = tokenAmount * selectedAsset.tokenPrice;

  const handleSwap = async () => {
    if (tokenAmount <= 0) return;
    if (tokenAmount > ownedTokens) {
      setError("Insufficient units owned");
      return;
    }
    setIsSwapping(true);
    setError(null);
    try {
      await swapToStablecoin(assetId, tokenAmount);
      setShowSuccess(true);
      setTokenAmount(0);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Liquidation failed');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="text-center">
        <h1 className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">Liquid Swap</h1>
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-2">Instant Unit Conversion</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border-2 border-slate-100 dark:border-slate-800 relative transition-colors">
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Asset Selection</label>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <select 
                className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 font-black text-slate-900 dark:text-slate-100 focus:border-indigo-600 outline-none uppercase text-xs tracking-widest"
                value={assetId}
                onChange={e => { setAssetId(e.target.value); setError(null); }}
              >
                {DUMMY_ASSETS.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.name}</option>
                ))}
              </select>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</p>
                <button 
                  onClick={() => { setTokenAmount(ownedTokens); setError(null); }}
                  className="text-sm font-black text-indigo-600 hover:text-indigo-800"
                >
                  {ownedTokens} Units
                </button>
              </div>
            </div>
            <input 
              type="number" 
              placeholder="0.00"
              className="w-full bg-transparent text-5xl font-black outline-none tracking-tighter text-slate-900 dark:text-slate-100"
              value={tokenAmount || ''}
              onChange={e => { setTokenAmount(Math.min(ownedTokens, Math.max(0, parseFloat(e.target.value) || 0))); setError(null); }}
            />
          </div>
        </div>

        <div className="flex justify-center -my-6 relative z-10">
          <div className="bg-indigo-600 p-4 rounded-xl text-white border-4 border-white dark:border-slate-900">
            <ArrowDown className="w-6 h-6" />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">INR Settlement</label>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg text-white">
                <span className="font-black text-xs uppercase tracking-widest">INR</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</p>
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">₹{wallet.stablecoinBalance.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">₹{outputINR.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <RefreshCcw className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Settlement Rate</span>
            </div>
            <span className="text-[10px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-widest">1 Unit = ₹{selectedAsset.tokenPrice.toLocaleString()} INR</span>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border-2 border-red-100 dark:border-red-900/30 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <button 
            onClick={handleSwap}
            disabled={isSwapping || tokenAmount <= 0}
            className="w-full bg-slate-900 dark:bg-slate-800 text-white py-6 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 btn-flat"
          >
            {isSwapping ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Swap"}
          </button>
        </div>

        {showSuccess && (
          <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center z-20 p-10 text-center animate-in fade-in duration-300">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-8">
               <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter uppercase">Success</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-4 leading-relaxed">Plot units have been liquidated into your INR settlement wallet.</p>
            <button 
              onClick={() => setShowSuccess(false)}
              className="mt-10 bg-indigo-600 text-white px-10 py-4 rounded-lg font-black uppercase tracking-widest text-sm btn-flat"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Swap;
