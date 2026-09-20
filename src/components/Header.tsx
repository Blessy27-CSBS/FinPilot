import React from 'react';
import {
  Compass, Upload, RotateCcw, ShieldCheck,
  Layers, Radar, Sparkles, Target, Receipt, CreditCard, Bot,
  Sun, Moon, AlertTriangle, Bell
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenUpload: () => void;
  onReloadDemo: () => void;
  pendingReviewCount: number;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  budgetAlertCount?: number;
  onOpenBudgetToast?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenUpload,
  onReloadDemo,
  pendingReviewCount,
  selectedMonth,
  onSelectMonth,
  theme = 'light',
  onToggleTheme,
  budgetAlertCount = 0,
  onOpenBudgetToast
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'commit_stack', label: 'CommitStack', icon: Layers },
    { id: 'cash_radar', label: 'CashRadar', icon: Radar },
    { id: 'why_lens', label: 'WhyLens', icon: Sparkles },
    { id: 'goal_shift', label: 'GoalShift', icon: Target },
    { id: 'transactions', label: 'Transactions', icon: Receipt, badge: pendingReviewCount },
    { id: 'intelligence', label: 'Intelligence', icon: CreditCard, alertBadge: budgetAlertCount > 0 },
    { id: 'ai_assistant', label: 'AI Co-Pilot', icon: Bot, isSpecial: true }
  ];

  return (
    <header className={`sticky top-0 z-30 transition-colors ${
      theme === 'light'
        ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs'
        : 'bg-slate-900 border-b border-slate-800'
    }`}>
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-900/30">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>FinPilot</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                theme === 'light'
                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
              }`}>
                Decision Support Agent
              </span>
            </div>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Verifiable foresight & decision engine</p>
          </div>
        </div>

        {/* Global Disclaimer & Privacy Tag */}
        <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-lg text-xs ${
          theme === 'light'
            ? 'bg-slate-100/80 border border-slate-200 text-slate-700'
            : 'bg-slate-800/80 border border-slate-700/60 text-slate-300'
        }`}>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Insights only, not financial advice. Bank-grade local sanitization.</span>
        </div>

        {/* Actions & Month Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            id="period-select"
            value={selectedMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
            className={`text-xs sm:text-sm rounded-lg px-3 py-1.5 border focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200/60 text-slate-800 border-slate-200'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="2026-09">September 2026 (Current)</option>
            <option value="2026-08">August 2026</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-06">June 2026</option>
            <option value="2026-05">May 2026</option>
            <option value="2026-04">April 2026</option>
          </select>

          <button
            id="btn-upload-statement"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-medium transition shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>

          {budgetAlertCount > 0 && onOpenBudgetToast && (
            <button
              id="btn-header-budget-alert"
              onClick={onOpenBudgetToast}
              title={`${budgetAlertCount} category budget alert(s) exceeded 80%`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition border ${
                theme === 'light'
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">{budgetAlertCount} Budget Alert{budgetAlertCount > 1 ? 's' : ''}</span>
              <span className="sm:hidden font-mono">{budgetAlertCount}</span>
            </button>
          )}

          {onToggleTheme && (
            <button
              id="btn-toggle-theme"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm border transition ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {theme === 'light' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="hidden md:inline font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-cyan-400" />
                  <span className="hidden md:inline font-medium">Dark</span>
                </>
              )}
            </button>
          )}

          <button
            id="btn-reload-demo"
            onClick={onReloadDemo}
            title="Reload 6-month synthetic test data"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm border transition ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden lg:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t ${
        theme === 'light' ? 'border-slate-200/80' : 'border-slate-800/80'
      }`}>
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? tab.isSpecial
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                      : (theme === 'light'
                          ? 'bg-cyan-50 text-cyan-800 font-semibold shadow-xs border border-cyan-200'
                          : 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/80')
                    : (theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50')
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (tab.isSpecial ? 'text-white' : 'text-cyan-400') : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
