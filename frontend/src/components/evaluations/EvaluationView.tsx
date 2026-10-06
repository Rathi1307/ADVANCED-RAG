import React from 'react';
import { BarChart3, CheckCircle2, ShieldCheck, Target, Zap, Activity } from 'lucide-react';

export const EvaluationView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E232F]">
        <div>
          <h2 className="text-base font-bold text-slate-100">Ragas & Agentic Evaluation Benchmark Hub</h2>
          <p className="text-slate-400 text-xs">Continuous evaluation tracking groundedness, precision, exact-ID recall, and safety invariants.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Benchmark Corpus: 50 Scenarios</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            PASSED
          </span>
        </div>
      </div>

      {/* Ragas Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0E1117] border border-[#1E232F] space-y-1">
          <span className="text-slate-500 text-[10px] uppercase block">Faithfulness</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">94.2%</span>
            <span className="text-[10px] text-slate-400">target: &gt;80%</span>
          </div>
          <p className="text-[10px] text-slate-400">0 hallucinated operational claims</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1117] border border-[#1E232F] space-y-1">
          <span className="text-slate-500 text-[10px] uppercase block">Answer Relevance</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-400">92.8%</span>
            <span className="text-[10px] text-slate-400">target: &gt;85%</span>
          </div>
          <p className="text-[10px] text-slate-400">Direct incident diagnosis focus</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1117] border border-[#1E232F] space-y-1">
          <span className="text-slate-500 text-[10px] uppercase block">Context Precision</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-400">89.5%</span>
            <span className="text-[10px] text-slate-400">target: &gt;80%</span>
          </div>
          <p className="text-[10px] text-slate-400">High signal-to-noise ratio</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1117] border border-[#1E232F] space-y-1">
          <span className="text-slate-500 text-[10px] uppercase block">Exact-ID Recall</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400">98.0%</span>
            <span className="text-[10px] text-slate-400">BM25 boosted</span>
          </div>
          <p className="text-[10px] text-slate-400">Pod IDs, error codes, commit SHAs</p>
        </div>
      </div>

      {/* Safety & Invariant Benchmarks */}
      <div className="p-5 rounded-xl bg-[#0E1117] border border-[#1E232F] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1A1F2B]">
          <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">
            Safety & Robustness Invariants Evaluation
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">100% Deterministic Pass</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
          <div className="p-3 rounded-lg bg-[#141822] border border-[#1F2633] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-300 font-semibold">Unsafe SQL Rejection Rate:</span>
              <span className="text-emerald-400 font-bold">100%</span>
            </div>
            <p className="text-[10px] text-slate-400">14/14 mutation/DDL attacks rejected by AST</p>
          </div>

          <div className="p-3 rounded-lg bg-[#141822] border border-[#1F2633] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-300 font-semibold">Adversarial Injection Defense:</span>
              <span className="text-emerald-400 font-bold">100%</span>
            </div>
            <p className="text-[10px] text-slate-400">23/23 system prompt override attempts blocked</p>
          </div>

          <div className="p-3 rounded-lg bg-[#141822] border border-[#1F2633] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-300 font-semibold">PII Redaction Accuracy:</span>
              <span className="text-emerald-400 font-bold">99.4%</span>
            </div>
            <p className="text-[10px] text-slate-400">19 secrets, tokens, and emails masked</p>
          </div>
        </div>
      </div>
    </div>
  );
};
