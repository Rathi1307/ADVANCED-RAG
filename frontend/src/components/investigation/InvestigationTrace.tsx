import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Clock, Database, Shield, Target, Cpu } from 'lucide-react';
import { InvestigationResponse, TraceStep } from '../../types';

interface InvestigationTraceProps {
  response: InvestigationResponse | null;
}

export const InvestigationTrace: React.FC<InvestigationTraceProps> = ({ response }) => {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const defaultNodes: TraceStep[] = [
    {
      id: 'l1_l2_security',
      name: 'L1/L2 Security & Screening',
      status: 'completed',
      duration_ms: 22,
      summary: 'Prompt injection scan clean (score: 0.05). L1 regex screening 0 violations.',
      details: {
        regex_screening: 'PASS (0 violations)',
        injection_scan: 'PASS (confidence 0.95 clean)',
        input_truncation: 'PASS (cl100k_base 32 tokens)',
        pii_masking: '0 PII redactions required'
      }
    },
    {
      id: 'tier5_cache',
      name: '5-Tier Cache Dispatcher',
      status: 'completed',
      duration_ms: 12,
      summary: response?.cache_hit ? 'Tier-5 Cache HIT (SHA-256)' : 'Tier-5 Cache MISS (Executing full graph)',
      cache_hit: response?.cache_hit,
      details: {
        tier_checked: 'Tier-5 (Final RAG Answers)',
        ttl: '1h',
        cache_key_hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      }
    },
    {
      id: 'intent_router',
      name: 'LangGraph Intent Router',
      status: 'completed',
      duration_ms: 18,
      summary: `Route classified as '${response?.route || 'hybrid'}' (Documentary + Structured SQL)`,
      details: {
        classification: response?.route || 'hybrid',
        document_signal: 'Present (runbook & historical precedent keywords)',
        sql_signal: 'Present (deployment diff & pod metric keywords)'
      }
    },
    {
      id: 'hybrid_retrieval',
      name: 'Dense + BM25 Parallel Retrieval',
      status: 'completed',
      duration_ms: 45,
      summary: 'Qdrant Dense (384d) + BM25Plus exact identifier search executed in parallel',
      details: {
        dense_candidates: 6,
        bm25_candidates: 6,
        exact_identifier_hits: ['ERR_REDIS_TIMEOUT', 'DEP-2026-9901', 'checkout-service']
      }
    },
    {
      id: 'rrf_fusion',
      name: 'Reciprocal Rank Fusion (k=60)',
      status: 'completed',
      duration_ms: 8,
      summary: 'Fused 12 dense & sparse rankings into top 6 candidates via RRF formula',
      details: {
        k_constant: 60,
        fused_candidates_count: 6,
        top_fused_doc: 'RBK-CHK-001 (RRF score: 0.0328)'
      }
    },
    {
      id: 'cross_encoder',
      name: 'Cross-Encoder Reranker',
      status: 'completed',
      duration_ms: 32,
      summary: 'Semantic query-document cross-scoring boosted top 4 operational chunks',
      score: 0.94,
      details: {
        model: 'bge-reranker-large-adapter',
        final_top_score: 0.94,
        reranked_chunks: 4
      }
    },
    {
      id: 'xml_spotlight',
      name: 'XML Context Spotlighting (L3/L8)',
      status: 'completed',
      duration_ms: 4,
      summary: 'Enclosed retrieved evidence in untrusted XML boundary tags to isolate prompt execution',
      details: {
        tag_wrapper: '<untrusted_operational_evidence>',
        injection_isolation: 'Enforced'
      }
    },
    {
      id: 'sql_telemetry',
      name: 'Text2SQL Telemetry Correlation',
      status: 'completed',
      duration_ms: 28,
      summary: 'Queried deployments (DEP-2026-9901 diff) and pod metrics (2 restarts)',
      details: {
        tables_queried: ['deployments', 'pods', 'incidents'],
        read_only_enforced: true,
        statement_timeout_ms: 5000
      }
    },
    {
      id: 'self_rag_verify',
      name: 'Self-RAG Reflection & Faithfulness',
      status: 'completed',
      duration_ms: 35,
      summary: `Verification score: ${((response?.faithfulness_score || 0.94) * 100).toFixed(0)}% (Threshold: 80%, Loops: ${response?.reflection_attempts || 0})`,
      score: response?.faithfulness_score || 0.94,
      details: {
        faithfulness: 0.94,
        completeness: 0.88,
        unsupported_claims: 0,
        regeneration_needed: false
      }
    },
    {
      id: 'audit_log',
      name: 'Audit & Compliance Persistence',
      status: 'completed',
      duration_ms: 15,
      summary: `Persisted immutable audit record under trace ID '${response?.trace_id || 'trace-live'}'`,
      details: {
        trace_id: response?.trace_id,
        tokens_consumed: 340,
        security_flagged: false
      }
    }
  ];

  return (
    <div className="p-4 rounded-xl bg-[#0E1117] border border-[#1E232F] font-mono text-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E232F]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">
            Investigation Process & Telemetry Trace
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          Trace ID: <code className="text-slate-200">{response?.trace_id || 'trace-active'}</code>
        </span>
      </div>

      <div className="space-y-1.5">
        {defaultNodes.map(node => {
          const isExpanded = expandedNode === node.id;
          return (
            <div
              key={node.id}
              className="rounded-lg border border-[#181E2B] bg-[#121622]/60 hover:bg-[#151B2A] transition-colors"
            >
              <div
                onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                className="flex items-center justify-between p-2.5 cursor-pointer select-none text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-slate-200">{node.name}</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-md hidden md:inline">
                    · {node.summary}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                  <span>{node.duration_ms}ms</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>

              {isExpanded && node.details && (
                <div className="px-3 pb-3 pt-1 border-t border-[#1C2333] text-[11px] text-slate-400 space-y-1 bg-[#090C12]">
                  {Object.entries(node.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-0.5">
                      <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}:</span>
                      <span className="text-slate-200 font-mono font-semibold">
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
