import React from 'react';
import { Shield, ShieldAlert, Lock, CheckCircle2, AlertOctagon, Terminal } from 'lucide-react';

export const SecurityCenterView: React.FC = () => {
  const layers = [
    {
      id: 'L1',
      name: 'Regex Screening & Blocklist',
      status: 'ACTIVE',
      desc: 'Blocks SQL injection vectors, shell executions, and prompt jailbreak commands.',
      blocked: 24,
      lastEvent: '2m ago'
    },
    {
      id: 'L2',
      name: 'llm-guard Injection & Toxicity Scanner',
      status: 'ACTIVE',
      desc: 'Heuristic and embedding-based detection of adversarial system instruction overrides.',
      blocked: 8,
      lastEvent: '14m ago'
    },
    {
      id: 'L3',
      name: 'XML Context Spotlighting (In-Graph)',
      status: 'ACTIVE',
      desc: 'Isolates retrieved documents in XML delimiters; instructs model retrieved text is untrusted data.',
      blocked: 0,
      lastEvent: 'Continuous'
    },
    {
      id: 'L4a',
      name: 'JWT Bearer Authentication & RBAC',
      status: 'ACTIVE',
      desc: 'Cryptographic token verification with strict role scoping (SRE, Admin, Approver).',
      blocked: 3,
      lastEvent: '1h ago'
    },
    {
      id: 'L4b',
      name: 'Sliding-Window Rate Limiter (20 req/min)',
      status: 'ACTIVE',
      desc: 'Per-user token bucket algorithm preventing pipeline congestion and API abuse.',
      blocked: 2,
      lastEvent: '3h ago'
    },
    {
      id: 'L5',
      name: 'tiktoken Input Restructuring',
      status: 'ACTIVE',
      desc: 'Enforces hard 4,000 token limit; truncates oversized queries with audit metadata.',
      blocked: 1,
      lastEvent: '5h ago'
    },
    {
      id: 'L6',
      name: 'Daily Token Allocation Budget (100k/day)',
      status: 'ACTIVE',
      desc: 'Per-user quota monitoring across daily shifts with fail-closed limits.',
      blocked: 0,
      lastEvent: 'Continuous'
    },
    {
      id: 'L7a/b',
      name: 'Input & Output PII Redaction Filter',
      status: 'ACTIVE',
      desc: 'Redacts IP addresses, emails, credit cards, and Bearer tokens before LLM and response delivery.',
      blocked: 19,
      lastEvent: '45m ago'
    },
    {
      id: 'L9',
      name: 'Pydantic Response Schema Verification',
      status: 'ACTIVE',
      desc: 'Strict structural validation of answer envelopes with bounded auto-repair on failure.',
      blocked: 0,
      lastEvent: 'Continuous'
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E232F]">
        <div>
          <h2 className="text-base font-bold text-slate-100">9-Layer Security & Guardrails Center</h2>
          <p className="text-slate-400 text-xs">Continuous server-side defenses guarding against injection, PII leakage, and unauthorized execution.</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>All 9 Layers Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {layers.map(layer => (
          <div
            key={layer.id}
            className="p-4 rounded-xl bg-[#0E1117] border border-[#1E232F] hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {layer.id}
                </span>
                <span className="text-[10px] font-bold text-emerald-400">{layer.status}</span>
              </div>
              <h3 className="font-semibold text-slate-200 text-xs mb-1.5">{layer.name}</h3>
              <p className="text-[11px] text-slate-400 leading-normal mb-3">{layer.desc}</p>
            </div>

            <div className="pt-2 border-t border-[#1A1F2B] flex items-center justify-between text-[10px] text-slate-500">
              <span>Blocked / Masked: <strong className="text-slate-200">{layer.blocked}</strong></span>
              <span>Last Event: {layer.lastEvent}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
