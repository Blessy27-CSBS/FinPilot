import React, { useState, useEffect } from 'react';
import {
  Sparkles, ArrowRight, TrendingUp, TrendingDown,
  Layers, ShoppingBag, Store, AlertCircle, CheckCircle2
} from 'lucide-react';
import { WhyLensResult } from '../types';
import { fetchWhyLens } from '../api';

interface WhyLensTabProps {
  onOpenEvidence: (evidenceId: string) => void;
  theme?: 'light' | 'dark';
}

export const WhyLensTab: React.FC<WhyLensTabProps> = ({
  onOpenEvidence,
  theme = 'light'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Food');
  const [data, setData] = useState<WhyLensResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['Food', 'Groceries', 'Transportation', 'Shopping', 'Utilities', 'Entertainment'];

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchWhyLens(selectedCategory)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Error analyzing category shift');
        setLoading(false);
      });
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Title & Category Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              theme === 'light'
                ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
                : 'bg-cyan-950 border-cyan-800 text-cyan-400'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">WhyLens: Spending Change Decomposition</h2>
          </div>
          <p className={`text-xs sm:text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Deconstructs exactly WHY spending shifted across price effect, frequency effect, and new merchants.
          </p>
        </div>

        {/* Category Selector Pills */}
        <div className={`flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border ${
          theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Decomposing {selectedCategory} variance across historical months...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Main Variance Overview Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Comparative Window: {data.previous_period} vs {data.current_period}
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {data.category} Spending Shift: {data.total_change >= 0 ? '+' : ''}₹{data.total_change.toLocaleString('en-IN')}
                  <span className={`text-base font-semibold ml-2 ${data.total_change >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ({data.percent_change >= 0 ? '+' : ''}{data.percent_change}%)
                  </span>
                </h3>
              </div>

              {data.evidence_id && (
                <button
                  onClick={() => onOpenEvidence(data.evidence_id!)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-cyan-400 transition shrink-0"
                >
                  <span>Show ProofTrail Evidence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Narrative Explanation */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 leading-relaxed font-medium">
              {data.explanation}
            </div>

            {/* Decomposed Contribution Factors (Waterfall / Cards) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Decomposition Factors (Python / Pandas Calibrated)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.contributions.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">{c.label}</span>
                      <span className="text-xs font-mono font-bold text-cyan-400">{c.percentage_contribution}%</span>
                    </div>
                    <p className={`text-xl font-bold font-mono ${c.amount >= 0 ? 'text-white' : 'text-emerald-400'}`}>
                      {c.amount >= 0 ? '+' : ''}₹{c.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-normal">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New Merchants & Outliers Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* First-time / New Merchants */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-semibold text-white">First-Time Merchants</h4>
                </div>
                <span className="text-xs text-slate-400">{data.new_merchants.length} detected</span>
              </div>

              {data.new_merchants.length > 0 ? (
                <div className="divide-y divide-slate-800">
                  {data.new_merchants.map((m, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-slate-200">{m.merchant}</p>
                        <p className="text-[11px] text-slate-500">{m.count} visit(s) this month</p>
                      </div>
                      <span className="font-mono font-semibold text-slate-100">
                        ₹{m.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No first-time merchants in {data.category} this period.
                </p>
              )}
            </div>

            {/* Outliers / One-off High Spends */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-semibold text-white">One-off / Outlier Spends</h4>
                </div>
                <span className="text-xs text-slate-400">{data.outliers.length} detected</span>
              </div>

              {data.outliers.length > 0 ? (
                <div className="divide-y divide-slate-800">
                  {data.outliers.map((o) => (
                    <div key={o.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-slate-200">{o.merchant}</p>
                        <p className="text-[11px] text-slate-500">{o.date}</p>
                      </div>
                      <span className="font-mono font-semibold text-amber-400">
                        ₹{o.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  All transactions remained within standard baseline variance.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
