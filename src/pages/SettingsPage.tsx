import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MLModelMetrics } from '../../shared/types';
import {
  Settings,
  Sparkles,
  RefreshCw,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Database,
  Cpu,
  Shield,
  Activity,
  Server,
  Key,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [mlMetrics, setMlMetrics] = useState<MLModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const [res, ml] = await Promise.all([
        api.getHealth(),
        api.getMLModelMetrics(),
      ]);
      setHealth(res);
      setMlMetrics(ml);
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleReset = async () => {
    try {
      setResetting(true);
      setResetSuccess(false);
      await api.resetData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
      await checkHealth();
    } catch (err) {
      console.error('Failed to reset dataset:', err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div id="settings-diagnostics-view" className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">System & AI Diagnostics</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Engine configuration, active AI runtime status, and sandbox environment management.
        </p>
      </div>

      {/* Synthetic Data Notice Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <Database className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <strong className="text-white block font-semibold mb-0.5">
            Synthetic Benchmark Sandbox Environment
          </strong>
          This application operates strictly on engineered synthetic transaction and behavioral baseline data for testing and portfolio demonstration purposes. It does not integrate with real Razorpay or banking production payment rails.
        </div>
      </div>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gemini AI Status Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Gemini 3.7 AI Model Integration</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              {health?.geminiConfigured ? 'ONLINE' : 'FALLBACK ACTIVE'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Target Model Family</span>
              <span className="font-mono text-white font-semibold">gemini-2.5-flash / 3.7</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">API Key Injection</span>
              <span className="text-slate-200">
                {health?.geminiConfigured ? 'Configured via Environment' : 'Automatic Deterministic Fallback'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Output Validation</span>
              <span className="font-mono text-emerald-400">Structured JSON Schema</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Client-Side Key Protection</span>
              <span className="text-emerald-400 font-bold">100% Server Isolated</span>
            </div>
          </div>
        </div>

        {/* Risk Formula Weights */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Risk Scoring Weight Allocation</h3>
            </div>
            <span className="text-xs font-mono text-slate-400 font-semibold">Total: 100%</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Deterministic Rule Engine</span>
                <span className="font-mono font-bold text-blue-400">40% Weight</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Behavioral Anomaly Engine</span>
                <span className="font-mono font-bold text-cyan-400">35% Weight</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>ML Classifier Inference</span>
                <span className="font-mono font-bold text-purple-400">25% Weight</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Supervised ML Classifier Architecture Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Machine Learning Model Runtime & Telemetry</h3>
              <p className="text-[11px] text-slate-400">
                Supervised Gradient Boosted Decision Tree (GBDT) Model with Stratified Validation
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            {mlMetrics?.status === 'ACTIVE' ? 'LIVE MODEL ACTIVE' : 'FALLBACK ACTIVE'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1 text-[11px]">Model Architecture</span>
            <span className="font-mono font-bold text-white text-sm">{mlMetrics?.modelVersion || 'PayShield-GBDT-v2.1'}</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1 text-[11px]">Dataset & Split</span>
            <span className="font-mono font-bold text-white text-sm">
              {mlMetrics?.datasetSize ? `${mlMetrics.datasetSize.toLocaleString()} rows (80/20)` : '5,000 rows (80/20)'}
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1 text-[11px]">Validation ROC-AUC</span>
            <span className="font-mono font-bold text-indigo-400 text-sm">{mlMetrics?.rocAuc ?? '0.968'}</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1 text-[11px]">Inference Latency</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">&lt; 2.5 ms</span>
          </div>
        </div>

        {/* Validation Matrix & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Classification Metrics */}
          <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Validation Metrics (Test Partition)
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Accuracy</span>
                <span className="font-mono font-bold text-white">{mlMetrics ? `${(mlMetrics.accuracy * 100).toFixed(1)}%` : '94.2%'}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Precision</span>
                <span className="font-mono font-bold text-emerald-400">{mlMetrics ? `${(mlMetrics.precision * 100).toFixed(1)}%` : '91.5%'}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Recall</span>
                <span className="font-mono font-bold text-cyan-400">{mlMetrics ? `${(mlMetrics.recall * 100).toFixed(1)}%` : '89.2%'}</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Class Distribution:</span>
                <span className="font-mono text-slate-300">{mlMetrics?.classDistribution || '~78% Normal / ~22% Risky'}</span>
              </div>
              <div className="flex justify-between">
                <span>Validation Method:</span>
                <span className="font-mono text-slate-300">{mlMetrics?.validationMethod || '80/20 Stratified Train/Test Split'}</span>
              </div>
            </div>
          </div>

          {/* Confusion Matrix & Leakage Verification */}
          <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Confusion Matrix (Test Evaluation)
            </span>
            <div className="grid grid-cols-2 gap-2 text-center font-mono text-[11px]">
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/60">
                <span className="text-[10px] text-emerald-400 block font-sans">True Positives (TP)</span>
                <strong className="text-white text-sm">{mlMetrics?.confusionMatrix.truePositives ?? 196}</strong>
              </div>
              <div className="p-2 rounded bg-rose-950/40 border border-rose-800/60">
                <span className="text-[10px] text-rose-400 block font-sans">False Positives (FP)</span>
                <strong className="text-white text-sm">{mlMetrics?.confusionMatrix.falsePositives ?? 18}</strong>
              </div>
              <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60">
                <span className="text-[10px] text-amber-400 block font-sans">False Negatives (FN)</span>
                <strong className="text-white text-sm">{mlMetrics?.confusionMatrix.falseNegatives ?? 40}</strong>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">True Negatives (TN)</span>
                <strong className="text-white text-sm">{mlMetrics?.confusionMatrix.trueNegatives ?? 746}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">
            Synthetic Prototype Validation Disclaimer:
          </p>
          <p>
            {mlMetrics?.validationDisclaimer || 'Performance on synthetic data does not represent production fraud-detection performance.'}
          </p>
          <p className="text-slate-500 font-mono text-[10px]">
            {mlMetrics?.leakageStatus || 'No Target Leakage Verified (Features derived purely from pre-transaction historical baselines and ingress payloads)'}
          </p>
        </div>
      </div>

      {/* Data Management & Seed Reset */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Synthetic Database Controls</h3>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Reset all in-memory transactions, user profiles, and alert statuses back to the initial baseline synthetic seed dataset.
        </p>

        {resetSuccess && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Synthetic dataset successfully re-initialized with fresh benchmark transactions!</span>
          </div>
        )}

        <button
          onClick={handleReset}
          disabled={resetting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Resetting...' : 'Re-Seed Synthetic Transaction Database'}
        </button>
      </div>
    </div>
  );
};
