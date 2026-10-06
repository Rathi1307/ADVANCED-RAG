import React, { useState } from 'react';
import { Shield, X, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { ApiService } from '../services/api';
import { UserInfo } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserInfo) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('sre_lead');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await ApiService.login(username, password);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const setTestUser = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">SRE Security Authentication</h3>
            <p className="text-xs font-mono text-slate-400">JWT Bearer & RBAC Authorization</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Username / Identifier</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Preset Profile Selectors */}
          <div className="pt-2">
            <p className="text-[10px] font-mono text-slate-400 mb-1.5 uppercase">Test SRE Role Profiles:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTestUser('sre_lead', 'Password123!')}
                className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-blue-500 text-left transition-all"
              >
                <p className="text-[11px] font-semibold text-slate-200">sre_lead</p>
                <p className="text-[9px] font-mono text-cyan-400">Role: SRE</p>
              </button>

              <button
                type="button"
                onClick={() => setTestUser('lead_approver', 'Password123!')}
                className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-purple-500 text-left transition-all"
              >
                <p className="text-[11px] font-semibold text-slate-200">approver</p>
                <p className="text-[9px] font-mono text-purple-400">Role: Approver</p>
              </button>

              <button
                type="button"
                onClick={() => setTestUser('admin_user', 'Password123!')}
                className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-emerald-500 text-left transition-all"
              >
                <p className="text-[11px] font-semibold text-slate-200">admin_user</p>
                <p className="text-[9px] font-mono text-emerald-400">Role: Admin</p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Authenticating...' : 'Sign In & Authenticate Session'}
          </button>
        </form>
      </div>
    </div>
  );
};
