import React, { useState } from 'react';
import { Server, Activity, GitCommit, AlertTriangle, CheckCircle2, ShieldAlert, Terminal, Layers } from 'lucide-react';

const SYNTHETIC_PODS = [
  {
    name: 'checkout-service-78f56-kx8w2',
    service: 'checkout-service',
    namespace: 'production',
    cluster: 'prod-us-east-1-k8s',
    node: 'ip-10-0-1-12',
    status: 'running',
    restarts: 8,
    errorCode: 'ERR_REDIS_TIMEOUT',
    cpu: 88.5,
    memory: 780,
  },
  {
    name: 'checkout-service-78f56-qp91x',
    service: 'checkout-service',
    namespace: 'production',
    cluster: 'prod-us-east-1-k8s',
    node: 'ip-10-0-1-14',
    status: 'CrashLoopBackOff',
    restarts: 14,
    errorCode: 'OOMKilled',
    cpu: 95.0,
    memory: 1024,
  },
  {
    name: 'auth-service-54d9b-nm12z',
    service: 'auth-service',
    namespace: 'production',
    cluster: 'prod-us-east-1-k8s',
    node: 'ip-10-0-1-18',
    status: 'running',
    restarts: 0,
    errorCode: null,
    cpu: 12.0,
    memory: 210,
  },
  {
    name: 'payment-gateway-66b31-xz99a',
    service: 'payment-gateway',
    namespace: 'production',
    cluster: 'prod-us-east-1-k8s',
    node: 'ip-10-0-1-20',
    status: 'running',
    restarts: 1,
    errorCode: null,
    cpu: 34.0,
    memory: 450,
  },
];

const RECENT_DEPLOYMENTS = [
  {
    id: 'DEP-2026-9901',
    service: 'checkout-service',
    commit: 'c9a184fe72b0129a8',
    deployedBy: 'alex.chen@enterprise.internal',
    time: '45 mins ago',
    status: 'deployed',
    diff: `- REDIS_POOL_SIZE=50
+ REDIS_POOL_SIZE=5
+ REDIS_TIMEOUT_MS=1000`,
    isRegression: true,
  },
  {
    id: 'DEP-2026-9880',
    service: 'checkout-service',
    commit: 'a1b2c3d4e5f678901',
    deployedBy: 'alex.chen@enterprise.internal',
    time: '5 days ago',
    status: 'stable',
    diff: `Routine dependencies update & bugfix patch`,
    isRegression: false,
  },
];

export const InfrastructureMatrix: React.FC = () => {
  const [selectedPod, setSelectedPod] = useState<any>(null);

  return (
    <div className="space-y-6">
      {/* Kubernetes Pods Live Grid */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
              Kubernetes Production Cluster Pod Grid (prod-us-east-1-k8s)
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-Time Telemetry Stream</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SYNTHETIC_PODS.map((pod, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedPod(pod)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                pod.status === 'CrashLoopBackOff'
                  ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/80 shadow-glow-blue'
                  : pod.errorCode
                  ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/80'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                  pod.status === 'running' && !pod.errorCode
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : pod.status === 'CrashLoopBackOff'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {pod.status}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Restarts: <strong className={pod.restarts > 5 ? 'text-rose-400' : 'text-slate-300'}>{pod.restarts}</strong>
                </span>
              </div>

              <h4 className="text-xs font-mono font-semibold text-slate-200 truncate mb-1" title={pod.name}>
                {pod.name}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mb-3">Node: {pod.node}</p>

              {pod.errorCode && (
                <div className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 mb-2">
                  ⚠️ {pod.errorCode}
                </div>
              )}

              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>CPU Load:</span>
                  <span className={pod.cpu > 80 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{pod.cpu}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span className={pod.memory > 900 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{pod.memory}MB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deployment & Commit Diff Correlator */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
              Recent Deployments & Configuration Diffs (Change Correlation Engine)
            </span>
          </div>
          <span className="text-xs text-purple-400 font-mono">SQL Correlated</span>
        </div>

        <div className="space-y-4">
          {RECENT_DEPLOYMENTS.map((dep, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                dep.isRegression
                  ? 'bg-rose-950/10 border-rose-500/30'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-slate-200">{dep.id}</span>
                  <span className="text-slate-400">({dep.service})</span>
                  <span className="text-[11px] text-cyan-400">commit: {dep.commit}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                  <span>by: {dep.deployedBy}</span>
                  <span>{dep.time}</span>
                  {dep.isRegression && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Root Cause Suspect
                    </span>
                  )}
                </div>
              </div>

              {/* Git Diff Block */}
              <div className="mt-3 bg-[#05070c] p-3 rounded-lg border border-slate-800/80 font-mono text-xs">
                <p className="text-[10px] text-slate-500 mb-1">// Config Diff Inspection:</p>
                {dep.diff.split('\n').map((line, lIdx) => (
                  <div
                    key={lIdx}
                    className={
                      line.startsWith('-')
                        ? 'text-rose-400 bg-rose-500/10 px-1 rounded'
                        : line.startsWith('+')
                        ? 'text-emerald-400 bg-emerald-500/10 px-1 rounded'
                        : 'text-slate-400'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
