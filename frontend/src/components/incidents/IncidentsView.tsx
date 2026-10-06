import React from 'react';
import { AlertOctagon, Clock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Incident } from '../../types';

export const IncidentsView: React.FC<{ onSelectIncident?: (id: string) => void }> = () => {
  const incidents: Incident[] = [
    {
      id: 'INC-2026-0812',
      title: 'Checkout latency 3x spike and connection timeout errors',
      severity: 'P1',
      status: 'investigating',
      service: 'checkout-service',
      started_at: '2026-10-05 14:30 UTC (45m ago)',
      lead_engineer: 'sre_lead',
      summary: 'Checkout service latency surged from 180ms to 620ms following deployment DEP-2026-9901. Multiple pod restarts with ERR_REDIS_TIMEOUT.',
      current_latency_p99: '620ms',
      baseline_latency_p99: '180ms',
      error_rate: '4.8%'
    },
    {
      id: 'INC-2026-0504',
      title: 'Checkout latency surge & Redis connection throttling (Past Incident)',
      severity: 'P1',
      status: 'resolved',
      service: 'checkout-service',
      started_at: '2026-05-04 09:12 UTC',
      lead_engineer: 'sre_lead',
      summary: 'Connection pool reduced to 5 caused 3.5x latency surge. Resolved via rollback to previous stable commit.',
      current_latency_p99: '170ms',
      baseline_latency_p99: '170ms',
      error_rate: '0.01%'
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E232F]">
        <div>
          <h2 className="text-base font-bold text-slate-100">Production Incidents & Historical Precedents</h2>
          <p className="text-slate-400 text-xs">Active and historical incident records correlated with SRE investigation telemetry.</p>
        </div>
        <span className="text-[11px] px-2 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold">
          1 Active P1 Incident
        </span>
      </div>

      <div className="space-y-4">
        {incidents.map(inc => (
          <div
            key={inc.id}
            className={`p-5 rounded-xl border ${
              inc.status === 'investigating'
                ? 'bg-[#10141E] border-rose-500/40 shadow-glow-blue'
                : 'bg-[#0E1117] border-[#1E232F]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  inc.severity === 'P1' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {inc.severity}
                </span>
                <span className="font-bold text-slate-100 text-sm">{inc.id}</span>
                <span className="text-slate-500">·</span>
                <span className="text-cyan-400 font-semibold">{inc.service}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span>Status: <strong className={inc.status === 'resolved' ? 'text-emerald-400' : 'text-rose-400'}>{inc.status.toUpperCase()}</strong></span>
                <span>Lead: <strong className="text-slate-200">{inc.lead_engineer}</strong></span>
                <span>Started: {inc.started_at}</span>
              </div>
            </div>

            <h3 className="text-xs font-semibold text-slate-200 mb-2">{inc.title}</h3>
            <p className="text-[11px] text-slate-400 bg-[#08090C] p-3 rounded-lg border border-[#1A1F2B] mb-3 leading-relaxed">
              {inc.summary}
            </p>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded bg-[#141822] border border-[#1E2535]">
                <span className="text-slate-500 block text-[10px] uppercase">P99 Latency</span>
                <span className="text-slate-200 font-bold">{inc.current_latency_p99} <span className="text-slate-500 font-normal">(baseline: {inc.baseline_latency_p99})</span></span>
              </div>
              <div className="p-2 rounded bg-[#141822] border border-[#1E2535]">
                <span className="text-slate-500 block text-[10px] uppercase">Error Rate</span>
                <span className={inc.error_rate === '0.01%' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{inc.error_rate}</span>
              </div>
              <div className="p-2 rounded bg-[#141822] border border-[#1E2535]">
                <span className="text-slate-500 block text-[10px] uppercase">Correlated Knowledge</span>
                <span className="text-blue-300 font-bold">Runbook RBK-CHK-001</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
