
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signIn(formData.email);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-white dark:bg-slate-950 transition-colors">
      <Link to="/" className="flex items-center gap-3 text-indigo-600 font-black text-3xl tracking-tighter mb-12">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
          <Building2 className="w-7 h-7" />
        </div>
        <span>PropToken</span>
      </Link>
      
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter mb-2">Welcome Back</h2>
        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-10">Verify Access Key</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-3 text-xs font-black uppercase tracking-widest border-2 border-red-100 dark:border-red-900/30">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Email Address</label>
            <input 
              required
              type="email" 
              placeholder="name@example.com"
              className="w-full px-6 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-transparent dark:text-slate-100 focus:border-indigo-600 outline-none transition-all font-bold"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Access Key</label>
              <button type="button" className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-widest">Reset?</button>
            </div>
            <input 
              required
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              className="w-full px-6 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-transparent dark:text-slate-100 focus:border-indigo-600 outline-none transition-all font-bold"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 bottom-4 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button 
            disabled={isLoading}
            type="submit" 
            className="w-full bg-indigo-600 text-white py-5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-900 dark:hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-70 btn-flat"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          New Investor? <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline">Join Platform</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
