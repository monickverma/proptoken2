
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { Wallet, Layers, LineChart, ExternalLink, MapPin, Search, Filter } from 'lucide-react';
import { DUMMY_ASSETS } from '../constants';

const Dashboard: React.FC = () => {
  const { wallet } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  const totalTokens = (Object.values(wallet.tokensByAsset) as number[]).reduce((a: number, b: number) => a + b, 0);
  const estYield = DUMMY_ASSETS.reduce((acc, asset) => {
    const tokens = wallet.tokensByAsset[asset.id] || 0;
    const value = tokens * asset.tokenPrice;
    return acc + (value * (asset.yieldPercent / 100)) / 12;
  }, 0);

  const filteredHoldings = useMemo(() => {
    return DUMMY_ASSETS.filter(asset => {
      const tokensOwned = wallet.tokensByAsset[asset.id] || 0;
      if (tokensOwned === 0) return false;
      
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            asset.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'All' || asset.risk === riskFilter;
      
      return matchesSearch && matchesRisk;
    });
  }, [wallet.tokensByAsset, searchTerm, riskFilter]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Portfolio Overview</p>
        </div>
        <button className="bg-indigo-600 text-white px-10 py-4 rounded-lg font-black uppercase tracking-widest text-sm hover:bg-slate-900 dark:hover:bg-slate-800 transition-colors btn-flat">
          Add Funds
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title="Total Invested" 
          value={`₹${wallet.totalInvested.toLocaleString()}`} 
          change="+12.5%" 
          positive={true}
          icon={Wallet}
          colorClass="bg-indigo-600 text-white"
        />
        <StatCard 
          title="Owned Plot Tokens" 
          value={`${totalTokens.toLocaleString()}`} 
          change="+4.2%" 
          positive={true}
          icon={Layers}
          colorClass="bg-slate-900 dark:bg-slate-700 text-white"
        />
        <StatCard 
          title="Monthly Income" 
          value={`₹${estYield.toFixed(2)}`} 
          change="+2.4%" 
          positive={true}
          icon={LineChart}
          colorClass="bg-emerald-500 text-white"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="px-8 py-6 border-b-2 border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-black text-xl text-slate-900 dark:text-slate-100 tracking-tight">Plot Holdings</h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search holdings..."
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-600 transition-all dark:text-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-600 transition-all dark:text-slate-200"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="All">All Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-8 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Asset</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Location</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Tokens</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Value</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50 dark:divide-slate-800">
              {filteredHoldings.length > 0 ? (
                filteredHoldings.map(asset => {
                  const tokens = wallet.tokensByAsset[asset.id] || 0;
                  return (
                    <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <img src={asset.image} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" alt="" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-slate-100 leading-none">{asset.name}</p>
                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase mt-1">YLD {asset.yieldPercent}%</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-bold">
                          <MapPin className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                          {asset.location}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-slate-100 text-right">{tokens.toLocaleString()}</td>
                      <td className="px-8 py-6 text-sm font-black text-indigo-600 dark:text-indigo-400 text-right">₹{(tokens * asset.tokenPrice).toLocaleString()}</td>
                      <td className="px-8 py-6 text-right">
                        <button className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all">
                          Details <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest">
                    {totalTokens === 0 ? "Portfolio is empty" : "No matching holdings found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
