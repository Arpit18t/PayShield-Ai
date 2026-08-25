import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardMetrics, Transaction } from '../../shared/types';
import { RiskBadge, DecisionBadge } from '../components/StatusBadge';
import {
  CreditCard,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

interface OverviewPageProps {
  onSelectTransaction: (id: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onSelectTransaction }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [transactions, setTransactions] = useState<(Transaction & { riskScore: number; riskLevel: string; decision: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [m, txs] = await Promise.all([
        api.getDashboardMetrics(),
        api.getTransactions(),
      ]);
      setMetrics(m);
      setTransactions(txs);
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Synthetic trend timeline for chart
  const volumeTrendData = [
    { time: '00:00', totalVolume: 120000, riskCount: 1 },
    { time: '03:00', totalVolume: 65000, riskCount: 0 },
    { time: '06:00', totalVolume: 180000, riskCount: 2 },
    { time: '09:00', totalVolume: 420000, riskCount: 4 },
    { time: '12:00', totalVolume: 680000, riskCount: 3 },
    { time: '15:00', totalVolume: 590000, riskCount: 5 },
    { time: '18:00', totalVolume: 840000, riskCount: 7 },
    { time: '21:00', totalVolume: 410000, riskCount: 2 },
  ];

  const riskDistributionData = [
    { name: 'Low Risk', value: metrics?.lowRiskCount ?? transactions.filter(t => t.riskLevel === 'LOW').length, color: '#10B981' },
    { name: 'Medium Risk', value: metrics?.mediumRiskCount ?? transactions.filter(t => t.riskLevel === 'MEDIUM').length, color: '#F59E0B' },
    { name: 'High Risk', value: metrics?.highRiskCount ?? transactions.filter(t => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length, color: '#F43F5E' },
  ];

  const paymentMethodRiskData = React.useMemo(() => {
    if (!transactions.length) {
      return [
        { method: 'UPI', total: 11, highRisk: 4 },
        { method: 'Cards', total: 5, highRisk: 1 },
        { method: 'NetBanking', total: 3, highRisk: 1 },
        { method: 'Wallet', total: 2, highRisk: 0 },
      ];
    }
    const methods = [
      { key: 'UPI', label: 'UPI' },
      { key: 'Credit Card', label: 'Credit Card' },
      { key: 'Debit Card', label: 'Debit Card' },
      { key: 'Net Banking', label: 'NetBanking' },
      { key: 'Wallet', label: 'Wallet' },
    ];
    return methods.map((m) => {
      const match = transactions.filter((t) => t.paymentMethod === m.key);
      const highRisk = match.filter((t) => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length;
      return {
        method: m.label,
        total: match.length,
        highRisk,
      };
    }).filter(m => m.total > 0);
  }, [transactions]);

  const highRiskTxs = transactions
    .filter((t) => t.riskLevel === 'HIGH' || t.riskScore >= 70)
    .slice(0, 6);

  return (
    <div id="overview-dashboard-view" className="space-y-6 pb-12">
      {/* Top Welcome & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Risk Operations Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-vector transaction scoring and AI fraud investigation console.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Transactions */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Transactions</span>
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {metrics?.totalTransactions ?? '...'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% vs 24h</span>
          </div>
        </div>

        {/* High Risk */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-900/40 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-rose-300">High Risk</span>
            <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400">
              <ShieldX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">
            {metrics?.highRiskCount ?? '...'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {metrics?.highRiskRatePercent ?? 0}% anomaly rate
          </div>
        </div>

        {/* Medium Risk */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-amber-300">Medium Risk</span>
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {metrics?.mediumRiskCount ?? '...'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Step-up challenge required
          </div>
        </div>

        {/* Under Review */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Under Review</span>
            <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-sky-400 font-mono">
            {metrics?.underReviewCount ?? '...'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Pending analyst resolution
          </div>
        </div>

        {/* Blocked / Held */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-rose-300">Temp Held / Block</span>
            <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {metrics?.blockedCount ?? '...'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Severe policy triggers
          </div>
        </div>
      </div>

      {/* Primary Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume & Risk Spike Trend */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                24-Hour Transaction Volume & Anomaly Velocity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time volume throughput alongside flagged risk events
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeTrendData}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Processed Volume']}
                />
                <Area type="monotone" dataKey="totalVolume" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#volGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Risk Tier Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Composite risk segmentation</p>
          </div>
          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800">
            {riskDistributionData.map((d) => (
              <div key={d.name} className="p-1.5 rounded bg-slate-950/60">
                <span className="text-[10px] text-slate-400 block">{d.name}</span>
                <span className="font-bold text-white font-mono">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent High-Risk Transactions Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Recent High-Risk Transactions (Action Required)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Transactions requiring immediate forensic investigation or confirmation.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {highRiskTxs.length} Flagged Cases
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">Risk Level</th>
                <th className="py-3 px-4 text-center">Decision</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {highRiskTxs.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx.id)}
                  className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-blue-400 group-hover:underline">
                    {tx.id}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {tx.userId}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {tx.location}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-rose-400">
                    {tx.riskScore}/100
                  </td>
                  <td className="py-3 px-4 text-center">
                    <RiskBadge level={tx.riskLevel} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <DecisionBadge decision={tx.decision} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(tx.id);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-medium cursor-pointer"
                    >
                      <span>Investigate</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
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
