import React from 'react';
import {
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  User,
  LogOut,
  Command,
  Activity,
  Terminal,
  Server
} from 'lucide-react';
import { UserInfo } from '../../types';

interface TopBarProps {
  user: UserInfo | null;
  onOpenCommandPalette: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  activeIncidentId?: string;
  onNavigateToIncident?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onOpenCommandPalette,
  onOpenLogin,
  onLogout,
  activeIncidentId = 'INC-2026-0812',
  onNavigateToIncident
}) => {
  return (
    <header className="sticky top-0 z-30 h-12 w-full bg-[#08090C] border-b border-[#1A1F2B] px-4 flex items-center justify-between text-xs select-none">
      {/* Left: Product branding & Environment Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#161B26] border border-[#263042] flex items-center justify-center text-blue-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-bold text-slate-100 tracking-tight text-sm">NOVA SRE</span>
            <span className="text-[10px] text-slate-500">v1.0</span>
          </div>
        </div>

        <div className="h-4 w-px bg-[#1A1F2B]" />

        {/* Environment Pill */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#10141D] border border-[#1E2533] text-slate-300 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-subtle-pulse" />
          <span>Production (us-east-1)</span>
        </div>

        {/* Active Incident Context Breadcrumb */}
        {activeIncidentId && (
          <button
            onClick={onNavigateToIncident}
            className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/30 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 font-mono text-[11px] transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="font-bold">{activeIncidentId}</span>
            <span className="text-rose-400/80">· Checkout Latency 3.1x</span>
          </button>
        )}
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-6">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1 rounded bg-[#0E1117] border border-[#1E232F] hover:border-[#2D3748] text-slate-400 text-xs font-mono transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
            <span className="text-slate-400">Search incidents, services, runbooks, SQL...</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#161B26] border border-[#212A38] text-[10px] text-slate-400">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Telemetry Health & SRE Auth Session */}
      <div className="flex items-center gap-3">
        {/* System Health */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">RAG Engine Online</span>
          </div>
        </div>

        <div className="h-4 w-px bg-[#1A1F2B]" />

        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#121620] border border-[#1E2535]">
              <div className="w-4 h-4 rounded bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-[9px] uppercase">
                {user.username.slice(0, 1)}
              </div>
              <span className="font-mono text-slate-200 text-[11px] font-semibold">{user.username}</span>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">({user.role})</span>
            </div>
            <button
              onClick={onLogout}
              title="End Session"
              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] font-semibold transition-colors"
          >
            Authenticate SRE
          </button>
        )}
      </div>
    </header>
  );
};
