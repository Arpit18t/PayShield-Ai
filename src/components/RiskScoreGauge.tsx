import React from 'react';
import { RiskLevel } from '../../shared/types';
import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

interface RiskScoreGaugeProps {
  score: number; // 0 to 100
  riskLevel: RiskLevel;
  ruleScore?: number;
  behaviorScore?: number;
  mlScore?: number;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({
  score,
  riskLevel,
  ruleScore = 0,
  behaviorScore = 0,
  mlScore = 0,
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Determine color theme based on level
  const isHigh = clampedScore >= 71;
  const isMed = clampedScore >= 31 && clampedScore < 71;

  const colorHex = isHigh ? '#F43F5E' : isMed ? '#F59E0B' : '#10B981';
  const strokeDash = `${(clampedScore / 100) * 283} 283`;

  return (
    <div id="risk-score-gauge-container" className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Risk Assessment</span>
          <h3 className="text-base font-semibold text-white">Composite Risk Score</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
          style={{
            backgroundColor: `${colorHex}15`,
            borderColor: `${colorHex}40`,
            color: colorHex,
          }}
        >
          {isHigh ? <ShieldX className="w-4 h-4" /> : isMed ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          {riskLevel} RISK
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Radial Circular Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#1E293B"
              strokeWidth="9"
            />
            {/* Value Arc */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={colorHex}
              strokeWidth="9"
              strokeDasharray={strokeDash}
              strokeDashoffset="0"
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-white tracking-tight">{clampedScore}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">/ 100</span>
          </div>
        </div>

        {/* Weights Breakdown List */}
        <div className="w-full space-y-3">
          {/* Rule Component */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Rule Engine
              </span>
              <span className="text-slate-400 font-mono">
                {ruleScore}/100 <span className="text-slate-500 font-normal">(40% wt)</span>
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, ruleScore)}%` }}
              ></div>
            </div>
          </div>

          {/* Behavior Component */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Behavioral Anomaly
              </span>
              <span className="text-slate-400 font-mono">
                {behaviorScore}/100 <span className="text-slate-500 font-normal">(35% wt)</span>
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-500 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, behaviorScore)}%` }}
              ></div>
            </div>
          </div>

          {/* ML Component */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                ML Classifier
              </span>
              <span className="text-slate-400 font-mono">
                {mlScore}/100 <span className="text-slate-500 font-normal">(25% wt)</span>
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, mlScore)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
