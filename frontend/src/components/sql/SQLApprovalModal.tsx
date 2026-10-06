import React, { useState } from 'react';
import { Database, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Play, Lock } from 'lucide-react';
import { SQLApprovalRequest } from '../../types';

export const SQLApprovalView: React.FC = () => {
  const [approvalStatus, setApprovalStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const pendingRequest: SQLApprovalRequest = {
    id: 'sql-appr-8941',
    query: `SELECT deployment_id, service_id, commit_sha, deployed_at, config_diff 
FROM deployments 
WHERE service_id = 'svc-checkout-001' 
ORDER BY deployed_at DESC 
LIMIT 20;`,
    service: 'checkout-service',
    purpose: 'Correlate recent configuration parameter changes with latency spike',
    risk_level: 'LOW',
    safety_checks: {
      select_only: true,
      no_mutation: true,
      authorized_tables: true,
      row_limit_applied: true,
      timeout_configured: true
    },
    status: 'PENDING_APPROVAL',
    generated_at: '2026-10-05 14:35:12 UTC',
    expires_in_seconds: 240
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-mono text-xs">
      <div className="p-4 rounded-xl bg-[#0E1117] border border-[#1E232F]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E232F]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">
              Human-in-the-Loop SQL Approval & Safety Gate
            </span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
            Mandatory SRE Control
          </span>
        </div>
        <p className="text-slate-400 text-xs">
          The SRE assistant generated a read-only query to inspect recent deployment configurations. High-stakes queries require authorized engineer review before execution.
        </p>
      </div>

      {/* SQL Execution Card */}
      <div className="p-5 rounded-xl bg-[#0E1117] border border-[#1E232F] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Request ID: {pendingRequest.id}</span>
            <h3 className="font-bold text-slate-100 text-sm">Target Service: {pendingRequest.service}</h3>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <span>Risk Assessment: </span>
            <span className="text-emerald-400 font-bold">LOW (SELECT Only)</span>
          </div>
        </div>

        {/* Formatted SQL Query Block */}
        <div className="p-4 rounded-lg bg-[#07090E] border border-[#1E2535] text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed">
          {pendingRequest.query}
        </div>

        {/* AST & Safety Validation Checklist */}
        <div className="p-3.5 rounded-lg bg-[#121622] border border-[#1E2638] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold uppercase pb-1 border-b border-[#1E2638]">
            <span>sqlglot AST Safety Invariants</span>
            <span className="text-emerald-400">5/5 Passed</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SELECT-only statement</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>No DROP / INSERT / UPDATE</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Allow-listed tables only</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>LIMIT 20 clause enforced</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Query timeout (5000ms)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Read-only credentials</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Expires in <strong>{pendingRequest.expires_in_seconds}s</strong>
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setApprovalStatus('REJECTED')}
              disabled={approvalStatus !== 'PENDING'}
              className="px-4 py-2 rounded-lg bg-[#181D2A] hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-[#232B3E] hover:border-rose-500/40 font-semibold transition-colors disabled:opacity-50"
            >
              Reject Query
            </button>

            <button
              onClick={() => setApprovalStatus('APPROVED')}
              disabled={approvalStatus !== 'PENDING'}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Execute</span>
            </button>
          </div>
        </div>

        {approvalStatus === 'APPROVED' && (
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Query approved and executed safely on read-only replica. 2 records returned. Trace event logged.</span>
          </div>
        )}

        {approvalStatus === 'REJECTED' && (
          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <XCircle className="w-4 h-4" />
            <span>Query rejected by engineer. Execution aborted.</span>
          </div>
        )}
      </div>
    </div>
  );
};
