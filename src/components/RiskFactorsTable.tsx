import React from 'react';
import { RuleEvaluationResult } from '../../shared/types';
import { SeverityBadge } from './StatusBadge';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface RiskFactorsTableProps {
  rules: RuleEvaluationResult[];
  showOnlyTriggered?: boolean;
}

export const RiskFactorsTable: React.FC<RiskFactorsTableProps> = ({
  rules,
  showOnlyTriggered = false,
}) => {
  const displayRules = showOnlyTriggered ? rules.filter((r) => r.triggered) : rules;

  if (displayRules.length === 0) {
    return (
      <div id="risk-factors-empty" className="p-6 text-center bg-slate-900/50 border border-slate-800 rounded-xl">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
        <p className="text-sm font-medium text-slate-300">No anomaly rules were triggered for this transaction.</p>
        <p className="text-xs text-slate-500 mt-1">All deterministic baseline checks conformed with standard parameters.</p>
      </div>
    );
  }

  return (
    <div id="risk-factors-table-card" className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Why was this transaction flagged?</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500/20 text-rose-300 font-mono">
              {rules.filter((r) => r.triggered).length} Triggered
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic risk rule outputs evaluated against user historical baselines.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Status & Rule Name</th>
              <th className="py-3 px-4">Observed Value</th>
              <th className="py-3 px-4">Historical Baseline</th>
              <th className="py-3 px-4 text-center">Severity</th>
              <th className="py-3 px-4 text-right">Contribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {displayRules.map((rule) => {
              return (
                <tr
                  key={rule.ruleId}
                  className={`transition-colors ${
                    rule.triggered
                      ? 'bg-rose-950/15 hover:bg-rose-950/25 text-slate-200'
                      : 'hover:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-start gap-2">
                      {rule.triggered ? (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className={`font-semibold ${rule.triggered ? 'text-white' : 'text-slate-400'}`}>
                          {rule.ruleName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-normal">
                          {rule.explanation}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-200">
                    {rule.observedValue}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">
                    {rule.expectedBaseline}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <SeverityBadge severity={rule.severity} />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    {rule.triggered ? (
                      <span className="text-rose-400">+{rule.scoreContribution}</span>
                    ) : (
                      <span className="text-slate-600">0</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
