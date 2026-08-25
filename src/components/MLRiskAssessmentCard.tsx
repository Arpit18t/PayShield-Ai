import React from 'react';
import { MLScoreBreakdown } from '../../shared/types';
import { Cpu, CheckCircle2, AlertTriangle, HelpCircle, Layers } from 'lucide-react';

interface MLRiskAssessmentCardProps {
  mlBreakdown?: MLScoreBreakdown;
  ruleScore: number;
  behaviorScore: number;
  mlScore: number;
  finalScore: number;
}

export const MLRiskAssessmentCard: React.FC<MLRiskAssessmentCardProps> = ({
  mlBreakdown,
  ruleScore,
  behaviorScore,
  mlScore,
  finalScore,
}) => {
  const modelVersion = mlBreakdown?.mlModelVersion || 'PayShield-GBDT-v2.1';
  const modelStatus = mlBreakdown?.modelStatus || 'ACTIVE';
  const probability = mlBreakdown?.mlProbability !== undefined ? mlBreakdown.mlProbability : (mlScore / 100);
  const featureImportances = mlBreakdown?.featureImportances || [];

  const rulePart = (0.40 * ruleScore).toFixed(1);
  const behPart = (0.35 * behaviorScore).toFixed(1);
  const mlPart = (0.25 * mlScore).toFixed(1);

  return (
    <div id="ml-risk-assessment-card" className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Machine Learning Risk Assessment</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                modelStatus === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {modelStatus === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {modelStatus === 'ACTIVE' ? 'ONLINE GBDT MODEL' : 'FALLBACK ENGINE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Supervised Gradient Boosted Decision Forest trained on synthetic transaction features
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Model Version
          </span>
          <span className="font-mono text-xs font-semibold text-purple-300">
            {modelVersion}
          </span>
        </div>
      </div>

      {/* Model Probability and Score Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
        <div>
          <span className="text-[11px] text-slate-400 block mb-1">Estimated Risk Probability</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">
              {(probability * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 font-mono">({probability.toFixed(4)})</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block mb-1">ML Component Score</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black font-mono ${
              mlScore >= 70 ? 'text-rose-400' : mlScore >= 30 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {mlScore}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 block mb-1">Supervised Training Data</span>
          <span className="text-xs font-semibold text-slate-300 block">
            5,000 Synthetic Transactions
          </span>
          <span className="text-[10px] text-slate-500">
            Seed 42 (Reproducible GBDT)
          </span>
        </div>
      </div>

      {/* Transparent Formula Calculation */}
      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Composite Risk Pipeline Calculation</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400 flex flex-wrap items-center gap-1">
          <span className="text-white font-bold">Final Risk Score ({finalScore})</span>
          <span>=</span>
          <span className="text-blue-400">(0.40 × {ruleScore} Rule)</span>
          <span>+</span>
          <span className="text-cyan-400">(0.35 × {behaviorScore} Beh)</span>
          <span>+</span>
          <span className="text-purple-400">(0.25 × {mlScore} ML)</span>
          <span>=</span>
          <span className="text-white">{rulePart} + {behPart} + {mlPart} = {finalScore}</span>
        </div>
      </div>

      {/* Feature Contributions / Explainability */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-slate-200">
            Top Predictive Feature Contributions (Explainability / XAI)
          </h4>
          <span className="text-[11px] text-slate-500">Feature Importance Ranking</span>
        </div>

        <div className="space-y-2">
          {featureImportances.slice(0, 5).map((f) => (
            <div key={f.featureName} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-200">
                  {f.displayName || f.featureName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 text-[11px]">
                    Val: <strong className="text-white">{String(f.featureValue ?? 'N/A')}</strong>
                  </span>
                  <span className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                    f.contribution > 50
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : f.contribution > 20
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    +{f.contribution} pts
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden my-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    f.contribution > 50 ? 'bg-rose-500' : f.contribution > 20 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, f.contribution))}%` }}
                />
              </div>

              {f.description && (
                <p className="text-[11px] text-slate-400 mt-1">
                  {f.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
