import React from 'react';
import { Shield, Activity, Terminal, Database, FileText, User, LogOut, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { UserInfo } from '../types';

interface HeaderProps {
  user: UserInfo | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#07090e]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-glow-blue">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-cyan-300 tracking-tight text-lg">
                  AGENTIC SRE
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
                Evidence-Grounded Incident Investigation
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('investigate')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'investigate'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Investigation Console
            </button>

            <button
              onClick={() => setActiveTab('infra')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'infra'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Cluster Matrix
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'knowledge'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Runbooks & Corpus
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'audit'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Audit Stream
            </button>
          </nav>

          {/* Right Action / Auth Badge */}
          <div className="flex items-center gap-3">
            {/* Live Pipeline Badge */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>9-Layer Security Active</span>
            </div>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-700/60 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {user.username.slice(0, 2)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-200 leading-none">{user.username}</p>
                    <p className="text-[10px] font-mono text-cyan-400 uppercase leading-none mt-0.5">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                SRE Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
