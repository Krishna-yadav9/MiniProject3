import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      onNavigate('products');
    } catch {
      // Error handled in AuthContext
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    clearError();
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-stone-900">
            Sign In to Apex
          </h2>
          <p className="text-xs text-stone-500">
            Secure Spring Security 6 authentication & JWT session
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md transition disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Sign In with Spring Security'}
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div className="pt-4 border-t border-stone-100 space-y-2">
          <span className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider text-center">
            Quick Test Credentials
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillCredentials('admin@apexstore.com', 'Admin@2026!')}
              className="p-2 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl text-left transition flex flex-col"
            >
              <span className="font-bold text-indigo-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin</span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono">ROLE_ADMIN</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('customer@apexstore.com', 'Customer@2026!')}
              className="p-2 border border-stone-200 bg-stone-50/60 hover:bg-stone-100 rounded-xl text-left transition flex flex-col"
            >
              <span className="font-bold text-stone-700">Customer</span>
              <span className="text-[10px] text-stone-500 font-mono">ROLE_USER</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-stone-500">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-indigo-600 font-bold hover:underline"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};
