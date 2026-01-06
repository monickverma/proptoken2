
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Layers, 
  TrendingUp, 
  RefreshCcw, 
  CreditCard, 
  UserCircle,
  Building2
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Verify Asset', path: '/verify', icon: ShieldCheck },
    { name: 'Fractional', path: '/fractional', icon: Layers },
    { name: 'Yields', path: '/yield', icon: TrendingUp },
    { name: 'Swap', path: '/swap', icon: RefreshCcw },
    { name: 'Pay & Collateral', path: '/pay', icon: CreditCard },
    { name: 'Account', path: '/account', icon: UserCircle },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r-2 border-slate-100 dark:border-slate-800 hidden md:flex flex-col h-screen sticky top-0 transition-colors duration-200">
      <div className="p-8 flex items-center gap-3 text-indigo-600 font-extrabold text-2xl tracking-tighter">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <Building2 className="w-6 h-6" />
        </div>
        <span className="dark:text-indigo-400">PropToken</span>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              <span className="font-bold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-6">
        <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">Status</p>
          <p className="text-sm font-bold">Pro Investor</p>
          <div className="w-full bg-slate-800 dark:bg-slate-700 h-1.5 rounded-full mt-3">
            <div className="bg-indigo-500 h-full w-2/3 rounded-full"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
