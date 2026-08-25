import React, { useState } from 'react';
import {
  Layers,
  Shield,
  Activity,
  Cpu,
  Sparkles,
  CheckCircle,
  FileText,
  AlertOctagon,
  ArrowRight,
  Database,
  Lock,
  GitBranch,
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(1);

  const stages = [
    {
      step: 1,
      title: 'Transaction Ingestion',
      category: 'DATA INGRESS',
      icon: Database,
      summary: 'High-throughput event ingestion capturing payload parameters, payment channel, IP address, and hardware fingerprint.',
      details: 'Captures raw payload (₹ amount, timestamp, user ID, merchant ID, MCC category, payment method) alongside transport telemetry (client IP, device fingerprint hash, user-agent).',
    },
    {
      step: 2,
      title: 'Feature Extraction & Baseline Alignment',
      category: 'FEATURE ENGINEERING',
      icon: Activity,
      summary: 'Computes 14 engineered features comparing current transaction with user historical moving averages.',
      details: 'Calculates Amount Spike Ratio (current / historical avg), 5-minute velocity window, 1-hour velocity window, device change boolean, geolocation distance delta, and failure rates.',
    },
    {
      step: 3,
      title: 'Deterministic Rule Engine',
      category: 'POLICY ENFORCEMENT',
      icon: Shield,
      summary: 'Executes hard-coded rule matrix with explicit thresholds and explainable penalties (40% weight).',
      details: 'Evaluates R001 (Extreme Amount Spike >5x), R002 (Burst Velocity), R003 (New Device High Value), R004 (Cross-Border / Impossible Travel), R005 (Night-Time Anomaly), R006 (Recent Card Failures), R007 (High-Risk Merchant MCC).',
    },
    {
      step: 4,
      title: 'Behavioral Anomaly Engine',
      category: 'STATISTICAL MODELING',
      icon: Activity,
      summary: 'Quantifies deviation from established user behavior patterns using normalized anomaly vectors (35% weight).',
      details: 'Measures multi-dimensional deviation: spending magnitude variance, velocity burst density, device unfamiliarity penalty, and geographical divergence index.',
    },
    {
      step: 5,
      title: 'ML Risk Scoring Classifier',
      category: 'PREDICTIVE INFERENCE',
      icon: Cpu,
      summary: 'Lightweight simulated gradient boosted decision tree (XGBoost/LightGBM ready) predicting fraud probability (25% weight).',
      details: 'Calculates non-linear feature interactions and outputs SHAP-ready feature contributions for explainable fraud probability scoring.',
    },
    {
      step: 6,
      title: 'Composite Risk Score Synthesis',
      category: 'SCORE ARBITRATION',
      icon: Layers,
      summary: 'Weighted linear combination: Final Score = (0.40 × Rule) + (0.35 × Behavior) + (0.25 × ML), clamped 0–100.',
      details: 'Applies rigorous bound checks and categorizes into LOW (0–30), MEDIUM (31–70), and HIGH (71–100) risk tiers.',
    },
    {
      step: 7,
      title: 'Policy Decision Engine',
      category: 'DETERMINISTIC GATEWAY',
      icon: Lock,
      summary: 'Hardcoded risk routing rules determining transactional action (ALLOW, STEP-UP, MANUAL REVIEW, HOLD).',
      details: 'Ensures strict separation: Generative AI never makes the blocking decision. Policy enforcement is 100% deterministic, audited, and compliant with regulatory mandates.',
    },
    {
      step: 8,
      title: 'Gemini 3.7 AI Forensic Investigator',
      category: 'GENERATIVE REASONING',
      icon: Sparkles,
      summary: 'Analyzes the full forensic dossier to produce human-readable executive summaries, evidence citations, and analyst guidance.',
      details: 'Leverages server-side Gemini 3.7 Flash with strict JSON schema output to synthesize complex multi-signal forensic evidence into actionable intelligence.',
    },
    {
      step: 9,
      title: 'Analyst Dashboard & Explainable XAI',
      category: 'HUMAN-IN-THE-LOOP',
      icon: FileText,
      summary: 'Interactive triage console with why-flagged breakdown, baseline comparisons, and real-time AI copilot Q&A.',
      details: 'Empowers Level 2 and Level 3 fraud analysts to verify telemetry, question the AI copilot, confirm fraud patterns, and resolve or dismiss alerts with full audit trail.',
    },
  ];

  const current = stages.find((s) => s.step === activeStage) || stages[0];
  const CurrentIcon = current.icon;

  return (
    <div id="architecture-pipeline-view" className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">PayShield Risk Pipeline & XAI Architecture</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          End-to-end 9-stage forensic workflow with strict separation between deterministic enforcement and generative AI reasoning.
        </p>
      </div>

      {/* Core Architectural Tenet Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/40 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Lock className="w-4 h-4 text-blue-400" />
          <span>Core Design Principle: Separation of Policy vs Generative AI</span>
        </div>
        <p className="leading-relaxed">
          In PayShield AI, <strong>transaction blocking decisions are 100% deterministic</strong>. The Rule and Decision engines evaluate concrete thresholds (e.g. 5x baseline spike, unrecognized hardware). The <strong>Gemini AI model serves as an Explainable AI (XAI) Forensic Investigator</strong>, synthesizing complex evidence for human analysts rather than acting as a non-deterministic black-box gatekeeper.
        </p>
      </div>

      {/* Interactive 9-Stage Flow Visualizer */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-white mb-4">9-Stage Transaction Risk Pipeline Flow</h3>

        {/* Stage Timeline Navigation */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 mb-6">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isSelected = stage.step === activeStage;
            return (
              <button
                key={stage.step}
                onClick={() => setActiveStage(stage.step)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500/60 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>
                    0{stage.step}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                </div>
                <div className="text-[11px] font-semibold line-clamp-2 leading-tight">
                  {stage.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Deep-Dive Card */}
        <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <CurrentIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                  Stage 0{current.step} — {current.category}
                </span>
                <h4 className="text-base font-bold text-white">{current.title}</h4>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {current.summary}
          </p>

          <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-lg">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Technical Implementation Specification
            </span>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {current.details}
            </p>
          </div>
        </div>
      </div>

      {/* Feature & Mathematical Weight Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-semibold text-white">Rule Engine Matrix (40%)</h4>
          </div>
          <p className="text-xs text-slate-400 mb-3">Hard-coded deterministic checks evaluated per event.</p>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex justify-between py-1 border-b border-slate-800">
              <span>R001: Spending Spike (&gt;5x)</span>
              <span className="font-mono text-rose-400 font-bold">+35 pts</span>
            </li>
            <li className="flex justify-between py-1 border-b border-slate-800">
              <span>R002: Velocity Burst (&gt;2 in 5m)</span>
              <span className="font-mono text-rose-400 font-bold">+30 pts</span>
            </li>
            <li className="flex justify-between py-1 border-b border-slate-800">
              <span>R003: New Device High Value</span>
              <span className="font-mono text-amber-400 font-bold">+25 pts</span>
            </li>
            <li className="flex justify-between py-1 border-b border-slate-800">
              <span>R004: Foreign / Impossible Travel</span>
              <span className="font-mono text-rose-400 font-bold">+35 pts</span>
            </li>
            <li className="flex justify-between py-1">
              <span>R005: Nocturnal Burst (00-05h)</span>
              <span className="font-mono text-amber-400 font-bold">+15 pts</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white">Behavioral Profiler (35%)</h4>
          </div>
          <p className="text-xs text-slate-400 mb-3">Dynamic statistical deviations from user historical norms.</p>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex justify-between py-1 border-b border-slate-800">
              <span>Amount Ratio Scaling</span>
              <span className="font-mono text-cyan-400 font-bold">1.0x to 15.0x</span>
            </li>
            <li className="flex justify-between py-1 border-b border-slate-800">
              <span>Rolling 1-Hour Frequency</span>
              <span className="font-mono text-cyan-400 font-bold">Density metric</span>
            </li>
            <li className="flex justify-between py-1 border-b border-slate-800">
              <span>Hardware Delta Penalty</span>
              <span className="font-mono text-cyan-400 font-bold">+20 pts</span>
            </li>
            <li className="flex justify-between py-1 border-b border-slate-800">
              <span>Location Shift Penalty</span>
              <span className="font-mono text-cyan-400 font-bold">+25 pts</span>
            </li>
            <li className="flex justify-between py-1">
              <span>Normalizing Function</span>
              <span className="font-mono text-slate-400 font-bold">Sigmoid / Clamp</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">ML Model Classifier (25%)</h4>
          </div>
          <p className="text-xs text-slate-400 mb-3">Interactions modeling with SHAP feature explainability.</p>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex justify-between py-1 border-b border-slate-800">
              <span>Classifier Architecture</span>
              <span className="font-mono text-purple-400 font-bold">GBDT / XGBoost</span>
            </li>
            <li className="flex justify-between py-1 border-b border-slate-800">
              <span>Inference Time</span>
              <span className="font-mono text-emerald-400 font-bold">&lt;2.5 ms</span>
            </li>
            <li className="flex justify-between py-1 border-b border-slate-800">
              <span>Non-linear Interactions</span>
              <span className="font-mono text-purple-400 font-bold">Enabled</span>
            </li>
            <li className="flex justify-between py-1 border-b border-slate-800">
              <span>Feature Attribution</span>
              <span className="font-mono text-purple-400 font-bold">SHAP Vector</span>
            </li>
            <li className="flex justify-between py-1">
              <span>Model Calibration</span>
              <span className="font-mono text-slate-400 font-bold">Platt Scaling</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
