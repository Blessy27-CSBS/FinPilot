import React from 'react';
import {
  TrendingUp, TrendingDown, Layers, ShieldCheck, AlertTriangle,
  ArrowRight, Calendar, Sparkles, Activity, FileCheck, CheckCircle2
} from 'lucide-react';
import { DashboardData } from '../types';

interface OverviewTabProps {
  data: DashboardData;
  onOpenEvidence: (evidenceId: string) => void;
  onNavigateTab: (tabId: string) => void;
  theme?: 'light' | 'dark';
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  data,
  onOpenEvidence,
  onNavigateTab,
  theme = 'light'
}) => {
  const health = data.money_health_score;

  return (
    <div className="space-y-6">
      {/* Top Banner Disclaimer */}
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs ${
        theme === 'light'
          ? 'bg-cyan-50/70 border-cyan-200/80 text-cyan-950'
          : 'bg-slate-800/60 border border-slate-700/60 text-slate-300'
      }`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
          <span>
            <strong>Decision Support Architecture:</strong> All metrics are calculated deterministically from your statements. AI acts solely as an explanatory co-pilot.
          </span>
        </div>
        <span className={`hidden sm:inline font-mono text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-500'}`}>Audit Lineage Ready</span>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className={`flex items-center justify-between text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            <span>Monthly Income</span>
            <span className={`p-1 rounded ${theme === 'light' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'}`}>
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            ₹{data.total_income.toLocaleString('en-IN')}
          </p>
          <p className={`text-[11px] mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Excludes internal transfers & repayments</p>
        </div>

        {/* Total Spending */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className={`flex items-center justify-between text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            <span>Total Spending</span>
            <span className={`p-1 rounded ${theme === 'light' ? 'bg-rose-100 text-rose-700' : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'}`}>
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            ₹{data.total_spending.toLocaleString('en-IN')}
          </p>
          <div className={`flex items-center justify-between text-[11px] mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            <span>Savings Rate:</span>
            <span className="font-semibold text-emerald-500">{data.savings_rate}%</span>
          </div>
        </div>

        {/* Committed Money */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className={`flex items-center justify-between text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            <span>Committed Money</span>
            <span className={`p-1 rounded ${theme === 'light' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/60'}`}>
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className={`text-2xl font-bold mt-2 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-300'}`}>
            ₹{data.committed_amount.toLocaleString('en-IN')}
          </p>
          <p className={`text-[11px] mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            {data.commit_stack.committed_percentage}% of total monthly income
          </p>
        </div>

        {/* Truly Free Money */}
        <div className={`p-4 rounded-xl border shadow-sm relative overflow-hidden ${
          theme === 'light'
            ? 'bg-gradient-to-br from-cyan-50/90 via-white to-blue-50/70 border-cyan-200'
            : 'bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border-cyan-900/50'
        }`}>
          <div className={`flex items-center justify-between text-xs ${theme === 'light' ? 'text-cyan-800 font-semibold' : 'text-cyan-300'}`}>
            <span>Truly Free Money</span>
            <span className={`p-1 rounded ${theme === 'light' ? 'bg-cyan-100 text-cyan-700 border border-cyan-200' : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'}`}>
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className={`text-2xl font-bold mt-2 ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>
            ₹{data.free_money.toLocaleString('en-IN')}
          </p>
          <p className={`text-[11px] mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            After commitments, goals & typical spend
          </p>
        </div>
      </div>

      {/* Health Score & AI Insight Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Money Health Score Panel */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Money Health Index</span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {health.grade}
              </span>
            </div>

            {/* Score Radial / Visual */}
            <div className="mt-4 flex items-center gap-4">
              <div className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center shadow-inner ${
                theme === 'light'
                  ? 'bg-cyan-50 border-cyan-500'
                  : 'bg-slate-800 border-cyan-500/80'
              }`}>
                <span className={`text-2xl font-bold ${theme === 'light' ? 'text-cyan-950' : 'text-white'}`}>{health.total_score}</span>
                <span className={`text-[10px] absolute bottom-2 ${theme === 'light' ? 'text-cyan-800 font-semibold' : 'text-slate-400'}`}>/100</span>
              </div>
              <div className="flex-1">
                <p className={`text-xs leading-relaxed font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  {health.summary_text}
                </p>
              </div>
            </div>

            {/* Transparent Factor Breakdown */}
            <div className="mt-5 space-y-2">
              {health.breakdown.map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-300 font-medium">
                    <span>{item.factor}</span>
                    <span className="text-cyan-400 font-mono">{item.points} / {item.max} pts</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Rule-based index</span>
            <span>No black-box math</span>
          </div>
        </div>

        {/* AI Foresight Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Foresight & Decision Cards</span>
            </h3>
            <span className="text-xs text-slate-400">Backed by ProofTrail</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.ai_insights.map((ins) => (
              <div
                key={ins.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-cyan-400">{ins.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-400">
                      {ins.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {ins.summary}
                  </p>
                </div>

                {ins.evidence_id && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">ProofTrail Audit</span>
                    <button
                      onClick={() => onOpenEvidence(ins.evidence_id!)}
                      className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
                    >
                      <span>Show Evidence</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick CommitStack & CashRadar Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CommitStack Teaser */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">CommitStack Allocation</span>
                <button
                  onClick={() => onNavigateTab('commit_stack')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>Explore Stack</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Proportional Stack Bar */}
              <div className={`h-3 w-full rounded-full overflow-hidden flex ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`}>
                <div
                  style={{ width: `${Math.min(100, data.commit_stack.committed_percentage)}%` }}
                  className="bg-indigo-500 h-full"
                  title="Committed Expenses"
                />
                <div
                  style={{ width: `${Math.min(100, (data.commit_stack.goal_contributions / data.commit_stack.monthly_income) * 100 || 12)}%` }}
                  className="bg-emerald-500 h-full"
                  title="Goal Contributions"
                />
                <div
                  style={{ width: `${Math.min(100, data.commit_stack.free_money_percentage)}%` }}
                  className="bg-cyan-400 h-full"
                  title="Truly Free Money"
                />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1 text-[11px] text-slate-400">
                <div>
                  <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-1" />
                  <span>Committed: ₹{data.commit_stack.committed_amount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                  <span>Goals: ₹{data.commit_stack.goal_contributions.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-1" />
                  <span>Free: ₹{data.commit_stack.free_money.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* CashRadar Teaser */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">CashRadar 30-Day Outlook</span>
                <button
                  onClick={() => onNavigateTab('cash_radar')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>Forecast Radar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Safety Line:</span>
                <span className="font-mono text-slate-200">₹{data.cash_radar_summary.safety_line.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-400">Lowest Projected:</span>
                <span className="font-mono font-medium text-cyan-400">
                  ₹{data.cash_radar_summary.lowest_projected_balance.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="mt-2 p-2 rounded bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400">
                {data.cash_radar_summary.explanation}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Spending & Upcoming Obligations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Categories */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Top Spending Categories</h3>
            <button
              onClick={() => onNavigateTab('why_lens')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>WhyLens Analysis</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {data.top_categories.slice(0, 5).map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{cat.category}</span>
                  <span className="font-mono text-slate-200">
                    ₹{cat.amount.toLocaleString('en-IN')} ({cat.percentage}%)
                  </span>
                </div>
                <div className={`h-2 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    className="h-full bg-cyan-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Obligations & Due Bills */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Upcoming Obligations</h3>
            <button
              onClick={() => onNavigateTab('intelligence')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {data.upcoming_obligations.slice(0, 4).map((ob) => (
              <div key={ob.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-200">{ob.name}</p>
                    <p className="text-[11px] text-slate-400">Due on {ob.due_date}</p>
                  </div>
                </div>
                <span className="font-mono font-semibold text-white">
                  ₹{ob.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
