
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DUMMY_ASSETS } from '../constants';
import { CreditCard, ShieldCheck, ShoppingBag, Lock, Info, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const Pay: React.FC = () => {
  const { wallet, makePayment, lockAsCollateral } = useAuth();
  const [activeTab, setActiveTab] = useState<'pay' | 'collateral'>('pay');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [lockAssetId, setLockAssetId] = useState(DUMMY_ASSETS[0].id);
  const [lockAmount, setLockAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (payAmount <= 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      const success = await makePayment(payAmount);
      if (success) {
        setShowSuccess(true);
        setPayAmount(0);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError("Payment protocol rejected the settlement");
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLock = async () => {
    if (lockAmount <= 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      await lockAsCollateral(lockAssetId, lockAmount);
      setShowSuccess(true);
      setLockAmount(0);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Collateralization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedLockAsset = DUMMY_ASSETS.find(a => a.id === lockAssetId)!;
  const ownedTokens = wallet.tokensByAsset[lockAssetId] || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Financial Utility</h1>
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Payments & Plot Collateralization</p>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl w-full max-w-md border-2 border-slate-200 dark:border-slate-800 transition-colors">
        <button 
          onClick={() => { setActiveTab('pay'); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'pay' ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          <ShoppingBag className="w-4 h-4" /> Settlement
        </button>
        <button 
          onClick={() => { setActiveTab('collateral'); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'collateral' ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          <Lock className="w-4 h-4" /> Liquidity
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          {activeTab === 'pay' ? (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-xl border-2 border-slate-100 dark:border-slate-800 space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3 uppercase tracking-widest">
                <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-lg flex items-center justify-center text-white">
                  <CreditCard className="w-5 h-5" />
                </div>
                Merchant settlement
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">Settle real-world transactions using your land-backed INR yield.</p>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Amount (INR)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full px-6 py-6 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-transparent dark:text-slate-100 text-4xl font-black outline-none focus:border-indigo-600 transition-all"
                    value={payAmount || ''}
                    onChange={e => { setPayAmount(parseFloat(e.target.value) || 0); setError(null); }}
                  />
                </div>
                
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-slate-100 dark:border-slate-800 flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">₹</div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Settlement Wallet</p>
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹{wallet.stablecoinBalance.toLocaleString()}</p>
                  </div>
                </div>

                {(payAmount > wallet.stablecoinBalance || error) && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-100 dark:border-red-900/30 rounded-lg flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error || "Insufficient yield funds"}
                  </div>
                )}

                <button 
                  onClick={handlePay}
                  disabled={isProcessing || payAmount <= 0 || payAmount > wallet.stablecoinBalance}
                  className="w-full bg-slate-900 dark:bg-slate-700 text-white py-5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 btn-flat"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Settlement"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-xl border-2 border-slate-100 dark:border-slate-800 space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3 uppercase tracking-widest">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <Lock className="w-5 h-5" />
                </div>
                Collateralized credit
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">Lock your plot units to access instant credit lines without losing ownership.</p>

              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Asset</label>
                    <select 
                      className="w-full px-4 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-transparent dark:text-slate-100 font-black outline-none focus:border-indigo-600 transition-all uppercase text-xs"
                      value={lockAssetId}
                      onChange={e => { setLockAssetId(e.target.value); setError(null); }}
                    >
                      {DUMMY_ASSETS.map(asset => (
                        <option key={asset.id} value={asset.id}>{asset.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Units to Lock</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full px-4 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-transparent dark:text-slate-100 text-xl font-black outline-none focus:border-indigo-600 transition-all"
                      value={lockAmount || ''}
                      onChange={e => { setLockAmount(Math.min(ownedTokens, Math.max(0, parseInt(e.target.value) || 0))); setError(null); }}
                    />
                  </div>
                </div>

                <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/50 space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Available Credit</span>
                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">₹{(lockAmount * selectedLockAsset.tokenPrice * 0.6).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full w-[60%]"></div>
                  </div>
                  <p className="text-[10px] font-black text-indigo-600/60 uppercase text-center tracking-widest">Maximum LTV: 60%</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-100 dark:border-red-900/30 rounded-lg flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <button 
                  onClick={handleLock}
                  disabled={isProcessing || lockAmount <= 0}
                  className="w-full bg-indigo-600 text-white py-5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 btn-flat"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Initiate Collateral Vault"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-10">
          <div className="bg-slate-900 dark:bg-slate-800 text-white p-10 rounded-xl transition-colors">
            <h3 className="text-lg font-black uppercase tracking-widest mb-10 text-indigo-400">Ledger Summary</h3>
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Settlement Balance</p>
                  <p className="text-3xl font-black">₹{wallet.stablecoinBalance.toLocaleString()} <span className="text-xs opacity-40">INR</span></p>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-white">
                   <CreditCard className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Locked Net Value</p>
                  <p className="text-3xl font-black">₹{wallet.lockedCollateral.toLocaleString()} <span className="text-xs opacity-40">INR</span></p>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-white">
                   <Lock className="w-6 h-6" />
                </div>
              </div>
              <div className="h-[2px] bg-white/10"></div>
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">Transactions secured by non-custodial multi-sig smart contracts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-10 right-10 bg-emerald-500 text-white px-10 py-5 rounded-xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-right-10 duration-300 z-50">
          <CheckCircle2 className="w-8 h-8" />
          <span className="font-black uppercase tracking-widest text-sm">Protocol Update Successful</span>
        </div>
      )}
    </div>
  );
};

export default Pay;
