import React, { useState } from 'react';
import {
  CreditCard, AlertTriangle, ShieldCheck, Repeat, Calendar,
  TrendingUp, TrendingDown, Bell, CheckCircle2, DollarSign
} from 'lucide-react';
import { Subscription, RecurringPayment, Anomaly, BudgetPerformance } from '../types';

interface IntelligenceTabProps {
  subscriptions: Subscription[];
  anomalies: Anomaly[];
  budgets: BudgetPerformance[];
  onOpenEvidence: (evidenceId: string) => void;
  onTriggerBudgetAlert?: (category: string) => void;
  defaultSection?: 'subs' | 'anomalies' | 'budgets';
  theme?: 'light' | 'dark';
}

export const IntelligenceTab: React.FC<IntelligenceTabProps> = ({
  subscriptions,
  anomalies,
  budgets,
  onOpenEvidence,
  onTriggerBudgetAlert,
  defaultSection = 'subs',
  theme = 'light'
}) => {
  const [activeSection, setActiveSection] = useState<'subs' | 'anomalies' | 'budgets'>(defaultSection);

  const totalAnnualizedSubs = subscriptions.reduce((sum, s) => sum + s.annualized_cost, 0);

  return (
    <div className="space-y-6">
      {/* Title & Section Toggles */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              theme === 'light'
                ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
                : 'bg-cyan-950 border-cyan-800 text-cyan-400'
            }`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Financial Intelligence & Vigilance
            </h2>
          </div>
          <p className={`text-xs sm:text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Subscription price creep, recurring commitments, budget adherence, and spending anomalies.
          </p>
        </div>

        <div className={`flex items-center gap-1.5 p-1.5 rounded-xl border text-xs ${
          theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            onClick={() => setActiveSection('subs')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeSection === 'subs'
                ? 'bg-cyan-600 text-white shadow-xs'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Subscriptions ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveSection('anomalies')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeSection === 'anomalies'
                ? 'bg-amber-600 text-white shadow-xs'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Anomalies ({anomalies.length})
          </button>
          <button
            onClick={() => setActiveSection('budgets')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeSection === 'budgets'
                ? 'bg-indigo-600 text-white shadow-xs'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Budgets ({budgets.length})
          </button>
        </div>
      </div>

      {/* 1. Subscriptions Section */}
      {activeSection === 'subs' && (
        <div className="space-y-6">
          {/* Summary Stat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
            }`}>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Active Subscriptions</p>
              <p className={`text-2xl font-bold mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{subscriptions.length}</p>
              <p className={`text-[11px] mt-0.5 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Tracked recurring services</p>
            </div>
            <div className={`p-4 rounded-xl border ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
            }`}>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Annualized Cost</p>
              <p className={`text-2xl font-bold mt-1 ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`}>
                ₹{totalAnnualizedSubs.toLocaleString('en-IN')}
              </p>
              <p className={`text-[11px] mt-0.5 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                Approx. ₹{(totalAnnualizedSubs / 12).toFixed(0)}/mo
              </p>
            </div>
            <div className={`p-4 rounded-xl border ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
            }`}>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Price Creep Detection</p>
              <p className={`text-2xl font-bold mt-1 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                {subscriptions.filter((s) => s.price_creep > 0).length} Service(s)
              </p>
              <p className={`text-[11px] mt-0.5 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Increased rates compared with past cycles</p>
            </div>
          </div>

          {/* Subscriptions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition space-y-4 ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-base ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{sub.service}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold ${
                      theme === 'light' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {sub.frequency}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      ₹{sub.current_price.toLocaleString('en-IN')}
                      <span className={`text-xs font-normal ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}> / {sub.frequency}</span>
                    </p>
                    <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      Annual commitment: ₹{sub.annualized_cost.toLocaleString('en-IN')}/yr
                    </p>
                  </div>

                  {/* Price creep alert */}
                  {sub.price_creep > 0 && (
                    <div className={`mt-3 p-2 rounded-lg text-xs flex items-center gap-1.5 border ${
                      theme === 'light'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                    }`}>
                      <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                      <span>Price increased by ₹{sub.price_creep} from ₹{sub.previous_price}</span>
                    </div>
                  )}

                  {/* Overlap alert */}
                  {sub.potential_overlap && (
                    <div className={`mt-2 p-2 rounded-lg text-xs border ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                    }`}>
                      <span className={`font-medium ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>Service Overlap:</span> {sub.potential_overlap}
                    </div>
                  )}
                </div>

                <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                  theme === 'light' ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'
                }`}>
                  <span>Next Renewal:</span>
                  <span className={`font-mono font-medium ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{sub.next_renewal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Anomalies Section */}
      {activeSection === 'anomalies' && (
        <div className="space-y-6">
          {/* Calming Guiding Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            theme === 'light' ? 'bg-cyan-50/70 border-cyan-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`} />
            <div className="text-xs space-y-1">
              <p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Baseline Variance & Anomaly Detection Policy</p>
              <p className={`leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Anomalies represent transactions or spending surges that are <em>unusual compared with your historical spending</em>.
                FinPilot uses robust median absolute deviation (MAD) and Isolation Forest models. An anomaly is strictly informative and is never labeled as fraud.
              </p>
            </div>
          </div>

          {/* Anomalies List */}
          <div className="space-y-3">
            {anomalies.length === 0 ? (
              <div className={`p-8 rounded-2xl border text-center text-sm ${
                theme === 'light' ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                No spending anomalies or duplicate charges detected. All charges conform to your historical baselines.
              </div>
            ) : (
              anomalies.map((anom) => (
                <div
                  key={anom.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      anom.severity === 'high'
                        ? theme === 'light' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                        : anom.severity === 'info'
                        ? theme === 'light' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : theme === 'light' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{anom.merchant}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                          theme === 'light' ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {anom.category}
                        </span>
                        <span className={`text-[11px] font-mono ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{anom.date}</span>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                        {anom.explanation}
                      </p>
                    </div>
                  </div>

                  <div className={`flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 ${
                    theme === 'light' ? 'border-slate-100' : 'border-slate-800'
                  }`}>
                    <span className={`text-sm font-bold font-mono ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      ₹{anom.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => onOpenEvidence(`ev_anom_${anom.transaction_id}`)}
                      className={`text-xs font-semibold ${theme === 'light' ? 'text-cyan-700 hover:text-cyan-800' : 'text-cyan-400 hover:text-cyan-300'}`}
                    >
                      Audit Trail
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. Budgets Section */}
      {activeSection === 'budgets' && (
        <div className="space-y-4">
          <div className={`p-6 rounded-2xl border space-y-4 ${
            theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className={`text-base font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Monthly Category Target Limits & Pacing
                </h3>
                <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Monitors spending run-rates against monthly caps. Alerts trigger at the 80% watermark.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`flex items-center gap-1 font-medium ${theme === 'light' ? 'text-amber-700' : 'text-amber-500'}`}>
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> ≥80% Alert Zone
                </span>
                <span className={`flex items-center gap-1 font-medium ${theme === 'light' ? 'text-rose-700' : 'text-rose-500'}`}>
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;100% Exceeded
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((b) => {
                const isOver80 = b.percent_used >= 80 || (b.projected_percent !== undefined && b.projected_percent >= 80);
                const isOver100 = b.percent_used >= 100 || (b.projected_percent !== undefined && b.projected_percent >= 100);

                return (
                  <div
                    key={b.category}
                    className={`p-4 rounded-xl border transition space-y-3 ${
                      theme === 'light'
                        ? isOver100
                          ? 'border-rose-300 bg-rose-50/60'
                          : isOver80
                          ? 'border-amber-300 bg-amber-50/60'
                          : 'border-slate-200 bg-slate-50/50'
                        : isOver100
                        ? 'border-rose-500/60 bg-rose-950/10'
                        : isOver80
                        ? 'border-amber-500/60 bg-amber-950/10'
                        : 'border-slate-700/60 bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{b.category}</span>
                        {isOver80 && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isOver100
                                ? theme === 'light' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : theme === 'light' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {isOver100 ? 'Exceeded' : '≥80% Alert'}
                          </span>
                        )}
                      </div>
                      <span className={`font-mono font-bold ${
                        isOver100
                          ? theme === 'light' ? 'text-rose-700' : 'text-rose-400'
                          : isOver80
                          ? theme === 'light' ? 'text-amber-700' : 'text-amber-400'
                          : theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                      }`}>
                        ₹{b.spent.toLocaleString('en-IN')} / ₹{b.budget.toLocaleString('en-IN')} ({b.percent_used}%)
                      </span>
                    </div>

                    {/* Progress Bar with 80% Watermark */}
                    <div className="space-y-1">
                      <div className={`relative h-2.5 w-full rounded-full overflow-hidden ${
                        theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'
                      }`}>
                        {/* 80% mark */}
                        <div
                          style={{ left: '80%' }}
                          className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10"
                        />
                        <div
                          style={{ width: `${Math.min(100, b.percent_used)}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOver100
                              ? 'bg-rose-500'
                              : isOver80
                              ? 'bg-amber-500'
                              : 'bg-cyan-500'
                          }`}
                        />
                      </div>
                      <div className={`flex justify-between text-[10px] font-mono ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-500'
                      }`}>
                        <span>0%</span>
                        <span className={`${theme === 'light' ? 'text-amber-700 font-semibold' : 'text-amber-400/90 font-semibold'}`}>80% Watermark</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Projected Spend & Status */}
                    <div className={`flex items-center justify-between text-[11px] pt-1 border-t ${
                      theme === 'light' ? 'border-slate-200 text-slate-600' : 'border-slate-700/50 text-slate-400'
                    }`}>
                      <div>
                        <span>Projected: </span>
                        <strong className={`font-mono ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>
                          ₹{(b.projected_spent || b.spent).toLocaleString('en-IN')}
                        </strong>
                        <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}> ({b.projected_percent || b.percent_used}%)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onTriggerBudgetAlert && (
                          <button
                            onClick={() => onTriggerBudgetAlert(b.category)}
                            className={`text-xs font-semibold underline underline-offset-2 transition ${
                              theme === 'light' ? 'text-amber-700 hover:text-amber-800' : 'text-amber-400 hover:text-amber-300'
                            }`}
                          >
                            Toast Warning
                          </button>
                        )}
                        <button
                          onClick={() => onOpenEvidence(`ev_budget_${b.category.toLowerCase()}`)}
                          className={`text-xs font-semibold transition ${
                            theme === 'light' ? 'text-cyan-700 hover:text-cyan-800' : 'text-cyan-400 hover:text-cyan-300'
                          }`}
                        >
                          Audit Lineage
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
