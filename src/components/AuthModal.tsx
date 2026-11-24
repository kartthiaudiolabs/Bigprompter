import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { AuthService, AuthUser } from '@/modules/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('kartthiaudiolabs@gmail.com');
  const [password, setPassword] = useState('Kartthi@786');
  const [fullName, setFullName] = useState('Kartthi Audio Labs');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const user = await AuthService.register(email, password, fullName || 'Kartthi Audio Labs');
        onAuthSuccess(user);
        onClose();
      } else {
        const user = await AuthService.login(email, password);
        onAuthSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    try {
      const demo = await AuthService.login('kartthiaudiolabs@gmail.com', 'Kartthi@786');
      onAuthSuccess(demo);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface-200 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              {mode === 'login' ? 'Sign In to Workspace' : 'Create Individual Account'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-800/80 bg-surface-300 text-xs font-semibold">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2.5 text-center transition-all ${
              mode === 'login' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-surface-200' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2.5 text-center transition-all ${
              mode === 'register' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-surface-200' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Senior AI Engineer"
                className="w-full text-xs bg-surface-300 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full text-xs bg-surface-300 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs bg-surface-300 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <span>{mode === 'login' ? 'Sign In to Workspace' : 'Register & Start Engineering'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Quick Demo Sign In */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2 px-3 rounded-lg bg-surface-300 hover:bg-surface-100 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Instant Sign-In as Kartthi Audio Labs</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
