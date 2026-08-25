import React, { useState } from 'react';
import { InvestigationReport } from '../../shared/types';
import { Bot, Sparkles, RefreshCw, CheckCircle, ShieldAlert, Cpu, Layers } from 'lucide-react';

interface AIInvestigationCardProps {
  investigation: InvestigationReport | null;
  transactionId: string;
  onRunInvestigation: (forceRefresh?: boolean) => Promise<void>;
}

export const AIInvestigationCard: React.FC<AIInvestigationCardProps> = ({
  investigation,
  transactionId,
  onRunInvestigation,
}) => {
  const [loading, setLoading] = useState(false);

  const handleTrigger = async (force: boolean) => {
    try {
      setLoading(true);
      await onRunInvestigation(force);
    } finally {
      setLoading(false);
    }
  };

  const isGemini = investigation?.engineType === 'GEMINI_AI';

  return (
    <div
      id="ai-investigation-report-card"
      className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden"
    >
      {/* Subtle Background Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">AI Forensic Investigation Report</h3>
              {investigation && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isGemini
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  {isGemini ? 'Gemini 3.7 Flash Active' : 'Deterministic Engine Fallback'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated multi-factor evidence synthesis and analyst recommendation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-run-investigation"
            onClick={() => handleTrigger(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Synthesizing...' : investigation ? 'Re-run Analysis' : 'Run AI Investigation'}
          </button>
        </div>
      </div>

      {/* Body Content */}
      {!investigation ? (
        <div className="py-8 text-center bg-slate-950/40 rounded-lg border border-slate-800/80">
          <Cpu className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-70" />
          <p className="text-sm font-medium text-slate-300">Investigation report not yet compiled.</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-3">
            Click "Run AI Investigation" to initiate server-side Gemini 3.7 intelligence synthesis across all user baseline history and rule triggers.
          </p>
          <button
            onClick={() => handleTrigger(false)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loading ? 'Analyzing...' : 'Generate Forensic Investigation'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Executive Summary */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Executive Summary
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              {investigation.investigationSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Primary Risk Factors */}
            <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-lg">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Primary Risk Factors
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {investigation.primaryRiskFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Supporting Forensic Evidence */}
            <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-lg">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Forensic Baseline Evidence
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {investigation.supportingEvidence.map((ev, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                    <span className="font-mono text-[11px] text-slate-300">{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Recommendation & Confidence */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-blue-950/30 border border-blue-800/40 rounded-lg gap-3">
            <div>
              <span className="text-[11px] uppercase font-bold text-blue-300 tracking-wider block">
                Recommended Policy Action
              </span>
              <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{investigation.recommendedAction}</span>
              </div>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="text-[11px] text-slate-400 block">AI Confidence</span>
              <span className="text-sm font-mono font-bold text-blue-400">{investigation.confidence}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
