import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Transaction,
  UserProfile,
  RiskAnalysis,
  InvestigationReport,
} from '../../shared/types';
import { RiskBadge, DecisionBadge } from '../components/StatusBadge';
import { RiskScoreGauge } from '../components/RiskScoreGauge';
import { RiskFactorsTable } from '../components/RiskFactorsTable';
import { BehavioralAnomalyCard } from '../components/BehavioralAnomalyCard';
import { AIInvestigationCard } from '../components/AIInvestigationCard';
import { AnalystChatPanel } from '../components/AnalystChatPanel';
import {
  ArrowLeft,
  User,
  Laptop,
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CreditCard,
  Building,
  Radio,
  FileCheck,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TransactionDetailPageProps {
  transactionId: string;
  onBack: () => void;
}

export const TransactionDetailPage: React.FC<TransactionDetailPageProps> = ({
  transactionId,
  onBack,
}) => {
  const [data, setData] = useState<{
    transaction: Transaction;
    user: UserProfile | null;
    userHistory: Transaction[];
    riskAnalysis: RiskAnalysis;
    investigation: InvestigationReport | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTransactionDetails(transactionId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [transactionId]);

  const handleRunInvestigation = async (forceRefresh = false) => {
    try {
      const inv = await api.runInvestigation(transactionId, forceRefresh);
      setData((prev) => (prev ? { ...prev, investigation: inv } : null));
    } catch (err) {
      console.error('Failed to run AI investigation:', err);
    }
  };

  if (loading) {
    return (
      <div id="tx-detail-loading" className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-slate-300">Compiling multi-vector risk telemetry...</p>
        <p className="text-xs text-slate-500 mt-1">Evaluating rules, behavioral profiles, and AI investigation.</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div id="tx-detail-error" className="py-16 text-center bg-slate-900 border border-slate-800 rounded-xl max-w-xl mx-auto">
        <ShieldX className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">Transaction Not Found</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">{error || 'Could not retrieve details for this ID.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explorer
        </button>
      </div>
    );
  }

  const { transaction: tx, user, userHistory, riskAnalysis, investigation } = data;

  return (
    <div id="transaction-detail-investigation-view" className="space-y-6 pb-16">
      {/* Back button and Main Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-list"
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Back to Explorer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-white tracking-tight font-mono">{tx.id}</h2>
              <RiskBadge level={riskAnalysis.riskLevel} score={riskAnalysis.finalScore} />
              <DecisionBadge decision={riskAnalysis.decision} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Initiated on {new Date(tx.timestamp).toLocaleString()} via {tx.paymentMethod}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Transaction Value
            </span>
            <span className="text-xl font-black text-white font-mono">
              ₹{tx.amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Decision Engine Banner */}
      <div
        id="decision-engine-banner"
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          riskAnalysis.decision === 'TEMPORARY_HOLD'
            ? 'bg-rose-950/40 border-rose-800 text-rose-200'
            : riskAnalysis.decision === 'MANUAL_REVIEW'
            ? 'bg-amber-950/40 border-amber-800 text-amber-200'
            : riskAnalysis.decision === 'STEP_UP_VERIFICATION'
            ? 'bg-sky-950/40 border-sky-800 text-sky-200'
            : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
        }`}
      >
        <div className="flex items-start gap-3">
          {riskAnalysis.riskLevel === 'HIGH' ? (
            <ShieldX className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : riskAnalysis.riskLevel === 'MEDIUM' ? (
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block">
              Deterministic Policy Enforcement: {riskAnalysis.decision}
            </span>
            <p className="text-xs text-slate-300 mt-0.5 font-normal">{riskAnalysis.decisionReason}</p>
          </div>
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 shrink-0">
          Engine Latency: ~14ms
        </div>
      </div>

      {/* Primary Row: Risk Score Gauge + User Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Gauge Component */}
        <div className="lg:col-span-1">
          <RiskScoreGauge
            score={riskAnalysis.finalScore}
            riskLevel={riskAnalysis.riskLevel}
            ruleScore={riskAnalysis.ruleScore}
            behaviorScore={riskAnalysis.behaviorScore}
            mlScore={riskAnalysis.mlScore}
          />
        </div>

        {/* User Profile Baseline Card */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">User Account Baseline Profile</h3>
              </div>
              <span className="text-xs font-mono text-slate-400 font-semibold">{user?.id || tx.userId}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Customer Name</span>
                <span className="font-semibold text-white">{user?.name || 'Unregistered Entity'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Account Age</span>
                <span className="font-mono font-bold text-white">
                  {user?.accountAgeDays ?? 0} days
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Historical Avg Tx</span>
                <span className="font-mono font-bold text-emerald-400">
                  ₹{user?.historicalAverageAmount.toLocaleString('en-IN') ?? '0'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Lifetime Txs</span>
                <span className="font-mono font-bold text-white">
                  {user?.totalTransactionsCount ?? 0}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Usual Geolocation</span>
                <span className="font-medium text-slate-200">{user?.usualLocation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Registered Device</span>
                <span className="font-mono text-slate-200">{user?.usualDevice || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">30-Day Failure Count</span>
                <span className={`font-mono font-bold ${(user?.failedTransactionsCountLast30Days ?? 0) > 2 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {user?.failedTransactionsCountLast30Days ?? 0} failures
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Customer Risk Tier</span>
                <span className="font-semibold text-blue-400">{user?.riskTier || 'STANDARD'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Customer ID: {user?.email || 'N/A'}</span>
            <span>Phone: {user?.phone || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Behavioral Anomaly Profile */}
      <BehavioralAnomalyCard
        behavior={riskAnalysis.behavioralFeatures}
        user={user}
        currentAmount={tx.amount}
      />

      {/* Deterministic Rule Engine Breakdown ("Why was this flagged?") */}
      <RiskFactorsTable rules={riskAnalysis.allRules} />

      {/* Device & Location Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Intelligence */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
            <Laptop className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Hardware & Session Fingerprint</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Device Hardware ID</span>
              <span className="font-mono text-white font-semibold">{tx.deviceId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Device Specification</span>
              <span className="text-slate-200">{tx.deviceType || 'Chrome Browser / Standard'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Origin IP Address</span>
              <span className="font-mono text-slate-300">{tx.ipAddress || '102.89.23.114'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Device Baseline Status</span>
              {riskAnalysis.behavioralFeatures.isNewDevice ? (
                <span className="text-rose-400 font-bold">UNRECOGNIZED NEW DEVICE</span>
              ) : (
                <span className="text-emerald-400 font-bold">VERIFIED HARDWARE MATCH</span>
              )}
            </div>
          </div>
        </div>

        {/* Location & Merchant Intelligence */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
            <MapPin className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Geolocation & Merchant Profile</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Current Origin Geolocation</span>
              <span className="font-semibold text-white">{tx.location}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Registered Home Region</span>
              <span className="text-slate-300">{user?.usualLocation || 'Delhi, India'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Merchant Entity</span>
              <span className="font-semibold text-slate-200">{tx.merchant}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Merchant Category</span>
              <span className="font-mono text-slate-300">{tx.merchantCategory}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Investigation Report Card */}
      <AIInvestigationCard
        investigation={investigation}
        transactionId={tx.id}
        onRunInvestigation={handleRunInvestigation}
      />

      {/* AI Analyst Interactive Chat Panel */}
      <AnalystChatPanel transactionId={tx.id} />

      {/* Recent User Transactions Timeline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Recent Activity Sequence for User {user?.id || tx.userId}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical activity timeline evaluated during velocity anomaly detection.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">TX ID</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Payment Method</th>
                <th className="py-2.5 px-4">Merchant</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {userHistory.map((h) => (
                <tr
                  key={h.id}
                  className={`transition-colors ${h.id === tx.id ? 'bg-blue-950/30 text-white' : 'text-slate-300'}`}
                >
                  <td className="py-2.5 px-4 font-mono font-bold">
                    {h.id} {h.id === tx.id && <span className="text-blue-400 text-[10px] ml-1">(Current)</span>}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold">
                    ₹{h.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px]">{h.paymentMethod}</td>
                  <td className="py-2.5 px-4">{h.merchant}</td>
                  <td className="py-2.5 px-4">{h.location}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {h.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                    {new Date(h.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
