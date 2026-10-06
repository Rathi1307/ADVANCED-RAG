import React, { useState, useEffect } from 'react';
import { Search, Terminal, AlertOctagon, BookOpen, Server, Database, X, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (tabId: string, payload?: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent will toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    {
      category: 'ACTIVE INCIDENTS',
      items: [
        { title: 'INC-2026-0812 · Checkout Latency 3.1x Spike (P1)', tab: 'incidents', icon: AlertOctagon, desc: 'Root cause suspect: DEP-2026-9901 Redis pool' },
      ]
    },
    {
      category: 'AI INVESTIGATION SCENARIOS',
      items: [
        { title: 'Investigate Checkout Latency Spike since Last Deploy', tab: 'investigation', icon: Terminal, desc: 'Correlate commit diffs with past incident INC-2026-0504' },
        { title: 'Run Emergency Runbook Triage for ERR_REDIS_TIMEOUT', tab: 'investigation', icon: Terminal, desc: 'Checkout service connection pool procedures' },
      ]
    },
    {
      category: 'OPERATIONAL KNOWLEDGE & RUNBOOKS',
      items: [
        { title: 'RBK-CHK-001 · Checkout Latency & Redis Pool Runbook', tab: 'knowledge', icon: BookOpen, desc: 'P99 threshold remediation & pool sizing' },
        { title: 'PMM-2026-0504 · Incident Postmortem (May 4, 2026)', tab: 'knowledge', icon: BookOpen, desc: 'Historical 3.5x latency surge RCA' },
      ]
    },
    {
      category: 'INFRASTRUCTURE & SERVICES',
      items: [
        { title: 'checkout-service (Tier-1) · 2 Pod Restarts', tab: 'services', icon: Server, desc: 'prod-us-east-1-k8s cluster' },
        { title: 'auth-service (Tier-1) · Healthy', tab: 'services', icon: Server, desc: '50ms SLO target' },
      ]
    },
    {
      category: 'SAFETY & SQL APPROVALS',
      items: [
        { title: 'Review Pending SQL Query for Deployments Table', tab: 'sql', icon: Database, desc: 'SELECT-only AST validated check' },
      ]
    }
  ];

  const filtered = quickActions.map(sec => ({
    category: sec.category,
    items: sec.items.filter(i =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.desc.toLowerCase().includes(query.toLowerCase())
    )
  })).filter(sec => sec.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0E1117] border border-[#263042] rounded-xl shadow-2xl overflow-hidden font-mono text-xs">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-[#1E232F] bg-[#111622]">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands, incidents, runbooks, services, or trace IDs..."
            autoFocus
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-xs"
          />
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No matching commands or entities found for "{query}"
            </div>
          ) : (
            filtered.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {sec.category}
                </p>
                {sec.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectAction(item.tab);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-[#141822]/60 hover:bg-[#1C2333] border border-transparent hover:border-[#2D3748] text-left transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <div>
                          <p className="text-slate-200 font-semibold group-hover:text-blue-300">{item.title}</p>
                          <p className="text-[11px] text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 bg-[#0A0D14] border-t border-[#1E232F] flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>NOVA SRE Global Dispatch</span>
        </div>
      </div>
    </div>
  );
};
