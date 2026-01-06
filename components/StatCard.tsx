
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: LucideIcon;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, positive, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 transition-colors group">
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-xl ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-tight ${positive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {change}
          </div>
        )}
      </div>
      <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">{value}</h3>
    </div>
  );
};

export default StatCard;
