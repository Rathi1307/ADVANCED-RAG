import React from 'react';
import { Target, CheckCircle2, ArrowRight, Shield, Layers } from 'lucide-react';

interface CRAGVisualizationProps {
  initialScore?: number;
  finalScore?: number;
  threshold?: number;
  correctiveTriggered?: boolean;
}

export const CRAGVisualization: React.FC<CRAGVisualizationProps> = ({
  initialScore = 0.88,
  finalScore = 0.94,
  threshold = 0.70,
  correctiveTriggered = false
}) => {
  return (
    <div className="p-3.5 rounded-xl bg-[#0E121A] border border-[#1E2535] font-mono text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Target className="w-3.5 h-3.5" />
          <span>CRAG RETRIEVAL QUALITY GRADER</span>
        </div>
        <span className="text-[10px] text-slate-400">Threshold: {threshold.toFixed(2)}</span>
      </div>

      <div className="flex items-center justify-between gap-2 p-2 rounded bg-[#080A0F] border border-[#171D2A] text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Hybrid Retrieval Score:</span>
          <span className="text-slate-100 font-bold font-mono">{initialScore.toFixed(2)}</span>
          <span className="text-emerald-400 font-semibold">✓ Above Threshold</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span>Cross-Encoder Boost:</span>
          <span className="text-cyan-300 font-bold font-mono">{finalScore.toFixed(2)}</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
