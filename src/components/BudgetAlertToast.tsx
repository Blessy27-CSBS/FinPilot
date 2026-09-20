import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, X, ArrowRight, ShieldAlert,
  TrendingUp, CheckCircle2, Sliders, BellRing, Sparkles, ExternalLink, Clock
} from 'lucide-react';
import { BudgetPerformance } from '../types';

interface BudgetAlertToastProps {
  budgets: BudgetPerformance[];
  onOpenEvidence: (evidenceId: string) => void;
  onNavigateToIntelligence: () => void;
  theme?: 'light' | 'dark';
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetAlertToast: React.FC<BudgetAlertToastProps> = ({
  budgets,
  onOpenEvidence,
  onNavigateToIntelligence,
  theme = 'light',
  isOpen,
  onClose
}) => {
  // Find all categories exceeding 80% of budget or projected budget
  const alertCategories = budgets.filter((b) => {
    const isSpentExceeded = b.percent_used >= 80;
    const isProjectedExceeded = b.projected_percent !== undefined && b.projected_percent >= 80;
    return isSpentExceeded || isProjectedExceeded;
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [simulationCategory, setSimulationCategory] = useState<string | null>(null);
  const [simulationPercent, setSimulationPercent] = useState<number>(85);
  const [isSimulating, setIsSimulating] = useState(false);

  // Keep selectedIndex valid if categories change
  useEffect(() => {
    if (selectedIndex >= alertCategories.length && alertCategories.length > 0) {
      setSelectedIndex(0);
    }
  }, [alertCategories.length, selectedIndex]);

  if (!isOpen) return null;

  // Determine which budget item to display
  let currentBudget: BudgetPerformance | undefined;

  if (isSimulating && simulationCategory) {
    const base = budgets.find((b) => b.category === simulationCategory) || budgets[0];
    const simSpent = Math.round((base.budget * simulationPercent) / 100);
    const simRemaining = base.budget - simSpent;
    const simProjected = Math.round(simSpent * 1.15);
    currentBudget = {
      category: base.category,
      budget: base.budget,
      spent: simSpent,
      remaining: simRemaining,
      percent_used: simulationPercent,
      projected_spent: simProjected,
      projected_percent: Math.round((simProjected / base.budget) * 100),
      status: simulationPercent > 100 ? 'over_budget' : 'within_budget'
    };
  } else if (alertCategories.length > 0) {
    currentBudget = alertCategories[selectedIndex] || alertCategories[0];
  } else {
    // If no real alerts, fallback to highest utilized category for demonstration
    const sorted = [...budgets].sort((a, b) => (b.projected_percent || b.percent_used) - (a.projected_percent || a.percent_used));
    currentBudget = sorted[0];
  }

  if (!currentBudget) return null;

  const {
    category,
    budget,
    spent,
    remaining,
    percent_used,
    projected_spent = spent,
    projected_percent = percent_used
  } = currentBudget;

  const eightyPercentWatermark = Math.round(budget * 0.8);
  const isOverEighty = percent_used >= 80 || projected_percent >= 80;
  const isOverHundred = percent_used >= 100 || projected_percent >= 100;
  const projectedOverage = Math.max(0, projected_spent - budget);

  return (
    <div
      id="budget-alert-toast-container"
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-full animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      {/* Light Theme Toast Card */}
      <div className="bg-white rounded-2xl border-2 border-amber-200/90 shadow-2xl shadow-slate-300/60 ring-1 ring-slate-900/5 p-5 text-slate-900 transition-all">
        {/* Header Ribbon */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isOverHundred
                  ? 'bg-rose-100 text-rose-600 border border-rose-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {isOverHundred ? 'Limit Exceeded' : '80% Threshold Warning'}
                </span>
                {alertCategories.length > 1 && !isSimulating && (
                  <span className="text-[11px] font-medium text-slate-500">
                    {selectedIndex + 1} of {alertCategories.length} alerts
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                {category} Budget Alert
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn-toast-toggle-simulator"
              onClick={() => setIsSimulating(!isSimulating)}
              title="Test or simulate other category thresholds"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-xs flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-toast-dismiss"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Dismiss budget warning notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multi-alert tabs if more than 1 category has exceeded 80% */}
        {alertCategories.length > 1 && !isSimulating && (
          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100 overflow-x-auto">
            <span className="text-[11px] text-slate-500 shrink-0 font-medium">Categories:</span>
            {alertCategories.map((item, idx) => (
              <button
                key={item.category}
                onClick={() => setSelectedIndex(idx)}
                className={`px-2.5 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  selectedIndex === idx
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.category} ({item.percent_used}%)
              </button>
            ))}
          </div>
        )}

        {/* Interactive Simulator Bar (if toggled) */}
        {isSimulating && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-700 font-medium">
              <span className="flex items-center gap-1 text-cyan-700">
                <Sparkles className="w-3.5 h-3.5" /> Simulation Sandbox
              </span>
              <span>{simulationPercent}% utilization</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={simulationCategory || category}
                onChange={(e) => setSimulationCategory(e.target.value)}
                className="bg-white text-slate-800 text-xs rounded border border-slate-300 px-2 py-1 flex-1"
              >
                {budgets.map((b) => (
                  <option key={b.category} value={b.category}>
                    {b.category} (Limit: ₹{b.budget.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
              <input
                type="range"
                min="50"
                max="140"
                step="5"
                value={simulationPercent}
                onChange={(e) => setSimulationPercent(parseInt(e.target.value, 10))}
                className="w-24 accent-amber-600 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Intelligence Explanation & Metrics */}
        <div className="mt-3.5 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Based on intelligence module run-rate data, you have used{' '}
            <strong className="text-slate-900 font-bold">
              ₹{spent.toLocaleString('en-IN')}
            </strong>{' '}
            of your <strong className="text-slate-900 font-bold">₹{budget.toLocaleString('en-IN')}</strong> monthly limit ({percent_used}%).{' '}
            {projected_percent >= 100 ? (
              <span className="text-rose-700 font-semibold">
                Projected to finish at ₹{projected_spent.toLocaleString('en-IN')} (+₹{projectedOverage.toLocaleString('en-IN')} over budget).
              </span>
            ) : (
              <span className="text-amber-800 font-medium">
                Pacing toward ₹{projected_spent.toLocaleString('en-IN')} ({projected_percent}% of allocated funds).
              </span>
            )}
          </p>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div>
              <p className="text-[10px] text-slate-500 font-medium">Spent</p>
              <p className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                ₹{spent.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-medium">80% Watermark</p>
              <p className="text-xs font-bold text-amber-700 font-mono mt-0.5">
                ₹{eightyPercentWatermark.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-medium">Budget</p>
              <p className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                ₹{budget.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Progress Bar with 80% Marker */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <span>Budget Velocity</span>
              <span className={isOverHundred ? 'text-rose-600 font-bold' : 'text-amber-700 font-bold'}>
                {percent_used}% utilized
              </span>
            </div>

            <div className="relative h-3 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
              {/* 80% Dotted Threshold Line */}
              <div
                style={{ left: '80%' }}
                className="absolute top-0 bottom-0 w-0.5 bg-amber-600 z-10 opacity-70"
                title="80% Safety Watermark"
              />

              {/* Progress Fill */}
              <div
                style={{ width: `${Math.min(100, percent_used)}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverHundred
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-cyan-500 to-amber-500'
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>0%</span>
              <span className="text-amber-700 font-bold font-mono">▲ 80% Alert Threshold</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            id="btn-toast-audit-trail"
            onClick={() => {
              onOpenEvidence(`ev_budget_${category.toLowerCase()}`);
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition flex items-center gap-1"
          >
            <span>Audit Trail</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-toast-snooze"
              onClick={onClose}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              <span>Dismiss</span>
            </button>
            <button
              id="btn-toast-view-intelligence"
              onClick={() => {
                onNavigateToIntelligence();
                onClose();
              }}
              className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <span>Manage Budgets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
