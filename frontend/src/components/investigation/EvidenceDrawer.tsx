import React from 'react';
import { X, ExternalLink, FileText, CheckCircle2, Shield, Database, Clock, Tag } from 'lucide-react';
import { EvidenceItem } from '../../types';

interface EvidenceDrawerProps {
  evidence: EvidenceItem | null;
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#0B0E14] border-l border-[#1E2535] shadow-2xl flex flex-col font-mono text-xs animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1A202C] bg-[#0E121A]">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
            evidence.source_type === 'sql_record'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : evidence.source_type === 'runbook'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
          }`}>
            {evidence.source_type}
          </span>
          <span className="text-slate-400 text-xs font-semibold">Evidence Source Inspection</span>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase mb-0.5">Source Identifier:</span>
          <code className="text-cyan-400 font-bold text-xs bg-[#121722] px-2 py-0.5 rounded border border-[#1E2738]">
            {evidence.id}
          </code>
          <h2 className="text-base font-bold text-slate-100 mt-2">{evidence.title}</h2>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#121622] border border-[#1E2638] text-[11px]">
          <div>
            <span className="text-slate-500 block">Relevance Score:</span>
            <span className="text-emerald-400 font-bold">{(evidence.relevance_score * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-slate-500 block">Retrieval Method:</span>
            <span className="text-blue-300 font-bold">Hybrid Dense + BM25 (RRF k=60)</span>
          </div>
          <div>
            <span className="text-slate-500 block">Context Isolation:</span>
            <span className="text-cyan-300 font-bold">XML Delimited & Spotlit</span>
          </div>
          <div>
            <span className="text-slate-500 block">Scope Access:</span>
            <span className="text-slate-300 font-bold">Authorized (SRE Role)</span>
          </div>
        </div>

        {/* Supporting Excerpt with highlight */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Exact Supporting Excerpt
            </span>
            <span className="text-[10px] text-slate-500">Grounded Citation</span>
          </div>

          <div className="p-4 rounded-xl bg-[#06080D] border border-[#1E2535] text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
            {evidence.excerpt}
          </div>
        </div>

        {/* Why Did the AI Use This Evidence */}
        <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs">
          <h4 className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            Why was this evidence cited in the diagnosis?
          </h4>
          <p className="text-slate-300 leading-normal text-[11px]">
            This source directly corroborates the connection pool parameter change (`REDIS_POOL_SIZE=5`) and matches past RCA patterns in incident postmortems for `checkout-service`.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#1A202C] bg-[#0E121A] flex items-center justify-between text-[11px] text-slate-500">
        <span>Verified against knowledge corpus</span>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};
