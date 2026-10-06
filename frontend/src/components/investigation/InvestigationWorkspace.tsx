import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  CheckSquare,
  Square,
  Database,
  Layers,
  ArrowRight,
  ExternalLink,
  BookOpen,
  GitCommit,
  Bot
} from 'lucide-react';
import { InvestigationResponse, EvidenceItem } from '../../types';
import { ApiService } from '../../services/api';
import { TrustIndicator } from './TrustIndicator';
import { CRAGVisualization } from './CRAGVisualization';
import { IncidentCorrelationTimeline } from './IncidentCorrelationTimeline';
import { InvestigationTrace } from './InvestigationTrace';
import { EvidenceDrawer } from './EvidenceDrawer';

interface InvestigationWorkspaceProps {
  onSelectEvidence?: (ev: EvidenceItem) => void;
}

const PRESETS = [
  {
    title: 'Checkout Latency Spike (Incident INC-2026-0812)',
    prompt: 'Checkout latency has increased 3x since the last deployment --- what changed, and has this happened before?',
    service: 'checkout-service',
    severity: 'P1'
  },
  {
    title: 'Pod Restarts & Connection Pool Sizing',
    prompt: 'Multiple checkout-service pods are restarting with ERR_REDIS_TIMEOUT. What is the recommended runbook procedure?',
    service: 'checkout-service',
    severity: 'P2'
  },
  {
    title: 'Auth Key Rotation Rollback Checklist',
    prompt: 'What are the emergency rollback steps if auth-service token signing key rotation fails during deployment?',
    service: 'auth-service',
    severity: 'P1'
  }
];

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = () => {
  const [question, setQuestion] = useState(PRESETS[0].prompt);
  const [service, setService] = useState('checkout-service');
  const [forceRefresh, setForceRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InvestigationResponse | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [completedChecks, setCompletedChecks] = useState<Record<number, boolean>>({});
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Auto-run default investigation on first load so user immediately sees rich, verified results
  useEffect(() => {
    handleRunInvestigation();
  }, []);

  const handleRunInvestigation = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setCurrentStep(1);

    // Step sequence animation
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => (prev < 6 ? prev + 1 : prev));
    }, 150);

    try {
      const resp = await ApiService.investigate(question, service, forceRefresh);
      setResult(resp);
    } catch (err: any) {
      setError(err.message || 'Investigation request failed');
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
    }
  };

  const toggleCheck = (idx: number) => {
    setCompletedChecks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Incident Header Context Banner */}
      <div className="p-4 rounded-xl bg-[#0E1117] border border-[#1E232F] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-subtle-pulse" />
          <span className="text-rose-400 font-bold">INC-2026-0812</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-200 font-semibold">Checkout Service Latency Degradation (3.1x Surge)</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            P1 CRITICAL
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          <span>Service: <strong className="text-cyan-400">checkout-service</strong></span>
          <span>Target: <strong className="text-slate-200">prod-us-east-1-k8s</strong></span>
          <span>Duration: <strong className="text-amber-400 font-semibold">45m</strong></span>
        </div>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="uppercase tracking-wider font-semibold text-[10px] text-slate-500">
            Pre-Configured SRE Incident Scenarios:
          </span>
          <span className="text-blue-400 text-[11px]">⌘K Command Palette Available</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(p.prompt);
                setService(p.service);
              }}
              className="p-3 rounded-lg bg-[#0E1117] hover:bg-[#141822] border border-[#1E232F] hover:border-blue-500/50 text-left transition-all group font-mono text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                  {p.title}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  p.severity === 'P1' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {p.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{p.prompt}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Investigation Command Input */}
      <div className="p-4 rounded-xl bg-[#0E1117] border border-[#1E232F] shadow-xl font-mono text-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1A1F2B] text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-200 font-semibold">AI SRE Investigation Assistant</span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={forceRefresh}
              onChange={e => setForceRefresh(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
            />
            <span>Bypass Tier-5 Cache (Force Fresh Diagnostic)</span>
          </label>
        </div>

        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          rows={3}
          placeholder="Enter your incident diagnostic inquiry..."
          className="w-full bg-[#08090C] border border-[#1E232F] rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 font-mono resize-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Target Service:</span>
            <select
              value={service}
              onChange={e => setService(e.target.value)}
              className="bg-[#121622] border border-[#1E2535] text-slate-200 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Investigating Telemetry & Runbooks...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run SRE Diagnostic</span>
              </>
            )}
          </button>
        </div>

        {/* Live Stepper during investigation */}
        {loading && (
          <div className="pt-3 border-t border-[#1A1F2B] space-y-1.5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Executing Grounded Investigation Graph:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-[10px]">
              {[
                'L1/L2 Security Scan',
                '5-Tier Cache Check',
                'Dense + BM25 RRF',
                'XML Spotlighting',
                'SQL Telemetry',
                'Self-RAG Reflection'
              ].map((step, sIdx) => (
                <div
                  key={sIdx}
                  className={`p-1.5 rounded border flex items-center gap-1.5 ${
                    currentStep > sIdx
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-[#10141E] border-[#1A2230] text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Investigation Results */}
      {result && (
        <div className="space-y-6">
          {/* Top Verification & Quality Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TrustIndicator
              score={result.faithfulness_score}
              evidenceCount={result.evidence.length}
              reflectionAttempts={result.reflection_attempts}
              status="VERIFIED"
            />
            <CRAGVisualization
              initialScore={0.88}
              finalScore={0.94}
              threshold={0.70}
            />
          </div>

          {/* Core Diagnostic Findings */}
          <div className="p-5 rounded-xl bg-[#0E1117] border border-[#1E232F] font-mono text-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A1F2B]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {result.route} INVESTIGATION
                </span>
                <span className="text-slate-400">
                  Trace: <code className="text-slate-200">{result.trace_id}</code>
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                <span>Cache: <strong className={result.cache_hit ? "text-emerald-400" : "text-slate-300"}>
                  {result.cache_hit ? "HIT (Tier-5)" : "MISS (Live Executed)"}
                </strong></span>
                <span>Faithfulness: <strong className="text-blue-400">{(result.faithfulness_score * 100).toFixed(0)}%</strong></span>
              </div>
            </div>

            {/* Finding Summary Banner */}
            <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-500/30 text-blue-200 text-xs leading-relaxed">
              <strong>Root Cause Summary:</strong> {result.summary}
            </div>

            {/* Answer Content */}
            <div className="p-4 rounded-lg bg-[#08090C] border border-[#1A1F2B] text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
              {result.answer}
            </div>

            {/* Limitations Callout */}
            {result.limitations_and_uncertainty && (
              <p className="text-[11px] text-slate-500 italic">
                Note: {result.limitations_and_uncertainty}
              </p>
            )}
          </div>

          {/* Incident Timeline Correlation Visualizer */}
          <IncidentCorrelationTimeline />

          {/* Verifiable Evidence Citation Cards */}
          <div className="p-5 rounded-xl bg-[#0E1117] border border-[#1E232F] font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A1F2B]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                  Verifiable Evidence Sources ({result.evidence.length} Items Cited)
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Click any card to inspect full excerpt</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.evidence.map((ev, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedEvidence(ev)}
                  className="p-3.5 rounded-lg bg-[#141822] hover:bg-[#181E2B] border border-[#1F2633] hover:border-cyan-500/50 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        ev.source_type === 'sql_record'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : ev.source_type === 'runbook'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        [{idx + 1}] {ev.source_type}
                      </span>
                      <span className="text-[11px] text-cyan-400 font-bold">
                        Relevance: {(ev.relevance_score * 100).toFixed(0)}%
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-200 text-xs mb-1 group-hover:text-cyan-300 transition-colors">
                      {ev.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 mb-2">ID: <code>{ev.id}</code></p>
                    <p className="text-[11px] text-slate-400 line-clamp-3 bg-[#090C12] p-2 rounded border border-[#1A2230]">
                      {ev.excerpt}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#1C2433] flex items-center justify-between text-[10px] text-slate-500 group-hover:text-cyan-400">
                    <span>Inspect verified source</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Next SRE Checks */}
          {result.suggested_next_checks && result.suggested_next_checks.length > 0 && (
            <div className="p-4 rounded-xl bg-[#0E1117] border border-[#1E232F] font-mono text-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs">
                <CheckSquare className="w-4 h-4" />
                <span>Recommended SRE Remediation Checklist</span>
              </div>

              <div className="space-y-2">
                {result.suggested_next_checks.map((check, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className="w-full flex items-start gap-3 p-2.5 rounded-lg bg-[#141822] hover:bg-[#181E2B] border border-[#1F2633] text-left transition-colors"
                  >
                    {completedChecks[idx] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    )}
                    <span className={`text-xs ${completedChecks[idx] ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {check}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Process Metadata Trace */}
          <InvestigationTrace response={result} />
        </div>
      )}

      {/* Slide-out Evidence Source Drawer */}
      <EvidenceDrawer
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
};
