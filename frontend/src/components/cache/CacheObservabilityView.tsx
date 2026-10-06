import React from 'react';
import { Zap, Clock, Database, Layers, CheckCircle2 } from 'lucide-react';

export const CacheObservabilityView: React.FC = () => {
  const tiers = [
    {
      tier: 'Tier 1',
      name: 'Embeddings Cache',
      ttl: '7 days',
      hitRate: '94.2%',
      requestsSaved: '1,420',
      tokenSavings: '~580k tokens',
      invalidation: 'Model version + text SHA-256'
    },
    {
      tier: 'Tier 2',
      name: 'Intent Classification Cache',
      ttl: '24 hours',
      hitRate: '88.5%',
      requestsSaved: '912',
      tokenSavings: '~120k tokens',
      invalidation: 'Query SHA-256 + prompt version'
    },
    {
      tier: 'Tier 3',
      name: 'Schema-Aware SQL Gen Cache',
      ttl: '24 hours',
      hitRate: '79.1%',
      requestsSaved: '340',
      tokenSavings: '~250k tokens',
      invalidation: 'Schema hash + query SHA-256 + user role'
    },
    {
      tier: 'Tier 4',
      name: 'Safe SQL Query Results Cache',
      ttl: '15 minutes',
      hitRate: '68.4%',
      requestsSaved: '512',
      tokenSavings: 'N/A (DB Load Relief)',
      invalidation: 'Query SHA-256 + table freshness timestamps'
    },
    {
      tier: 'Tier 5',
      name: 'Final Verified RAG Answer Cache',
      ttl: '1 hour',
      hitRate: '82.0%',
      requestsSaved: '780',
      tokenSavings: '~1.8M tokens',
      invalidation: 'User scope + corpus version + query SHA-256'
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E232F]">
        <div>
          <h2 className="text-base font-bold text-slate-100">5-Tier SHA-256 Cache Observability</h2>
          <p className="text-slate-400 text-xs">Multi-level cryptographic caching reducing LLM cost, latency, and database query load.</p>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold">
          <Zap className="w-3.5 h-3.5" />
          <span>Overall Hit Rate: 87.4%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {tiers.map(t => (
          <div
            key={t.tier}
            className="p-4 rounded-xl bg-[#0E1117] border border-[#1E232F] flex flex-wrap items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {t.tier}
                </span>
                <h3 className="font-bold text-slate-200 text-xs">{t.name}</h3>
                <span className="text-[10px] text-slate-500">TTL: {t.ttl}</span>
              </div>
              <p className="text-[11px] text-slate-400">Key Invalidation Scope: {t.invalidation}</p>
            </div>

            <div className="flex items-center gap-6 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">Hit Rate:</span>
                <span className="text-emerald-400 font-bold">{t.hitRate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Requests Saved:</span>
                <span className="text-slate-200 font-bold">{t.requestsSaved}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Token Savings:</span>
                <span className="text-cyan-300 font-bold">{t.tokenSavings}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
