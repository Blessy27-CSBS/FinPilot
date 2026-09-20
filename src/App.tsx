import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { CommitStackTab } from './components/CommitStackTab';
import { CashRadarTab } from './components/CashRadarTab';
import { WhyLensTab } from './components/WhyLensTab';
import { GoalShiftTab } from './components/GoalShiftTab';
import { TransactionsTab } from './components/TransactionsTab';
import { IntelligenceTab } from './components/IntelligenceTab';
import { FinPilotChat } from './components/FinPilotChat';
import { ProofTrailDrawer } from './components/ProofTrailDrawer';
import { UploadModal } from './components/UploadModal';
import { BudgetAlertToast } from './components/BudgetAlertToast';
import { fetchDashboard, fetchCashRadar, updateCashRadarConfig, reloadDemoData } from './api';
import { DashboardData, CashRadarResult } from './types';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [cashRadarData, setCashRadarData] = useState<CashRadarResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme & Notifications
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isBudgetToastOpen, setIsBudgetToastOpen] = useState(true);
  const [intelligenceSection, setIntelligenceSection] = useState<'subs' | 'anomalies' | 'budgets'>('budgets');

  // Modals & Drawers
  const [activeEvidenceId, setActiveEvidenceId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadAllData = async (month: string = selectedMonth) => {
    setLoading(true);
    setError(null);
    try {
      const [dash, radar] = await Promise.all([
        fetchDashboard(month),
        fetchCashRadar(month)
      ]);
      setDashboardData(dash);
      setCashRadarData(radar);
    } catch (err: any) {
      console.error('Data fetch error:', err);
      setError(err.message || 'Unable to load financial dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData(selectedMonth);
  }, [selectedMonth]);

  const handleUpdateRadarSettings = async (settings: { safety_line: number; starting_balance: number; salary_date: number }) => {
    try {
      await updateCashRadarConfig(settings);
      const updatedRadar = await fetchCashRadar({ ...settings, month: selectedMonth });
      setCashRadarData(updatedRadar);
      const updatedDash = await fetchDashboard(selectedMonth);
      setDashboardData(updatedDash);
    } catch (err) {
      console.error('Failed to update cash radar config', err);
    }
  };

  const handleReloadDemo = async () => {
    try {
      await reloadDemoData();
      await loadAllData(selectedMonth);
    } catch (err) {
      console.error('Failed to reload demo data', err);
    }
  };

  const pendingReviewCount = dashboardData?.recent_transactions?.filter((t) => t.needs_review).length || 0;

  const budgetAlertCount = dashboardData?.budgets?.filter(
    (b) => b.percent_used >= 80 || (b.projected_percent !== undefined && b.projected_percent >= 80)
  ).length || 0;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'light'
        ? 'theme-light bg-slate-50 text-slate-900 selection:bg-amber-100 selection:text-amber-900'
        : 'bg-slate-950 text-slate-100 selection:bg-cyan-900 selection:text-white'
    }`}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        onOpenUpload={() => setShowUploadModal(true)}
        onReloadDemo={handleReloadDemo}
        pendingReviewCount={pendingReviewCount}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        budgetAlertCount={budgetAlertCount}
        onOpenBudgetToast={() => setIsBudgetToastOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && !dashboardData && (
          <div className="py-32 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-medium">
              Running FinPilot deterministic analytics engine & loading statements...
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadAllData()}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-white text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && dashboardData && (
          <>
            {activeTab === 'overview' && (
              <OverviewTab
                data={dashboardData}
                onOpenEvidence={(id) => setActiveEvidenceId(id)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                theme={theme}
              />
            )}

            {activeTab === 'commit_stack' && (
              <CommitStackTab
                data={dashboardData.commit_stack}
                onOpenEvidence={(id) => setActiveEvidenceId(id)}
                theme={theme}
              />
            )}

            {activeTab === 'cash_radar' && cashRadarData && (
              <CashRadarTab
                data={cashRadarData}
                onUpdateSettings={handleUpdateRadarSettings}
                onOpenEvidence={(id) => setActiveEvidenceId(id)}
                theme={theme}
              />
            )}

            {activeTab === 'why_lens' && (
              <WhyLensTab onOpenEvidence={(id) => setActiveEvidenceId(id)} theme={theme} />
            )}

            {activeTab === 'goal_shift' && <GoalShiftTab theme={theme} />}

            {activeTab === 'transactions' && (
              <TransactionsTab onRefreshData={() => loadAllData()} theme={theme} />
            )}

            {activeTab === 'intelligence' && (
              <IntelligenceTab
                subscriptions={dashboardData.active_subscriptions || dashboardData.subscriptions || []}
                anomalies={dashboardData.anomalies}
                budgets={dashboardData.budgets}
                onOpenEvidence={(id) => setActiveEvidenceId(id)}
                onTriggerBudgetAlert={() => setIsBudgetToastOpen(true)}
                defaultSection={intelligenceSection}
                theme={theme}
              />
            )}

            {(activeTab === 'chat' || activeTab === 'ai_assistant') && (
              <FinPilotChat
                onOpenEvidence={(id) => setActiveEvidenceId(id)}
                selectedMonth={selectedMonth}
                theme={theme}
              />
            )}
          </>
        )}
      </main>

      {/* Footer / Regulatory Notice */}
      <footer className={`border-t py-4 text-center text-xs transition-colors ${
        theme === 'light'
          ? 'border-slate-200 bg-white text-slate-500'
          : 'border-slate-900 bg-slate-950/90 text-slate-500'
      }`}>
        <p>
          FinPilot provides verifiable decision support insights calculated deterministically from user transaction ledgers.
          This does not constitute licensed fiduciary, tax, or investment advice.
        </p>
      </footer>

      {/* ProofTrail Explainability Drawer */}
      <ProofTrailDrawer
        evidenceId={activeEvidenceId}
        onClose={() => setActiveEvidenceId(null)}
        theme={theme}
      />

      {/* Upload Document / Statement Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={() => loadAllData()}
        theme={theme}
      />

      {/* Budget Limit Exceeded Notification Toast */}
      {dashboardData?.budgets && (
        <BudgetAlertToast
          budgets={dashboardData.budgets}
          isOpen={isBudgetToastOpen}
          onClose={() => setIsBudgetToastOpen(false)}
          onOpenEvidence={(id) => setActiveEvidenceId(id)}
          onNavigateToIntelligence={() => {
            setActiveTab('intelligence');
            setIntelligenceSection('budgets');
          }}
          theme={theme}
        />
      )}
    </div>
  );
}
