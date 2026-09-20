import React from 'react';
import { Layers, ShieldCheck, ArrowRight, CheckCircle2, PieChart, Info } from 'lucide-react';
import { CommitStackResult } from '../types';

interface CommitStackTabProps {
  data: CommitStackResult;
  onOpenEvidence: (evidenceId: string) => void;
  theme?: 'light' | 'dark';
}

export const CommitStackTab: React.FC<CommitStackTabProps> = ({ data, onOpenEvidence, theme = 'light' }) => {
  const allocated = data.committed_amount + data.goal_contributions + data.typical_variable;
  const freePct = data.monthly_income > 0 ? (data.free_money / data.monthly_income) * 100 : 0;
  const committedPct = data.monthly_income > 0 ? (data.committed_amount / data.monthly_income) * 100 : 0;
  const goalsPct = data.monthly_income > 0 ? (data.goal_contributions / data.monthly_income) * 100 : 0;
  const variablePct = data.monthly_income > 0 ? (data.typical_variable / data.monthly_income) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Title & Concept Explanation */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              theme === 'light'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-indigo-950 border-indigo-800 text-indigo-400'
            }`}>
              <Layers className="w-4 h-4" />
            </div>
            <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              CommitStack: True Income Allocation
            </h2>
          </div>
          <p className={`text-xs sm:text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Unravels committed monthly lock-ins vs. goal targets vs. discretionary free cash.
          </p>
        </div>

        {data.evidence_id && (
          <button
            onClick={() => onOpenEvidence(data.evidence_id!)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition shrink-0 ${
              theme === 'light'
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-cyan-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-cyan-400'
            }`}
          >
            <span>Show ProofTrail Evidence</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Visual Proportional Stack Banner */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold uppercase tracking-wider ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
            Income Allocation Composition
          </span>
          <span className={`font-mono ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Total Monthly Income: ₹{data.monthly_income.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Large Segmented Bar */}
        <div className={`h-6 w-full rounded-xl overflow-hidden flex shadow-inner ${
          theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'
        }`}>
          <div
            style={{ width: `${committedPct}%` }}
            className="bg-indigo-600 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
            title={`Committed: ₹${data.committed_amount.toLocaleString('en-IN')}`}
          >
            {committedPct > 12 && `${committedPct.toFixed(0)}% Committed`}
          </div>
          <div
            style={{ width: `${goalsPct}%` }}
            className="bg-emerald-600 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
            title={`Goals: ₹${data.goal_contributions.toLocaleString('en-IN')}`}
          >
            {goalsPct > 8 && `${goalsPct.toFixed(0)}% Goals`}
          </div>
          <div
            style={{ width: `${variablePct}%` }}
            className="bg-amber-600 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
            title={`Variable: ₹${data.typical_variable.toLocaleString('en-IN')}`}
          >
            {variablePct > 10 && `${variablePct.toFixed(0)}% Variable`}
          </div>
          <div
            style={{ width: `${freePct}%` }}
            className="bg-cyan-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950 transition-all duration-500"
            title={`Free Money: ₹${data.free_money.toLocaleString('en-IN')}`}
          >
            {freePct > 8 && `${freePct.toFixed(0)}% Truly Free`}
          </div>
        </div>

        {/* 4 Cards for Allocation Elements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* 1. Committed */}
          <div className={`p-4 rounded-xl border space-y-1 ${
            theme === 'light' ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-800/50 border-slate-700/60'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-indigo-500">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Committed Money
              </span>
              <span className={`font-mono ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                {committedPct.toFixed(1)}%
              </span>
            </div>
            <p className={`text-xl font-bold pt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              ₹{data.committed_amount.toLocaleString('en-IN')}
            </p>
            <p className={`text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Rent, EMI, Utilities, Subscriptions, Insurance
            </p>
          </div>

          {/* 2. Goals */}
          <div className={`p-4 rounded-xl border space-y-1 ${
            theme === 'light' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-800/50 border-slate-700/60'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Goal Contributions
              </span>
              <span className={`font-mono ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                {goalsPct.toFixed(1)}%
              </span>
            </div>
            <p className={`text-xl font-bold pt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              ₹{data.goal_contributions.toLocaleString('en-IN')}
            </p>
            <p className={`text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Targeted monthly contributions to active goals
            </p>
          </div>

          {/* 3. Typical Variable */}
          <div className={`p-4 rounded-xl border space-y-1 ${
            theme === 'light' ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-800/50 border-slate-700/60'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-amber-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Typical Variable
              </span>
              <span className={`font-mono ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                {variablePct.toFixed(1)}%
              </span>
            </div>
            <p className={`text-xl font-bold pt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              ₹{data.typical_variable.toLocaleString('en-IN')}
            </p>
            <p className={`text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Food, groceries, transit, discretionary spends
            </p>
          </div>

          {/* 4. Truly Free Money */}
          <div className={`p-4 rounded-xl border space-y-1 ${
            theme === 'light' ? 'bg-cyan-50/70 border-cyan-200' : 'bg-cyan-950/30 border-cyan-800/60'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-cyan-700">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                Truly Free Money
              </span>
              <span className="font-mono text-cyan-700 font-bold">{freePct.toFixed(1)}%</span>
            </div>
            <p className="text-xl font-bold text-cyan-700 pt-1">
              ₹{data.free_money.toLocaleString('en-IN')}
            </p>
            <p className={`text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Unencumbered cash available for savings or leisure
            </p>
          </div>
        </div>
      </div>

      {/* Formula & Calculation Box */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
      }`}>
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-cyan-600 uppercase tracking-wider">Governing Mathematical Law</span>
          <p className={`font-mono text-xs ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
            Truly Free Money = Monthly Income (₹{data.monthly_income.toLocaleString('en-IN')}) − [ Committed (₹{data.committed_amount.toLocaleString('en-IN')}) + Goals (₹{data.goal_contributions.toLocaleString('en-IN')}) + Variable (₹{data.typical_variable.toLocaleString('en-IN')}) ] = ₹{data.free_money.toLocaleString('en-IN')}
          </p>
        </div>
        <span className={`text-[11px] px-2.5 py-1 rounded border shrink-0 font-medium ${
          theme === 'light'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-slate-900 border-slate-800 text-emerald-400'
        }`}>
          Deterministic Rule
        </span>
      </div>

      {/* Breakdown Table of Committed Items */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              Committed Stack Items
            </h3>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              All recurring subscriptions, rents, utilities, and fixed commitments
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-500 font-semibold">
            {data.committed_items.length} Tracked Commitments
          </span>
        </div>

        <div className={`border rounded-xl overflow-hidden ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
          <table className="w-full text-left text-xs">
            <thead className={`uppercase text-[10px] font-semibold border-b ${
              theme === 'light' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-800/70 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="px-4 py-3">Commitment Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Share of Income</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              theme === 'light' ? 'divide-slate-200 text-slate-700' : 'divide-slate-800 text-slate-300'
            }`}>
              {data.committed_items.map((item, idx) => {
                const share = data.monthly_income > 0 ? (item.amount / data.monthly_income) * 100 : 0;
                return (
                  <tr key={idx} className={`transition ${theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                    <td className={`px-4 py-3 font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{item.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        theme === 'light'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {share.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
