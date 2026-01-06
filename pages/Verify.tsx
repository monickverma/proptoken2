
import React, { useState } from 'react';
import { Search, ShieldCheck, Loader2, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { DUMMY_ASSETS } from '../constants';
import { Asset } from '../types';

const Verify: React.FC = () => {
  const [assetId, setAssetId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<Asset | null>(null);
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (!assetId) return;
    setIsVerifying(true);
    setError('');
    setResult(null);

    setTimeout(() => {
      const found = DUMMY_ASSETS.find(a => a.id.toLowerCase() === assetId.toLowerCase() || a.name.toLowerCase().includes(assetId.toLowerCase()));
      if (found) {
        setResult(found);
      } else {
        setError('Property ID not found or verification failed. Please check the ID and try again.');
      }
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Verification</h1>
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Audit On-Chain Assets</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Enter Asset ID (e.g. prop-001)"
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-transparent dark:text-slate-100 focus:border-indigo-600 outline-none transition-all font-bold"
              value={assetId}
              onChange={e => setAssetId(e.target.value)}
            />
          </div>
          <button 
            onClick={handleVerify}
            disabled={isVerifying || !assetId}
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-900 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 btn-flat"
          >
            {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Run Audit"}
          </button>
        </div>

        <div className="mt-8 flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-slate-100 dark:border-slate-800">
          <Info className="w-6 h-6 text-indigo-600 shrink-0" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
            All verification results are pulled from the distributed ledger and Cross-Verified against national land records and property tax systems.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-6 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-8 h-8 shrink-0" />
          <p className="font-black uppercase tracking-tight">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-indigo-600 p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
                <ShieldCheck className="w-4 h-4" /> Verified Asset
              </div>
              <h2 className="text-5xl font-black tracking-tighter leading-none">{result.name}</h2>
              <p className="text-lg font-bold opacity-80 mt-2">{result.location}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Security Rating</p>
              <div className={`px-6 py-2 rounded-xl font-black text-sm uppercase tracking-widest ${
                result.risk === 'Low' ? 'bg-emerald-500' : result.risk === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
              }`}>
                {result.risk} Risk
              </div>
            </div>
          </div>

          <div className="p-10 grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest border-b-2 border-slate-100 dark:border-slate-800 pb-3">Technical Summary</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Verification confirms that {result.name} is a high-grade commercial asset with a projected yield of {result.yieldPercent}%. All title deed documentation is cryptographically linked to token contract <span className="text-indigo-600 dark:text-indigo-400 font-bold">0x{result.id.toUpperCase()}</span>.
              </p>
              <div className="flex items-center gap-5 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/50">
                <TrendingUp className="w-12 h-12 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Yield Projections</p>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Expected annual growth of 14.5% over 5 years.</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest border-b-2 border-slate-100 dark:border-slate-800 pb-3 mb-8">Asset Metrics</h3>
              <div className="space-y-6">
                {[
                  { label: 'Market Value', value: `$${(result.tokenPrice * result.totalTokens).toLocaleString()}` },
                  { label: 'Total Supply', value: `${result.totalTokens.toLocaleString()} UNITS` },
                  { label: 'Occupancy Rate', value: '98.4%', highlight: 'text-emerald-500' },
                  { label: 'On-Chain Proof', value: 'Verified', highlight: 'text-emerald-500' }
                ].map((m, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">{m.label}</span>
                    <span className={`font-black ${m.highlight || 'text-slate-900 dark:text-slate-100'}`}>{m.value}</span>
                  </div>
                ))}
                <div className="pt-4">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full w-[92%] rounded-full"></div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest">Trust Index: 9.2/10</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verify;
