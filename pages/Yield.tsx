
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DUMMY_ASSETS } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Calendar, ArrowUpRight } from 'lucide-react';

const Yield: React.FC = () => {
  const { wallet } = useAuth();

  const chartData = [
    { month: 'Jan', income: 4500 },
    { month: 'Feb', income: 5200 },
    { month: 'Mar', income: 4800 },
    { month: 'Apr', income: 6100 },
    { month: 'May', income: 5900 },
    { month: 'Jun', income: 7200 },
    { month: 'Jul', income: 8400 },
    { month: 'Aug', income: 8100 },
    { month: 'Sep', income: 9300 },
    { month: 'Oct', income: 10500 },
    { month: 'Nov', income: 11200 },
    { month: 'Dec', income: 12500 },
  ];

  const totalMonthlyIncome = DUMMY_ASSETS.reduce((acc, asset) => {
    const tokens = wallet.tokensByAsset[asset.id] || 0;
    const value = tokens * asset.tokenPrice;
    return acc + (value * (asset.yieldPercent / 100)) / 12;
  }, 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Yield Intelligence</h1>
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Indian Plot Appreciation Analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-800 flex items-center gap-6 transition-colors">
          <div className="p-4 bg-emerald-500 rounded-xl text-white">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Monthly Reward</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">₹{totalMonthlyIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-800 flex items-center gap-6 transition-colors">
          <div className="p-4 bg-indigo-600 rounded-xl text-white">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Portfolio yield</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">10.15%</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-800 flex items-center gap-6 transition-colors">
          <div className="p-4 bg-slate-900 dark:bg-slate-700 rounded-xl text-white">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Yearly Forecast</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">₹{(totalMonthlyIncome * 12).toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-10 rounded-xl border-2 border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase tracking-widest">Growth Performance</h2>
            <div className="flex gap-2">
              <span className="flex items-center gap-2 text-[10px] font-black text-white bg-emerald-500 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                <ArrowUpRight className="w-4 h-4" /> +12.4% YoY
              </span>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}}
                  dx={-15}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111827', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff',
                    padding: '12px',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#4f46e5', strokeWidth: 2 }}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="income" 
                  stroke="#4f46e5" 
                  strokeWidth={5} 
                  dot={{ r: 0 }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-10 rounded-xl border-2 border-slate-100 dark:border-slate-800 transition-colors">
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase tracking-widest mb-10">Allocation</h2>
          <div className="space-y-10">
            {DUMMY_ASSETS.map(asset => {
              const tokens = wallet.tokensByAsset[asset.id] || 0;
              const hasTokens = tokens > 0;
              return (
                <div key={asset.id} className={`${!hasTokens && 'opacity-20'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">{asset.name}</span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{asset.yieldPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full" 
                      style={{ width: `${asset.yieldPercent * 7}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Est. Reward</span>
                    <span className="text-[10px] text-slate-900 dark:text-slate-300 font-black">
                      ₹{((tokens * asset.tokenPrice * (asset.yieldPercent / 100)) / 12).toLocaleString(undefined, {maximumFractionDigits: 0})} / MO
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-12 py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors btn-flat">
            Export Land Ledger (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Yield;
