import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardMetrics, Transaction } from '../../shared/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Percent,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [transactions, setTransactions] = useState<
    (Transaction & { riskScore: number; riskLevel: string; decision: string })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [m, txs] = await Promise.all([
          api.getDashboardMetrics(),
          api.getTransactions(),
        ]);
        setMetrics(m);
        setTransactions(txs);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const volumeDailyData = [
    { day: 'Mon', volume: 820000, riskCount: 4, blocked: 1 },
    { day: 'Tue', volume: 940000, riskCount: 3, blocked: 1 },
    { day: 'Wed', volume: 1120000, riskCount: 6, blocked: 2 },
    { day: 'Thu', volume: 1050000, riskCount: 5, blocked: 1 },
    { day: 'Fri', volume: 1450000, riskCount: 9, blocked: 3 },
    { day: 'Sat', volume: 1280000, riskCount: 7, blocked: 2 },
    { day: 'Sun', volume: 980000, riskCount: 4, blocked: 1 },
  ];

  // Dynamically compute category risk data from actual dataset
  const categoryRiskData = React.useMemo(() => {
    if (!transactions.length) {
      return [
        { category: 'Precious Metals & Bullion', avgRisk: 88, count: 2 },
        { category: 'Electronics & High-Risk', avgRisk: 84, count: 3 },
        { category: 'Cryptocurrency Exchange', avgRisk: 80, count: 2 },
        { category: 'Digital Goods & Vouchers', avgRisk: 72, count: 4 },
        { category: 'Travel & Airlines', avgRisk: 52, count: 3 },
        { category: 'Luxury Retail', avgRisk: 48, count: 2 },
        { category: 'General Supermarkets', avgRisk: 14, count: 6 },
        { category: 'Utilities & Bill Pay', avgRisk: 12, count: 4 },
      ];
    }
    const catMap: Record<string, { totalScore: number; count: number }> = {};
    transactions.forEach((tx) => {
      const cat = tx.merchantCategory || 'Other';
      if (!catMap[cat]) catMap[cat] = { totalScore: 0, count: 0 };
      catMap[cat].totalScore += tx.riskScore || 0;
      catMap[cat].count += 1;
    });
    return Object.entries(catMap)
      .map(([category, d]) => ({
        category,
        avgRisk: Math.round(d.totalScore / d.count),
        count: d.count,
      }))
      .sort((a, b) => b.avgRisk - a.avgRisk)
      .slice(0, 8);
  }, [transactions]);

  // Dynamically compute payment channels from actual dataset
  const paymentChannelBreakdown = React.useMemo(() => {
    if (!transactions.length) {
      return [
        { method: 'UPI', volume: 420000, highRisk: 4, lowRisk: 7 },
        { method: 'Credit Card', volume: 280000, highRisk: 1, lowRisk: 4 },
        { method: 'Debit Card', volume: 140000, highRisk: 1, lowRisk: 3 },
        { method: 'Net Banking', volume: 190000, highRisk: 1, lowRisk: 2 },
        { method: 'Wallet', volume: 45000, highRisk: 0, lowRisk: 2 },
      ];
    }
    const methods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'];
    return methods.map((m) => {
      const txs = transactions.filter((t) => t.paymentMethod === m);
      const volume = txs.reduce((acc, t) => acc + (t.amount || 0), 0);
      const highRisk = txs.filter((t) => t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length;
      const lowRisk = txs.filter((t) => t.riskLevel === 'LOW' || t.riskLevel === 'MEDIUM').length;
      return { method: m, volume, highRisk, lowRisk };
    });
  }, [transactions]);

  return (
    <div id="analytics-intelligence-view" className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Risk Analytics & Pattern Intelligence</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Macro statistical distributions, payment channel risk vectors, and merchant vulnerability metrics.
        </p>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Evaluated Volume</span>
          <div className="text-xl font-extrabold text-white font-mono mt-1">
            ₹{(metrics?.totalVolumeINR || 418000).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> 100% evaluated
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">High-Risk Anomaly Rate</span>
          <div className="text-xl font-extrabold text-rose-400 font-mono mt-1">
            {metrics?.highRiskRatePercent ?? 23.8}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Threshold &gt; 70 score</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Average Risk Score</span>
          <div className="text-xl font-extrabold text-white font-mono mt-1">
            {metrics?.avgRiskScore ?? 48}/100
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Baseline normalized</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Review & Hold Rate</span>
          <div className="text-xl font-extrabold text-sky-400 font-mono mt-1">
            {Math.round(((metrics?.underReviewCount || 0) + (metrics?.blockedCount || 0)) / ((metrics?.totalTransactions || 1)) * 100)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Requiring human triage</span>
        </div>
      </div>

      {/* Primary Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Volume vs Risk Flags */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-1">Weekly Volume Throughput & Anomaly Flags</h3>
          <p className="text-xs text-slate-400 mb-4">Total processed volume vs count of flagged high-risk anomalies</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="riskCount" fill="#F43F5E" name="Flagged Anomalies" radius={[4, 4, 0, 0]} />
                <Bar dataKey="blocked" fill="#3B82F6" name="Automated Holds" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Merchant Category Risk Exposure */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-1">Average Risk Score by Merchant Category</h3>
          <p className="text-xs text-slate-400 mb-4">Forensic risk concentration across industry sectors</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryRiskData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748B" fontSize={11} />
                <YAxis dataKey="category" type="category" width={140} stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}/100`, 'Avg Risk Score']}
                />
                <Bar dataKey="avgRisk" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payment Channel Breakdown Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-white mb-1">Payment Method Risk Distribution Matrix</h3>
        <p className="text-xs text-slate-400 mb-4">Volume and anomaly concentration across financial rails</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {paymentChannelBreakdown.map((ch) => (
            <div key={ch.method} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
              <span className="text-xs font-bold text-white block">{ch.method}</span>
              <div className="text-base font-extrabold text-slate-200 font-mono mt-1">
                ₹{ch.volume.toLocaleString('en-IN')}
              </div>
              <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-800/80">
                <span className="text-rose-400 font-semibold">{ch.highRisk} High Risk</span>
                <span className="text-emerald-400 font-semibold">{ch.lowRisk} Cleared</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
