import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Transaction } from '../../shared/types';
import { RiskBadge, DecisionBadge } from '../components/StatusBadge';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  FileSpreadsheet,
} from 'lucide-react';

interface TransactionsPageProps {
  onSelectTransaction: (id: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState<
    (Transaction & { riskScore: number; riskLevel: string; decision: string })[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount' | 'riskScore'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.getTransactions({
        search,
        riskLevel: riskFilter,
        decision: decisionFilter,
        paymentMethod: methodFilter,
      });
      setTransactions(data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [riskFilter, decisionFilter, methodFilter]);

  // Client-side Sort
  const sorted = [...transactions].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'timestamp') {
      diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else if (sortBy === 'amount') {
      diff = a.amount - b.amount;
    } else if (sortBy === 'riskScore') {
      diff = a.riskScore - b.riskScore;
    }
    return sortOrder === 'desc' ? -diff : diff;
  });

  // Client-side Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = (field: 'timestamp' | 'amount' | 'riskScore') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div id="transactions-explorer-view" className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Transaction Explorer</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time feed with multi-factor risk attribution and instant forensic drill-down.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadTransactions}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-tx-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadTransactions()}
              placeholder="Search TX ID, User, Merchant..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              id="select-risk-level"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Risk Level: All</option>
              <option value="HIGH">High Risk Only</option>
              <option value="MEDIUM">Medium Risk Only</option>
              <option value="LOW">Low Risk Only</option>
            </select>
          </div>

          {/* Decision Filter */}
          <div>
            <select
              id="select-decision-filter"
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Policy Decision: All</option>
              <option value="ALLOW">Allow (Straight-through)</option>
              <option value="STEP_UP_VERIFICATION">Step-Up Verification</option>
              <option value="MANUAL_REVIEW">Manual Review</option>
              <option value="TEMPORARY_HOLD">Temporary Hold</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              id="select-method-filter"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Payment Method: All</option>
              <option value="UPI">UPI</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="WALLET">Wallet</option>
            </select>
          </div>
        </div>

        {/* Quick Active Counts */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <span>
            Showing <strong className="text-white font-mono">{sorted.length}</strong> matching transactions
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px]">Sort By:</span>
            <button
              onClick={() => toggleSort('timestamp')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                sortBy === 'timestamp' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400'
              }`}
            >
              Time {sortBy === 'timestamp' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
            <button
              onClick={() => toggleSort('amount')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                sortBy === 'amount' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400'
              }`}
            >
              Amount {sortBy === 'amount' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
            <button
              onClick={() => toggleSort('riskScore')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                sortBy === 'riskScore' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400'
              }`}
            >
              Risk {sortBy === 'riskScore' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Merchant & Category</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-center">Risk Level</th>
                <th className="py-3 px-4 text-center">Decision</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {paginated.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx.id)}
                  className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400 group-hover:underline">
                    {tx.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {tx.userId}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="font-semibold text-slate-200">{tx.merchant}</div>
                    <div className="text-[11px] text-slate-500">{tx.merchantCategory}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {tx.location}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">
                    <span
                      className={
                        tx.riskScore >= 70
                          ? 'text-rose-400'
                          : tx.riskScore >= 35
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      {tx.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <RiskBadge level={tx.riskLevel} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <DecisionBadge decision={tx.decision} />
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                    {new Date(tx.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No transactions match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page <strong className="text-white">{currentPage}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded bg-slate-950 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded bg-slate-950 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
