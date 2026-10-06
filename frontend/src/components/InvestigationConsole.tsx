import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  RefreshCw,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ArrowRight,
  ShieldCheck,
  Database,
  Layers,
  CheckSquare,
  Square,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { InvestigationResponse, EvidenceItem } from '../types';
import { ApiService } from '../services/api';

interface InvestigationConsoleProps {
  onInvestigationComplete: (res: InvestigationResponse) => void;
}

const PRESET_SCENARIOS = [
  {
    title: 'Checkout Latency Spike (Core Use Case)',
    prompt: 'Checkout latency has increased 3x since the last deployment --- what changed, and has this happened before?',
    service: 'checkout-service',
    severity: 'P1',
  },
  {
    title: 'Pod CrashLoopBackOff & Redis Timeouts',
    prompt: 'Multiple checkout-service pods are restarting with ERR_REDIS_TIMEOUT. What is the recommended runbook procedure?',
    service: 'checkout-service',
    severity: 'P2',
  },
  {
    title: 'Auth Service Token Rotation Check',
    prompt: 'What are the emergency rollback steps if auth-service token signing key rotation fails during deployment?',
    service: 'auth-service',
    severity: 'P1',
  },
];

export const InvestigationConsole: React.FC<InvestigationConsoleProps> = ({ onInvestigationComplete }) => {
  const [question, setQuestion] = useState(PRESET_SCENARIOS[0].prompt);
  const [service, setService] = useState('checkout-service');
  const [forceRefresh, setForceRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InvestigationResponse | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [completedChecks, setCompletedChecks] = useState<Record<number, boolean>>({});

  const handleRunInvestigation = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCompletedSteps([]);

    // Simulate real-time pipeline stepping
    const steps = [1, 2, 3, 4, 5, 6, 7];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 120));
      setCompletedSteps(prev => [...prev, step]);
    }

    try {
      const response = await ApiService.investigate(question, service, forceRefresh);
      setResult(response);
      onInvestigationComplete(response);
    } catch (err: any) {
      setError(err.message || 'Investigation request failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (idx: number) => {
    setCompletedChecks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      {/* Preset Scenario Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Operational Investigation Scenarios
          </span>
          <span className="text-xs text-blue-400 font-mono">1-Click Diagnostic</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESET_SCENARIOS.map((scenario, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(scenario.prompt);
                setService(scenario.service);
              }}
              className="glass-panel p-3 rounded-xl border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-800/40 text-left transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                  {scenario.title}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                  scenario.severity === 'P1' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {scenario.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{scenario.prompt}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Terminal Input */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-slate-300 font-semibold ml-2">sre-investigate --model gpt-4o --retrieval hybrid-rrf</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
              <input
                type="checkbox"
                checked={forceRefresh}
                onChange={e => setForceRefresh(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-[11px]">Bypass Tier-5 Cache</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            rows={3}
            placeholder="Ask an SRE incident question (e.g., 'Checkout latency has increased 3x since the last deployment...')"
            className="w-full bg-[#090d16] border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 font-mono resize-none transition-all"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Service Scope:</span>
              <select
                value={service}
                onChange={e => setService(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="checkout-service">checkout-service (Tier-1)</option>
                <option value="auth-service">auth-service (Tier-1)</option>
                <option value="payment-gateway">payment-gateway (Tier-1)</option>
                <option value="All Services">All Infrastructure Services</option>
              </select>
            </div>

            <button
              onClick={handleRunInvestigation}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Telemetry...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Diagnostic</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Multi-Stage Agent Pipeline Stepper */}
        {loading && (
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <p className="text-[11px] font-mono text-slate-400 mb-2.5 uppercase tracking-wider">
              Agentic Orchestration Pipeline Execution:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { id: 1, label: 'L1/L2 Security Scan' },
                { id: 2, label: '5-Tier Cache' },
                { id: 3, label: 'Intent Routing' },
                { id: 4, label: 'Dense + BM25 RRF' },
                { id: 5, label: 'XML Spotlighting' },
                { id: 6, label: 'SQL Telemetry' },
                { id: 7, label: 'Faithfulness & Audit' },
              ].map(step => (
                <div
                  key={step.id}
                  className={`p-2 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-all ${
                    completedSteps.includes(step.id)
                      ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                      : 'bg-slate-900/50 border-slate-800 text-slate-500'
                  }`}
                >
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span className="truncate">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Presentation */}
      {result && (
        <div className="space-y-6">
          {/* Diagnostic Telemetry Header */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono uppercase tracking-wider ${
                  result.route === 'hybrid'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : result.route === 'sql'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {result.route} INVESTIGATION
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Trace ID: <code className="text-slate-200">{result.trace_id}</code>
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span>Cache: <strong className={result.cache_hit ? "text-emerald-400" : "text-slate-300"}>
                  {result.cache_hit ? "HIT (Tier-5)" : "MISS (Fresh)"}
                </strong></span>
                <span>Faithfulness: <strong className="text-blue-400">
                  {(result.faithfulness_score * 100).toFixed(0)}%
                </strong></span>
                <span>Self-RAG Loops: <strong className="text-slate-300">{result.reflection_attempts}</strong></span>
              </div>
            </div>

            {/* Formatted Answer */}
            <div className="mt-4 prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-3">
              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/20 text-blue-200 font-medium">
                <strong>Executive Summary:</strong> {result.summary}
              </div>

              <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800/80 font-mono text-xs whitespace-pre-wrap leading-6 text-slate-300">
                {result.answer}
              </div>
            </div>
          </div>

          {/* Actionable Next Steps Checklist */}
          {result.suggested_next_checks && result.suggested_next_checks.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                <CheckSquare className="w-4 h-4" />
                <span>Recommended SRE Action Items</span>
              </div>
              <div className="space-y-2">
                {result.suggested_next_checks.map((check, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 text-left transition-all"
                  >
                    {completedChecks[idx] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    )}
                    <span className={`text-xs font-mono ${completedChecks[idx] ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {check}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Citations Section */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
                <FileCode className="w-4 h-4" />
                <span>Verifiable Evidence & Attribution ({result.evidence.length} Cited Sources)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Grounding Invariant Enforced</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.evidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                        ev.source_type === 'sql_record'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ev.source_type === 'runbook'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {ev.source_type}
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                        Relevance: {(ev.relevance_score * 100).toFixed(0)}%
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200 mb-1">{ev.title}</h4>
                    <p className="text-[10px] font-mono text-slate-500 mb-2">Source ID: <code>{ev.id}</code></p>
                    <p className="text-[11px] font-mono text-slate-400 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                      {ev.excerpt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
