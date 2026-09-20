import React, { useState, useEffect } from 'react';
import {
  Search, Filter, CheckCircle2, AlertCircle, RefreshCw,
  Layers, ArrowUpDown, ChevronLeft, ChevronRight, Edit3, X
} from 'lucide-react';
import { Transaction } from '../types';
import { fetchTransactions, updateTransactionCategory } from '../api';

interface TransactionsTabProps {
  onRefreshData: () => void;
  theme?: 'light' | 'dark';
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ onRefreshData, theme = 'light' }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [txnType, setTxnType] = useState('');
  const [viewQueueOnly, setViewQueueOnly] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Correction Modal
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [rememberMerchant, setRememberMerchant] = useState(true);
  const [updating, setUpdating] = useState(false);

  const categories = [
    'All', 'Income', 'Rent', 'Groceries', 'Food', 'Transportation',
    'Utilities', 'Shopping', 'Subscription', 'Healthcare', 'Entertainment',
    'Credit Card Payment', 'Transfer', 'Investment', 'Miscellaneous'
  ];

  const loadData = () => {
    setLoading(true);
    fetchTransactions({
      search,
      category: category !== 'All' ? category : undefined,
      txn_type: txnType || undefined,
      needs_review: viewQueueOnly ? true : undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      limit: 25
    })
      .then((res) => {
        setTransactions(res.transactions);
        setTotal(res.total);
        setTotalPages(res.total_pages);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [page, category, txnType, viewQueueOnly, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxn || !newCategory) return;
    setUpdating(true);
    try {
      await updateTransactionCategory(selectedTxn.id, newCategory, rememberMerchant);
      setSelectedTxn(null);
      loadData();
      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title and Review Queue Switch */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div>
          <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Transactions Ledger & Review Queue
          </h2>
          <p className={`text-xs sm:text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Deduplicated, classified transactions with continuous learning category corrections.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setViewQueueOnly(false); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              !viewQueueOnly
                ? 'bg-cyan-600 text-white shadow-xs'
                : theme === 'light'
                ? 'bg-slate-100 text-slate-600 hover:text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Transactions ({total})
          </button>
          <button
            onClick={() => { setViewQueueOnly(true); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewQueueOnly
                ? 'bg-amber-600 text-white shadow-xs'
                : theme === 'light'
                ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                : 'bg-slate-800 text-amber-300 hover:text-white'
            }`}
          >
            <span>Review Queue</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        {/* Search form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search merchant or description..."
              className={`w-full rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 border ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            />
          </div>
          <button
            type="submit"
            className={`px-3 py-1.5 rounded-lg border transition ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            Search
          </button>
        </form>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className={`rounded-lg px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-300 text-slate-800'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={txnType}
            onChange={(e) => { setTxnType(e.target.value); setPage(1); }}
            className={`rounded-lg px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-300 text-slate-800'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="">All Types</option>
            <option value="debit">Expenses (Debit)</option>
            <option value="credit">Income / Credit</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [col, ord] = e.target.value.split('-');
              setSortBy(col);
              setSortOrder(ord);
              setPage(1);
            }}
            className={`rounded-lg px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-300 text-slate-800'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-sm ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-slate-100' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase text-[10px] font-semibold border-b ${
              theme === 'light' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-800/80 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Merchant / Details</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Attributes & Lineage</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              theme === 'light' ? 'divide-slate-200 text-slate-700' : 'divide-slate-800 text-slate-300'
            }`}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-500" />
                    <span>Loading ledger transactions...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`py-12 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className={`transition ${theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                    <td className={`px-4 py-3 font-mono text-[11px] whitespace-nowrap ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {txn.date}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{txn.merchant}</div>
                      {txn.description && txn.description !== txn.merchant && (
                        <div className={`text-[11px] truncate max-w-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>{txn.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        theme === 'light'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {txn.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        {txn.is_recurring && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${
                            theme === 'light'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          }`}>
                            Recurring
                          </span>
                        )}
                        {txn.is_transfer && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${
                            theme === 'light'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            Transfer Excluded
                          </span>
                        )}
                        {txn.is_cc_payment && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${
                            theme === 'light'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-purple-950 text-purple-300 border border-purple-800'
                          }`}>
                            CC Payment
                          </span>
                        )}
                        {txn.needs_review && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${
                            theme === 'light'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            Needs Review
                          </span>
                        )}
                        {txn.categorization_method === 'user_correction' && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${
                            theme === 'light'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}>
                            Learned Rule
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-bold whitespace-nowrap ${
                      txn.type === 'credit'
                        ? theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'
                        : theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedTxn(txn);
                          setNewCategory(txn.category);
                        }}
                        className={`p-1 rounded transition ${
                          theme === 'light'
                            ? 'text-slate-400 hover:text-cyan-600 hover:bg-slate-100'
                            : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
                        }`}
                        title="Re-categorize and train model"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className={`px-4 py-3 border-t flex items-center justify-between text-xs ${
          theme === 'light' ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
        }`}>
          <span>
            Showing {(page - 1) * 25 + 1} to {Math.min(total, page * 25)} of {total} records
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`p-1 rounded transition disabled:opacity-40 ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className={`font-mono ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
              Page {page} of {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`p-1 rounded transition disabled:opacity-40 ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Re-assignment Modal with Learning Loop */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleUpdateCategory} className={`border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl ${
            theme === 'light'
              ? 'bg-white border-slate-200'
              : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Re-assign Category</h3>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className={`p-1 transition ${theme === 'light' ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3 rounded-xl text-xs space-y-1 border ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-800/50 border-slate-700/50'
            }`}>
              <p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{selectedTxn.merchant}</p>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
                Amount: ₹{selectedTxn.amount.toLocaleString('en-IN')} on {selectedTxn.date}
              </p>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
                Current Category: <span className={theme === 'light' ? 'text-cyan-600 font-semibold' : 'text-cyan-300'}>{selectedTxn.category}</span>
              </p>
            </div>

            <div className="text-xs space-y-2">
              <label className={`block font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Select New Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Learning loop checkbox */}
            <div className="flex items-start gap-2 pt-1 text-xs">
              <input
                type="checkbox"
                id="chk-remember"
                checked={rememberMerchant}
                onChange={(e) => setRememberMerchant(e.target.checked)}
                className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 mt-0.5"
              />
              <label htmlFor="chk-remember" className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                <strong>Remember this correction</strong> for all past and future transactions from <em>{selectedTxn.merchant}</em>.
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className={`px-4 py-2 rounded-lg text-xs ${
                  theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                {updating ? 'Updating Rules...' : 'Apply Correction'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
