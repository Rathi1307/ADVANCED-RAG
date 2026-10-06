import React from 'react';
import { Server, Activity, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { ServiceData } from '../../types';

export const ServicesView: React.FC = () => {
  const services: ServiceData[] = [
    {
      id: 'svc-checkout-001',
      name: 'checkout-service',
      tier: 'Tier-1',
      status: 'Degraded',
      owning_team: 'payments-and-checkout',
      slo_target_ms: 200,
      current_p99_ms: 620,
      error_rate_pct: 4.8,
      pods_count: 8,
      restarts_count: 22,
      active_version: 'v42 (DEP-2026-9901)'
    },
    {
      id: 'svc-auth-002',
      name: 'auth-service',
      tier: 'Tier-1',
      status: 'Healthy',
      owning_team: 'security-platform',
      slo_target_ms: 50,
      current_p99_ms: 42,
      error_rate_pct: 0.02,
      pods_count: 4,
      restarts_count: 0,
      active_version: 'v18.4'
    },
    {
      id: 'svc-payment-003',
      name: 'payment-gateway',
      tier: 'Tier-1',
      status: 'Healthy',
      owning_team: 'payments-and-checkout',
      slo_target_ms: 150,
      current_p99_ms: 128,
      error_rate_pct: 0.1,
      pods_count: 6,
      restarts_count: 1,
      active_version: 'v29.1'
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E232F]">
        <div>
          <h2 className="text-base font-bold text-slate-100">Service Registry & Operational Telemetry</h2>
          <p className="text-slate-400 text-xs">SLO budgets, pod restart metrics, and active deployment versions.</p>
        </div>
        <span className="text-[11px] px-2 py-1 rounded bg-[#10141D] border border-[#1E2533] text-slate-300">
          3 Monitored Services
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {services.map(svc => (
          <div
            key={svc.id}
            className={`p-5 rounded-xl border ${
              svc.status === 'Degraded'
                ? 'bg-[#10141E] border-amber-500/40'
                : 'bg-[#0E1117] border-[#1E232F]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${
                  svc.status === 'Healthy' ? 'bg-emerald-400' : 'bg-amber-400 animate-subtle-pulse'
                }`} />
                <h3 className="font-bold text-slate-100 text-sm">{svc.name}</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                  {svc.tier}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">{svc.owning_team}</span>
              </div>

              <div className="text-right text-[11px] text-slate-400">
                <span>Active Commit: <code className="text-cyan-400">{svc.active_version}</code></span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#141822] border border-[#1F2633]">
                <span className="text-slate-500 block text-[10px] uppercase">P99 Latency / Target</span>
                <span className={`font-bold ${svc.current_p99_ms > svc.slo_target_ms ? 'text-amber-400' : 'text-slate-200'}`}>
                  {svc.current_p99_ms}ms <span className="text-slate-500 font-normal">/ &lt;{svc.slo_target_ms}ms</span>
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#141822] border border-[#1F2633]">
                <span className="text-slate-500 block text-[10px] uppercase">Error Rate</span>
                <span className={`font-bold ${svc.error_rate_pct > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {svc.error_rate_pct}%
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#141822] border border-[#1F2633]">
                <span className="text-slate-500 block text-[10px] uppercase">Pods Active</span>
                <span className="text-slate-200 font-bold">{svc.pods_count} replicas</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#141822] border border-[#1F2633]">
                <span className="text-slate-500 block text-[10px] uppercase">Restart Count</span>
                <span className={`font-bold ${svc.restarts_count > 5 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {svc.restarts_count} restarts
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
