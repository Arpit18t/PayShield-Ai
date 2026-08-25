import React from 'react';
import { RiskLevel, DecisionType, AlertSeverity, AlertStatus } from '../../shared/types';
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';

export const RiskBadge: React.FC<{ level: RiskLevel | string; score?: number; className?: string }> = ({
  level,
  score,
  className = '',
}) => {
  const norm = level?.toUpperCase();
  if (norm === 'HIGH') {
    return (
      <span
        id="badge-risk-high"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 ${className}`}
      >
        <ShieldX className="w-3.5 h-3.5 text-rose-400" />
        HIGH {score !== undefined ? `(${score})` : ''}
      </span>
    );
  }
  if (norm === 'MEDIUM') {
    return (
      <span
        id="badge-risk-medium"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        MED {score !== undefined ? `(${score})` : ''}
      </span>
    );
  }
  return (
    <span
      id="badge-risk-low"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      LOW {score !== undefined ? `(${score})` : ''}
    </span>
  );
};

export const DecisionBadge: React.FC<{ decision: DecisionType | string; className?: string }> = ({
  decision,
  className = '',
}) => {
  const norm = decision?.toUpperCase();
  if (norm === 'TEMPORARY_HOLD') {
    return (
      <span
        id="badge-decision-hold"
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-700/60 ${className}`}
      >
        <XCircle className="w-3.5 h-3.5 text-rose-400" />
        TEMPORARY HOLD
      </span>
    );
  }
  if (norm === 'MANUAL_REVIEW') {
    return (
      <span
        id="badge-decision-review"
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/60 ${className}`}
      >
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        MANUAL REVIEW
      </span>
    );
  }
  if (norm === 'STEP_UP_VERIFICATION') {
    return (
      <span
        id="badge-decision-stepup"
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-700/60 ${className}`}
      >
        <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
        STEP-UP OTP / BIO
      </span>
    );
  }
  return (
    <span
      id="badge-decision-allow"
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 ${className}`}
    >
      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
      ALLOW
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: AlertSeverity | string }> = ({ severity }) => {
  const norm = severity?.toUpperCase();
  if (norm === 'CRITICAL') {
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500 text-white tracking-wide">
        CRITICAL
      </span>
    );
  }
  if (norm === 'HIGH') {
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
        HIGH
      </span>
    );
  }
  if (norm === 'MEDIUM') {
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
        MEDIUM
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      LOW
    </span>
  );
};

export const AlertStatusBadge: React.FC<{ status: AlertStatus | string }> = ({ status }) => {
  const norm = status?.toUpperCase();
  if (norm === 'NEW') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
        NEW
      </span>
    );
  }
  if (norm === 'INVESTIGATING') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40">
        <Clock className="w-3 h-3 text-amber-400" />
        INVESTIGATING
      </span>
    );
  }
  if (norm === 'RESOLVED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
        <CheckCircle className="w-3 h-3 text-emerald-400" />
        RESOLVED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/40">
      DISMISSED
    </span>
  );
};
