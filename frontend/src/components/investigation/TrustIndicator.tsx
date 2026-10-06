import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, FileText, Sparkles } from 'lucide-react';

interface TrustIndicatorProps {
  score: number;
  evidenceCount: number;
  reflectionAttempts: number;
  unsupportedClaimsCount?: number;
  status?: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'LOW_CONFIDENCE' | 'INSUFFICIENT_EVIDENCE';
}

export const TrustIndicator: React.FC<TrustIndicatorProps> = ({
  score = 0.94,
  evidenceCount = 6,
  reflectionAttempts = 0,
  unsupportedClaimsCount = 0,
  status = 'VERIFIED'
}) => {
  const isVerified = score >= 0.85 && unsupportedClaimsCount === 0;

  return (
    <div className={`p-4 rounded-xl border ${
      isVerified
        ? 'bg-[#0E151E] border-emerald-500/30'
        : 'bg-[#18130E] border-amber-500/30'
    }`}>
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1E2738]">
        <div className="flex items-center gap-2">
          {isVerified ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
          <span className={`text-xs font-mono font-bold tracking-wide ${
            isVerified ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {status === 'VERIFIED' ? '✓ VERIFIED FINDINGS' : status}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Faithfulness: <strong className="text-slate-100 font-bold">{(score * 100).toFixed(0)}%</strong>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 text-xs font-mono">
        <div className="p-2 rounded bg-[#090C12] border border-[#1A2230]">
          <span className="text-[10px] text-slate-500 block uppercase">Supporting Evidence</span>
          <span className="text-slate-200 font-bold">{evidenceCount} sources cited</span>
        </div>

        <div className="p-2 rounded bg-[#090C12] border border-[#1A2230]">
          <span className="text-[10px] text-slate-500 block uppercase">Unsupported Claims</span>
          <span className={unsupportedClaimsCount === 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
            {unsupportedClaimsCount} detected
          </span>
        </div>

        <div className="p-2 rounded bg-[#090C12] border border-[#1A2230]">
          <span className="text-[10px] text-slate-500 block uppercase">Self-RAG Reflection</span>
          <span className="text-slate-200 font-bold">
            {reflectionAttempts === 0 ? "1-shot Pass" : `${reflectionAttempts} Retries`}
          </span>
        </div>
      </div>
    </div>
  );
};
