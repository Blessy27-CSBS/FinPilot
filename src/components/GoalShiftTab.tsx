import React, { useState, useEffect } from 'react';
import { Target, Plus, Sparkles, ArrowRight, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { Goal, GoalScenarioResult } from '../types';
import { fetchGoals, createGoal, runGoalScenario } from '../api';

interface GoalShiftTabProps {
  theme?: 'light' | 'dark';
}

export const GoalShiftTab: React.FC<GoalShiftTabProps> = ({ theme = 'light' }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [scenarioText, setScenarioText] = useState<string>('Reduce shopping by ₹1,000');
  const [scenarioResult, setScenarioResult] = useState<GoalScenarioResult | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  // New goal form
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(100000);
  const [savedAmount, setSavedAmount] = useState<number>(30000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [deadline, setDeadline] = useState('2027-06-01');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    fetchGoals().then((res) => {
      setGoals(res.goals);
      if (res.goals.length > 0 && !selectedGoalId) {
        setSelectedGoalId(res.goals[0].id);
      }
    });
  };

  const handleSimulate = async (customPrompt?: string) => {
    const textToRun = customPrompt || scenarioText;
    if (!textToRun || !selectedGoalId) return;

    setSimulating(true);
    try {
      const res = await runGoalScenario(selectedGoalId, textToRun);
      setScenarioResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await createGoal({
      name,
      target_amount: Number(targetAmount),
      current_saved_amount: Number(savedAmount),
      monthly_contribution: Number(monthlyContribution),
      deadline
    });
    setShowNewModal(false);
    setName('');
    loadGoals();
  };

  const quickPrompts = [
    'Reduce shopping by ₹1,000',
    'Cut dining out by ₹1,500',
    'Reallocate ₹2,000 from subscriptions',
    'Save an extra ₹3,000 monthly'
  ];

  return (
    <div className="space-y-6">
      {/* Title & Add Goal Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">GoalShift: Milestone Timelines & What-If Simulator</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Simulate realistic spending trade-offs to accelerate your financial milestones.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map((g) => {
          const progress = Math.min(100, Math.round((g.current_saved_amount / g.target_amount) * 100));
          const isSelected = selectedGoalId === g.id;
          return (
            <div
              key={g.id}
              onClick={() => setSelectedGoalId(g.id)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? theme === 'light'
                    ? 'bg-cyan-50/60 border-cyan-500 shadow-md shadow-cyan-100'
                    : 'bg-slate-800/80 border-cyan-500 shadow-md shadow-cyan-950/20'
                  : theme === 'light'
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{g.name}</h3>
                  <span className="text-xs font-mono font-bold text-cyan-500">{progress}%</span>
                </div>

                <div className="my-3">
                  <p className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>₹{g.target_amount.toLocaleString('en-IN')}</p>
                  <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    ₹{g.current_saved_amount.toLocaleString('en-IN')} saved (₹{(g.remaining_amount || 0).toLocaleString('en-IN')} remaining)
                  </p>
                </div>

                {/* Progress bar */}
                <div className={`h-2 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div style={{ width: `${progress}%` }} className="h-full bg-cyan-500 rounded-full" />
                </div>
              </div>

              <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                theme === 'light' ? 'border-slate-200 text-slate-600' : 'border-slate-800/80 text-slate-400'
              }`}>
                <span>₹{g.monthly_contribution.toLocaleString('en-IN')}/mo</span>
                <span className={`flex items-center gap-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  <Clock className="w-3.5 h-3.5 text-cyan-500" />
                  {g.estimated_completion_date}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* What-If Interactive Simulator Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">What-If Spending Trade-off Simulator</h3>
          </div>
          <p className="text-xs text-slate-400">
            Select an active goal and enter an adjustment. The simulation calculations are verified directly by Python.
          </p>
        </div>

        {/* Simulator Input & Quick Prompts */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={scenarioText}
              onChange={(e) => setScenarioText(e.target.value)}
              placeholder="e.g. Reduce shopping by ₹1,000"
              className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              onClick={() => handleSimulate()}
              disabled={simulating || !scenarioText}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition shrink-0"
            >
              {simulating ? 'Calculating Timeline...' : 'Run Scenario'}
            </button>
          </div>

          {/* Quick Scenario Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500">Quick Scenarios:</span>
            {quickPrompts.map((qp) => (
              <button
                key={qp}
                onClick={() => {
                  setScenarioText(qp);
                  handleSimulate(qp);
                }}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Output Comparison Panel */}
        {scenarioResult && (
          <div className="p-5 rounded-xl bg-slate-950 border border-cyan-900/60 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Simulation Result</span>
                <h4 className="text-base font-bold text-white mt-0.5">{scenarioResult.goal_name}</h4>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {scenarioResult.months_saved} Months Sooner!
              </span>
            </div>

            {/* Before vs After Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase">Baseline Path</span>
                <p className="text-lg font-bold text-slate-200 mt-1">{scenarioResult.before_date}</p>
                <p className="text-xs text-slate-400">
                  {scenarioResult.before_months} months at ₹{scenarioResult.original_contribution.toLocaleString('en-IN')}/mo
                </p>
              </div>

              <div className="p-4 rounded-lg bg-cyan-950/30 border border-cyan-800/60 space-y-1">
                <span className="text-xs font-semibold text-cyan-400 uppercase">Accelerated Path (+₹{scenarioResult.additional_monthly_savings.toLocaleString('en-IN')}/mo)</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">{scenarioResult.after_date}</p>
                <p className="text-xs text-cyan-300">
                  {scenarioResult.after_months} months at ₹{scenarioResult.scenario_contribution.toLocaleString('en-IN')}/mo
                </p>
              </div>
            </div>

            {/* Plain English Narration */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {scenarioResult.explanation}
            </div>
          </div>
        )}
      </div>

      {/* New Goal Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateGoal} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create Savings Goal</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Down Payment, Laptop, Vacation"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Current Saved (₹)</label>
                  <input
                    type="number"
                    required
                    value={savedAmount}
                    onChange={(e) => setSavedAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Monthly Contribution (₹)</label>
                  <input
                    type="number"
                    required
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
