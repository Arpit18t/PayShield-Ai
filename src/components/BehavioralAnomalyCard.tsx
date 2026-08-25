import React from 'react';
import { BehavioralFeatures, UserProfile } from '../../shared/types';
import { Activity, Laptop, MapPin, Zap, TrendingUp, AlertTriangle, Check } from 'lucide-react';

interface BehavioralAnomalyCardProps {
  behavior: BehavioralFeatures;
  user: UserProfile | null;
  currentAmount: number;
}

export const BehavioralAnomalyCard: React.FC<BehavioralAnomalyCardProps> = ({
  behavior,
  user,
  currentAmount,
}) => {
  const isHighRatio = behavior.currentAmountRatio >= 5.0;

  return (
    <div id="behavioral-analysis-card" className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Behavioral Anomaly Profile</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Anomaly Index:</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${
              behavior.behavioralAnomalyScore >= 70
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : behavior.behavioralAnomalyScore >= 35
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {behavior.behavioralAnomalyScore}/100
          </span>
        </div>
      </div>

      {/* Main Ratio Metric Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
          <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            Historical Baseline Avg
          </span>
          <div className="text-lg font-bold text-white mt-1 font-mono">
            ₹{behavior.userAverageAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">Based on {user?.totalTransactionsCount || 0} lifetime txs</span>
        </div>

        <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
          <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Current Transaction
          </span>
          <div className="text-lg font-bold text-white mt-1 font-mono">
            ₹{currentAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">Subject of risk evaluation</span>
        </div>

        <div className={`p-3.5 rounded-lg border ${
          isHighRatio
            ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
            : 'bg-slate-950/60 border-slate-800 text-slate-300'
        }`}>
          <span className="text-[11px] uppercase font-semibold tracking-wider flex items-center justify-between">
            <span>Deviation Ratio</span>
            {isHighRatio && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
          </span>
          <div className={`text-xl font-extrabold mt-1 font-mono ${isHighRatio ? 'text-rose-400' : 'text-emerald-400'}`}>
            {behavior.currentAmountRatio}x
          </div>
          <span className="text-[11px] opacity-80">
            {isHighRatio ? 'Severe spending spike (>5x threshold)' : 'Conforms to user baseline'}
          </span>
        </div>
      </div>

      {/* Secondary Behavioral Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 bg-slate-950/40 border border-slate-800/60 rounded-md">
          <span className="text-slate-400 block mb-1">5-Min Velocity</span>
          <span className="font-mono font-bold text-white text-sm">
            {behavior.txCountLast5Minutes} <span className="text-[11px] font-normal text-slate-400">txs</span>
          </span>
        </div>

        <div className="p-2.5 bg-slate-950/40 border border-slate-800/60 rounded-md">
          <span className="text-slate-400 block mb-1">1-Hour Velocity</span>
          <span className="font-mono font-bold text-white text-sm">
            {behavior.txCountLast1Hour} <span className="text-[11px] font-normal text-slate-400">txs</span>
          </span>
        </div>

        <div className="p-2.5 bg-slate-950/40 border border-slate-800/60 rounded-md">
          <span className="text-slate-400 block mb-1">Device Signature</span>
          {behavior.isNewDevice ? (
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Unrecognized
            </span>
          ) : (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Verified Known
            </span>
          )}
        </div>

        <div className="p-2.5 bg-slate-950/40 border border-slate-800/60 rounded-md">
          <span className="text-slate-400 block mb-1">Location Delta</span>
          {behavior.isLocationChanged ? (
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Geographical Shift
            </span>
          ) : (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Home Region
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
