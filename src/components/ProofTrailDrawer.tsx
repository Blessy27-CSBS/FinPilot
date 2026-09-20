import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Calculator, Database, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { EvidenceDetail } from '../types';
import { fetchEvidence } from '../api';

interface ProofTrailDrawerProps {
  evidenceId: string | null;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const ProofTrailDrawer: React.FC<ProofTrailDrawerProps> = ({
  evidenceId,
  onClose,
  theme = 'light'
}) => {
  const [evidence, setEvidence] = useState<EvidenceDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!evidenceId) {
      setEvidence(null);
      return;
    }

    setLoading(true);
    setError(null);
    fetchEvidence(evidenceId)
      .then((data) => {
        setEvidence(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to retrieve evidence record.');
        setLoading(false);
      });
  }, [evidenceId]);

  if (!evidenceId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/45 backdrop-blur-xs flex justify-end transition-opacity">
      <div className={`w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200 border-l ${
        theme === 'light'
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Drawer Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 ${
          theme === 'light'
            ? 'bg-slate-50/95 border-slate-200'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              theme === 'light'
                ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
                : 'bg-cyan-950 border-cyan-800 text-cyan-400'
            }`}>
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  ProofTrail Evidence
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                  theme === 'light'
                    ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}>
                  {evidenceId}
                </span>
              </div>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Verifiable calculation audit & transaction lineage
              </p>
            </div>
          </div>
          <button
            id="close-evidence-drawer"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              theme === 'light'
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Verifying lineage and retrieving supporting transactions...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-semibold">Evidence Lookup Failed</p>
                <p className="text-xs text-rose-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {!loading && evidence && (
            <>
              {/* Insight Explanation */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
              }`}>
                <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>
                  Analytical Context
                </span>
                <p className="text-sm leading-relaxed font-medium">
                  {evidence.explanation}
                </p>
              </div>

              {/* Mathematical Formula */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Mathematical Formula
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Strict Python / Pandas execution
                  </span>
                </div>
                <div className={`p-3 rounded-lg border font-mono text-xs overflow-x-auto ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 text-cyan-800 shadow-xs'
                    : 'bg-slate-900 border-slate-800 text-cyan-300'
                }`}>
                  {evidence.formula || "Explicit summation across matched transactions"}
                </div>
              </div>

              {/* Supporting Aggregate Data */}
              {evidence.supporting_data && Object.keys(evidence.supporting_data).length > 0 && (
                <div className="space-y-3">
                  <h4 className={`text-xs font-semibold uppercase tracking-wider ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Computed Metrics & Aggregates
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(evidence.supporting_data).map(([key, val]) => {
                      if (typeof val === 'object' && val !== null) return null;
                      return (
                        <div key={key} className={`p-3 rounded-lg border ${
                          theme === 'light'
                            ? 'bg-white border-slate-200 text-slate-800 shadow-xs'
                            : 'bg-slate-800/40 border-slate-700/50 text-white'
                        }`}>
                          <p className={`text-xs capitalize ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{key.replace(/_/g, ' ')}</p>
                          <p className={`text-sm font-semibold mt-0.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            {typeof val === 'number' ? `₹${val.toLocaleString('en-IN')}` : String(val)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Underlying Transaction Records */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-semibold uppercase tracking-wider ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Underlying Transactions ({evidence.transactions?.length || evidence.transaction_ids?.length || 0})
                  </h4>
                  <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>Immutable ledger records</span>
                </div>

                {evidence.transactions && evidence.transactions.length > 0 ? (
                  <div className={`border rounded-xl overflow-hidden ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}>
                    <table className="w-full text-left text-xs">
                      <thead className={`uppercase text-[10px] font-semibold border-b ${
                        theme === 'light'
                          ? 'bg-slate-100/90 text-slate-600 border-slate-200'
                          : 'bg-slate-800/80 text-slate-400 border-slate-800'
                      }`}>
                        <tr>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Merchant</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${
                        theme === 'light'
                          ? 'divide-slate-200 text-slate-800'
                          : 'divide-slate-800 text-slate-300'
                      }`}>
                        {evidence.transactions.map((txn) => (
                          <tr key={txn.id} className={theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}>
                            <td className={`px-3 py-2 font-mono text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{txn.date}</td>
                            <td className={`px-3 py-2 font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{txn.merchant}</td>
                            <td className={`px-3 py-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{txn.category}</td>
                            <td className={`px-3 py-2 text-right font-mono font-medium ${
                              txn.type === 'credit'
                                ? (theme === 'light' ? 'text-emerald-600' : 'text-emerald-400')
                                : (theme === 'light' ? 'text-slate-900' : 'text-slate-200')
                            }`}>
                              {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl text-center text-xs border ${
                    theme === 'light'
                      ? 'bg-slate-50 text-slate-500 border-slate-200'
                      : 'bg-slate-800/30 text-slate-400 border-slate-800'
                  }`}>
                    No specific individual transactions linked to this aggregated snapshot.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className={`p-4 border-t text-center ${
          theme === 'light'
            ? 'bg-slate-50/95 border-slate-200 text-slate-500'
            : 'bg-slate-900/90 border-slate-800 text-slate-400'
        }`}>
          <p className="text-[11px]">
            *Every metric shown in FinPilot is derived directly from deterministic local calculations. AI never invents numbers.*
          </p>
        </div>
      </div>
    </div>
  );
};
