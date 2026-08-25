import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  AlertOctagon,
  BarChart3,
  Settings,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export type NavTab = 'overview' | 'transactions' | 'alerts' | 'analytics' | 'architecture' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, alertCount = 0 }) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions' as NavTab, label: 'Transactions', icon: ReceiptText },
    { id: 'alerts' as NavTab, label: 'Risk Alerts', icon: AlertOctagon, badge: alertCount > 0 ? alertCount : undefined },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'architecture' as NavTab, label: 'Architecture & XAI', icon: Layers },
    { id: 'settings' as NavTab, label: 'System & Diagnostics', icon: Settings },
  ];

  return (
    <aside
      id="sidebar-nav"
      className="w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen select-none"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-extrabold text-white tracking-tight">PayShield AI</h1>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              PRO
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-tight font-medium">
            Risk & Forensic Engine
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Risk Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Engine Status Footprint */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Engine Pipeline
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-[11px] text-slate-400">
            Rules + Behavioral + ML + Gemini AI
          </p>
          <div className="mt-2 text-[10px] text-blue-400/90 font-mono bg-blue-950/60 px-2 py-1 rounded border border-blue-800/40">
            ⚡ Synthetic Demo Prototype
          </div>
        </div>
      </div>
    </aside>
  );
};
