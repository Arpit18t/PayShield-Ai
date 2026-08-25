import React, { useState } from 'react';
import { Search, Bell, ShieldCheck, UserCheck, Sparkles, Activity } from 'lucide-react';

interface HeaderProps {
  onSearchSelect?: (txId: string) => void;
  alertCount?: number;
  onOpenAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchSelect,
  alertCount = 0,
  onOpenAlerts,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearchSelect) {
      onSearchSelect(query.trim().toUpperCase());
      setQuery('');
    }
  };

  return (
    <header
      id="top-header-bar"
      className="h-16 bg-slate-950/80 backdrop-blur border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30"
    >
      {/* Global Quick Search */}
      <form onSubmit={handleSubmit} className="relative w-72 md:w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="global-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Quick jump: TXN ID (e.g. TXN10082) or User..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* System Health / AI Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-slate-300 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Gemini 3.7 & XAI Online
          </span>
        </div>

        {/* Alerts Bell */}
        <button
          id="btn-header-alerts"
          onClick={onOpenAlerts}
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          title="View Risk Alerts"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse"></span>
          )}
        </button>

        {/* Analyst Profile Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
            RA
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-white flex items-center gap-1">
              <span>PayShield Risk Analyst</span>
              <UserCheck className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-[10px] text-slate-400">Risk Operations & Triage</div>
          </div>
        </div>
      </div>
    </header>
  );
};
