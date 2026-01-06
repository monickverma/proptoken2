
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Layers, Wallet, Clock, ArrowRight, ShieldCheck, CreditCard, RefreshCcw, ShoppingCart, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const Account: React.FC = () => {
  const { user, wallet } = useAuth();

  const totalTokens = (Object.values(wallet.tokensByAsset) as number[]).reduce((a: number, b: number) => a + b, 0);
  const totalAssets = (Object.values(wallet.tokensByAsset) as number[]).filter((count: number) => count > 0).length;

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'BUY_TOKENS': return <ShoppingCart className="w-5 h-5 text-indigo-600" />;
      case 'SWAP': return <RefreshCcw className="w-5 h-5 text-blue-600" />;
      case 'VERIFY': return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'PAYMENT': return <CreditCard className="w-5 h-5 text-slate-600" />;
      case 'COLLATERAL_LOCK': return <Clock className="w-5 h-5 text-amber-600" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Account</h1>
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Identity & Immutable Transaction Log</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-xl border-2 border-slate-100 dark:border-slate-800 flex flex-col items-center text-center transition-colors">
            <div className="w-32 h-32 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-5xl font-black mb-8 border-8 border-indigo-50 dark:border-indigo-900/20">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">{user?.name}</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{user?.email}</p>
            
            {user?.walletAddress && (
              <div className="mt-6 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vault Address</p>
                <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 break-all">{user.walletAddress}</p>
              </div>
            )}

            <div className="w-full h-[2px] bg-slate-100 dark:bg-slate-800 my-8"></div>
            <button className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-lg font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-colors btn-flat">
              Update Identity
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-800 space-y-6 transition-colors">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Ledger Network</span>
              <span className="text-emerald-500">Polygon Mainnet</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Consensus Status</span>
              <span className="text-emerald-500">Synchronized</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-800 transition-colors">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Minted Units</p>
              <p className="text-4xl font-black text-slate-900 dark:text-slate-100">{totalTokens.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-800 transition-colors">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Active Yields</p>
              <p className="text-4xl font-black text-slate-900 dark:text-slate-100">{totalAssets}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-800 transition-colors">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Stablecoin</p>
              <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">₹{wallet.stablecoinBalance.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="px-10 py-8 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">On-Chain Activity</h3>
              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:underline">
                View on Polygonscan <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y-2 divide-slate-50 dark:divide-slate-800">
              {wallet.history.map((action) => (
                <div key={action.id} className="px-10 py-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-transparent">
                        {getActionIcon(action.type)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-slate-100 text-sm tracking-tight">{action.description}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{format(new Date(action.timestamp), 'MMM dd, yyyy • hh:mm a')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {action.amount && (
                        <p className={`font-black text-sm uppercase tracking-tight ${action.type === 'BUY_TOKENS' || action.type === 'PAYMENT' ? 'text-red-500' : 'text-emerald-500'}`}>
                          {action.type === 'BUY_TOKENS' || action.type === 'PAYMENT' ? '-' : '+'}{action.amount}
                        </p>
                      )}
                    </div>
                  </div>
                  {action.txHash && (
                    <div className="ml-20 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hash</span>
                        <span className="text-[9px] font-mono text-slate-500 truncate max-w-[300px]">{action.txHash}</span>
                      </div>
                      <button className="text-indigo-600 dark:text-indigo-400">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
