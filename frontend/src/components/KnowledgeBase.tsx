import React, { useState } from 'react';
import { FileText, BookOpen, Search, CheckCircle, Tag, Shield } from 'lucide-react';

const KNOWLEDGE_ASSETS = [
  {
    id: 'RBK-CHK-001',
    title: 'Checkout Service High Latency & Redis Pool Exhaustion Runbook',
    type: 'RUNBOOK',
    service: 'checkout-service',
    updated: '2026-09-15',
    content: `## 1. Symptoms & Alerts
- Latency P99 spikes above SLO threshold (>200ms, frequently reaching 600ms - 1200ms).
- Pod logs show frequent ERR_REDIS_TIMEOUT or ConnectionPoolExhaustedException.
- Kubernetes pods may restart or enter CrashLoopBackOff due to readiness probe timeouts.

## 2. Common Root Causes
1. Misconfigured Connection Pool: REDIS_POOL_SIZE set below required concurrency (e.g. pool size reduced to 5).
2. Deployment Regression: Recent deployment introducing aggressive unbatched cache writes.
3. Redis Node CPU Spikes: Hot keys or expensive Lua scripts running on Redis master.

## 3. Step-by-Step Diagnostic & Triage Workflow
1. Check Recent Deployments: Query deployments table for recent commit diffs.
2. Check Pod Health: Inspect pod status and restart counts for checkout-service pods.
3. Inspect Connection Pool Settings: Verify if REDIS_POOL_SIZE was modified.`,
  },
  {
    id: 'PMM-2026-0504',
    title: 'Postmortem: Incident INC-2026-0504 - Checkout Latency & Connection Throttling',
    type: 'POSTMORTEM',
    service: 'checkout-service',
    updated: '2026-05-04',
    content: `## Executive Summary
On May 4, 2026, checkout-service experienced a 3.5x latency surge (from baseline 170ms to 610ms) shortly after deployment DEP-2026-5412. The issue persisted for 42 minutes before being mitigated by rolling back the deployment.

## Root Cause Analysis (RCA)
A configuration change reduced the Redis client connection pool size from 50 to 5 (REDIS_POOL_SIZE=5). Under standard peak traffic, all available connections were exhausted within seconds, causing inbound checkout API threads to block waiting for connections until timing out (ERR_REDIS_TIMEOUT).

## Preventative Action Items
1. Added validation checks in CI/CD pipeline to block deployment if REDIS_POOL_SIZE < 20.
2. Updated runbook RBK-CHK-001 with explicit SQL inspection queries for deployment diffs.`,
  },
];

export const KnowledgeBase: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(KNOWLEDGE_ASSETS[0]);

  const filteredAssets = KNOWLEDGE_ASSETS.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().includes(search.toLowerCase()) ||
    a.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Assets List */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-200 uppercase">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Operational Assets</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">Indexed</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search runbooks..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="space-y-2 pt-1">
          {filteredAssets.map(asset => (
            <button
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className={`w-full p-3 rounded-xl border text-left transition-all ${
                selectedAsset.id === asset.id
                  ? 'bg-blue-950/30 border-blue-500/50 shadow-glow-blue'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                  asset.type === 'RUNBOOK' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                }`}>
                  {asset.type}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{asset.id}</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{asset.title}</h4>
              <p className="text-[10px] font-mono text-slate-400 mt-1">Service: {asset.service}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Document Preview */}
      <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        {selectedAsset ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold">{selectedAsset.id}</span>
                <h2 className="text-base font-bold text-slate-100 mt-0.5">{selectedAsset.title}</h2>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">
                <p>Updated: {selectedAsset.updated}</p>
                <p className="text-emerald-400">Vector & BM25 Synced</p>
              </div>
            </div>

            <div className="mt-4 bg-[#090d16] p-4 rounded-xl border border-slate-800/80 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-300">
              {selectedAsset.content}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500 font-mono text-xs">
            Select an operational runbook or postmortem to preview.
          </div>
        )}
      </div>
    </div>
  );
};
