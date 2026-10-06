import React from 'react';
import { AlertCircle, Gauge, Zap, Database, Server, Clock } from 'lucide-react';

export const MetricsBar: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Metric 1: Active Incident */}
      <div className="glass-panel p-3 rounded-xl border border-rose-500/20 bg-gradient-to-b from-rose-950/20 to-transparent">
        <div className="flex items-center justify-between text-xs text-rose-400 font-medium mb-1">
          <span>Active Incident</span>
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-mono text-rose-200">INC-2026-0812</span>
          <span className="text-[10px] px-1 py-0.5 rounded font-bold bg-rose-500/20 text-rose-300">P1</span>
        </div>
        <p className="text-[10px] text-slate-400 truncate mt-1">Checkout latency 3x spike</p>
      </div>

      {/* Metric 2: P99 Latency */}
      <div className="glass-panel p-3 rounded-xl border border-amber-500/20 bg-gradient-to-b from-amber-950/20 to-transparent">
        <div className="flex items-center justify-between text-xs text-amber-400 font-medium mb-1">
          <span>P99 Latency</span>
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-amber-200">620ms</span>
          <span className="text-[10px] font-mono text-rose-400 font-bold">▲ 3.1x</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">SLO target: &lt; 200ms</p>
      </div>

      {/* Metric 3: Pod Health */}
      <div className="glass-panel p-3 rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
          <span>Pod Failures</span>
          <Server className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-100">2 <span className="text-xs text-slate-500">/ 18</span></span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-500/20 text-rose-400">CrashLoop</span>
        </div>
        <p className="text-[10px] text-slate-400 truncate mt-1">ERR_REDIS_TIMEOUT</p>
      </div>

      {/* Metric 4: 5-Tier Cache Hit Rate */}
      <div className="glass-panel p-3 rounded-xl border border-blue-500/20 bg-gradient-to-b from-blue-950/20 to-transparent">
        <div className="flex items-center justify-between text-xs text-blue-400 font-medium mb-1">
          <span>5-Tier Cache</span>
          <Zap className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-blue-200">87.4%</span>
          <span className="text-[10px] text-emerald-400 font-bold">SHA-256</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Avg hit save: ~320ms</p>
      </div>

      {/* Metric 5: Token Budget */}
      <div className="glass-panel p-3 rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-transparent">
        <div className="flex items-center justify-between text-xs text-purple-400 font-medium mb-1">
          <span>Daily Budget</span>
          <Database className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-purple-200">98.8k</span>
          <span className="text-xs text-slate-500 font-mono">/ 100k</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">L6 budget enforcement</p>
      </div>

      {/* Metric 6: Rate Limiter */}
      <div className="glass-panel p-3 rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 to-transparent">
        <div className="flex items-center justify-between text-xs text-emerald-400 font-medium mb-1">
          <span>L4b Rate Window</span>
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-emerald-200">1 <span className="text-xs text-slate-500">/ 20</span></span>
          <span className="text-[10px] text-emerald-400 font-bold">Active</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Sliding 60s per user</p>
      </div>
    </div>
  );
};
