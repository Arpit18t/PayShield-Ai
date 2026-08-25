import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RiskAlert } from '../../shared/types';
import { SeverityBadge, AlertStatusBadge } from '../components/StatusBadge';
import {
  AlertOctagon,
  ShieldAlert,
  Clock,
  CheckCircle,
  Filter,
  RefreshCw,
  ChevronRight,
  User,
  Zap,
} from 'lucide-react';

interface AlertsPageProps {
  onSelectTransaction: (id: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onSelectTransaction }) => {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts({
        status: statusFilter,
        severity: severityFilter,
      });
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [statusFilter, severityFilter]);

  const handleUpdateStatus = async (alertId: string, newStatus: RiskAlert['status'], e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await api.updateAlertStatus(alertId, newStatus);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
    } catch (err) {
      console.error('Failed to update alert status:', err);
    }
  };

  const newCount = alerts.filter((a) => a.status === 'NEW').length;
  const investigatingCount = alerts.filter((a) => a.status === 'INVESTIGATING').length;

  return (
    <div id="risk-alerts-center-view" className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Risk Alert Center</h2>
            {newCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                {newCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational triage queue for automated multi-signal risk alerts.
          </p>
        </div>
        <button
          onClick={loadAlerts}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'NEW', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All Alerts' : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Severity:
          </span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
            <option value="LOW">Low Only</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => onSelectTransaction(alert.transactionId)}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-md group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <SeverityBadge severity={alert.severity} />
                <AlertStatusBadge status={alert.status} />
                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  {alert.title}
                </h4>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="font-mono font-bold text-white">
                  ₹{alert.amount.toLocaleString('en-IN')}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {new Date(alert.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              {alert.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800/70 text-xs">
              <div className="flex items-center gap-4 text-slate-400">
                <span className="font-mono text-blue-400 font-semibold">
                  TX: {alert.transactionId}
                </span>
                <span className="font-mono text-slate-400">User: {alert.userId}</span>
                <span className="font-mono text-rose-400 font-bold">
                  Score: {alert.riskScore}/100
                </span>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {alert.status === 'NEW' && (
                  <button
                    onClick={(e) => handleUpdateStatus(alert.id, 'INVESTIGATING', e)}
                    className="px-2.5 py-1 rounded bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Start Investigation
                  </button>
                )}
                {alert.status !== 'RESOLVED' && (
                  <button
                    onClick={(e) => handleUpdateStatus(alert.id, 'RESOLVED', e)}
                    className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Resolve Alert
                  </button>
                )}
                {alert.status !== 'DISMISSED' && (
                  <button
                    onClick={(e) => handleUpdateStatus(alert.id, 'DISMISSED', e)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                )}
                <button
                  onClick={() => onSelectTransaction(alert.transactionId)}
                  className="p-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && !loading && (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-xl">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium text-slate-300">All alerts in this queue are resolved.</p>
            <p className="text-xs text-slate-500 mt-1">No pending high-severity signals require triage.</p>
          </div>
        )}
      </div>
    </div>
  );
};
