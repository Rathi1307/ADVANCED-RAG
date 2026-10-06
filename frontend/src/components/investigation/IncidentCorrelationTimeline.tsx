import React from 'react';
import { GitCommit, Gauge, AlertCircle, Bot, CheckCircle2, ArrowDown } from 'lucide-react';

export const IncidentCorrelationTimeline: React.FC = () => {
  const events = [
    {
      time: '14:15 UTC',
      label: 'Deployment DEP-2026-9901 (v42)',
      service: 'checkout-service',
      desc: 'Config diff: REDIS_POOL_SIZE reduced from 50 to 5',
      type: 'deploy',
      icon: GitCommit,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    },
    {
      time: '14:18 UTC',
      label: 'Latency P99 Spike (620ms ▲ 3.1x)',
      service: 'checkout-service',
      desc: 'SLO threshold breach (>200ms target). Client timeout surge.',
      type: 'metric',
      icon: Gauge,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      time: '14:22 UTC',
      label: 'Kubernetes Pod Errors (ERR_REDIS_TIMEOUT)',
      service: 'checkout-service-78f56-kx8w2',
      desc: 'Connection pool exhausted; 8 pod restarts in 10 minutes.',
      type: 'pod',
      icon: AlertCircle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    },
    {
      time: '14:30 UTC',
      label: 'P1 Incident Triggered (INC-2026-0812)',
      service: 'checkout-service',
      desc: 'On-call SRE paged. SRE Assistant initiated investigation.',
      type: 'incident',
      icon: AlertCircle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    },
    {
      time: '14:35 UTC',
      label: 'AI Evidence Correlation Identified',
      service: 'AI SRE Assistant',
      desc: 'Correlated DEP-2026-9901 diff with historical Incident INC-2026-0504 (PMM-2026-0504). Recommended rollback.',
      type: 'ai',
      icon: Bot,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    }
  ];

  return (
    <div className="p-4 rounded-xl bg-[#0E1117] border border-[#1E232F] font-mono text-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E232F]">
        <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">
          Multi-Signal Incident Correlation Timeline
        </span>
        <span className="text-[10px] text-cyan-400">Automated Change Correlation</span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1E2535]">
        {events.map((evt, idx) => {
          const Icon = evt.icon;
          return (
            <div key={idx} className="relative group">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#0E1117] border border-[#2E394E] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
              </div>

              <div className="p-2.5 rounded-lg bg-[#141822] border border-[#1F2633] space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${evt.color}`}>
                      {evt.time}
                    </span>
                    <span className="font-semibold text-slate-200">{evt.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{evt.service}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{evt.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
