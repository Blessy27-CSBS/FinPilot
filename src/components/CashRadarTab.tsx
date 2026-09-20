import React, { useState } from 'react';
import {
  Radar, AlertTriangle, ShieldCheck, Settings, ArrowRight,
  TrendingUp, Calendar, AlertCircle, Info
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, ReferenceLine, CartesianGrid, Area, ComposedChart
} from 'recharts';
import { CashRadarResult } from '../types';

interface CashRadarTabProps {
  data: CashRadarResult;
  onUpdateSettings: (settings: { safety_line: number; starting_balance: number; salary_date: number }) => void;
  onOpenEvidence: (evidenceId: string) => void;
  theme?: 'light' | 'dark';
}

export const CashRadarTab: React.FC<CashRadarTabProps> = ({
  data,
  onUpdateSettings,
  onOpenEvidence,
  theme = 'light'
}) => {
  const [safetyLine, setSafetyLine] = useState(data.safety_line);
  const [startingBalance, setStartingBalance] = useState(data.starting_balance);
  const [salaryDate, setSalaryDate] = useState(data.salary_date);
  const [showSettings, setShowSettings] = useState(false);

  const handleApplySettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      safety_line: Number(safetyLine),
      starting_balance: Number(startingBalance),
      salary_date: Number(salaryDate)
    });
    setShowSettings(false);
  };

  const chartData = data.days.map((d) => ({
    date: `${d.day_name} ${d.day}`,
    fullDate: d.date,
    balance: d.projected_balance,
    safetyLine: data.safety_line,
    income: d.income,
    expenses: d.expenses,
    obligations: d.obligations,
    isRisky: d.is_risky,
    events: d.events
  }));

  return (
    <div className="space-y-6">
      {/* Header & Settings Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Radar className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">CashRadar: 30-Day Liquidity Forecast</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Forward-looking simulation tracking obligations, recurring billing, and liquidity thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>Configure Radar</span>
          </button>

          <button
            onClick={() => onOpenEvidence('ev_cashradar')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-xs font-semibold text-cyan-300 transition"
          >
            <span>Evidence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Settings Panel Drawer/Collapse */}
      {showSettings && (
        <form onSubmit={handleApplySettings} className="p-5 rounded-2xl bg-slate-900 border border-cyan-900/60 shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Configure CashRadar Baseline</h3>
            <span className="text-xs text-slate-400">Personalized simulation bounds</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Starting Balance (₹)</label>
              <input
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Safety Line Threshold (₹)</label>
              <input
                type="number"
                value={safetyLine}
                onChange={(e) => setSafetyLine(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Salary Deposit Day of Month</label>
              <input
                type="number"
                min="1"
                max="31"
                value={salaryDate}
                onChange={(e) => setSalaryDate(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              Re-calculate Projection
            </button>
          </div>
        </form>
      )}

      {/* Non-definitiveness Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-300 leading-relaxed">
          {data.explanation}
        </p>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400">Starting Operating Balance</p>
          <p className="text-xl font-bold text-white mt-1">₹{data.starting_balance.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">As of current period opening</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400">Configured Safety Line</p>
          <p className="text-xl font-bold text-amber-400 mt-1">₹{data.safety_line.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Minimum reserve benchmark</p>
        </div>

        <div className={`p-4 rounded-xl border ${
          data.risky_dates.length > 0
            ? 'bg-rose-950/20 border-rose-800/60'
            : 'bg-emerald-950/20 border-emerald-800/60'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Projected Lowest Balance</p>
            {data.risky_dates.length > 0 ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                {data.risky_dates.length} Risk Day(s)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Resilient
              </span>
            )}
          </div>
          <p className={`text-xl font-bold mt-1 ${data.lowest_projected_balance < data.safety_line ? 'text-rose-400' : 'text-emerald-400'}`}>
            ₹{data.lowest_projected_balance.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Estimated low point around {data.lowest_balance_date}</p>
        </div>
      </div>

      {/* 30-Day Liquidity Trajectory Chart */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Projected Cash Balance Trajectory</h3>
            <p className="text-xs text-slate-400">30-day outlook based on recorded payment rhythms and fixed obligations</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Projected Balance
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-3 h-0.5 bg-amber-400 inline-block border-dashed" /> Safety Line (₹{data.safety_line.toLocaleString('en-IN')})
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? "#e2e8f0" : "#1e293b"} />
              <XAxis dataKey="date" stroke={theme === 'light' ? "#94a3b8" : "#64748b"} tick={{ fontSize: 10, fill: theme === 'light' ? '#64748b' : '#94a3b8' }} />
              <YAxis
                stroke={theme === 'light' ? "#94a3b8" : "#64748b"}
                tick={{ fontSize: 10, fill: theme === 'light' ? '#64748b' : '#94a3b8' }}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className={`p-3 rounded-xl shadow-xl text-xs space-y-1 ${
                        theme === 'light'
                          ? 'bg-white border border-slate-200 text-slate-800 shadow-slate-200/80'
                          : 'bg-slate-900 border border-slate-700 text-white'
                      }`}>
                        <p className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{d.fullDate}</p>
                        <p className="text-cyan-500 font-mono font-semibold">
                          Projected Balance: ₹{d.balance.toLocaleString('en-IN')}
                        </p>
                        {d.income > 0 && (
                          <p className="text-emerald-500 font-mono">+₹{d.income.toLocaleString('en-IN')} Income</p>
                        )}
                        <p className={`font-mono ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>-₹{d.expenses.toLocaleString('en-IN')} Est. Expenses</p>
                        {d.obligations > 0 && (
                          <p className="text-rose-500 font-mono">-₹{d.obligations.toLocaleString('en-IN')} Obligations</p>
                        )}
                        {d.isRisky && (
                          <p className={`text-rose-500 font-semibold pt-1 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
                            Below safety threshold of ₹{d.safetyLine.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={data.safety_line}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: 'Safety Line', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                fill="url(#colorBalance)"
                stroke="#06b6d4"
                strokeWidth={2.5}
              />
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Day-by-Day Timeline / Interactive Calendar List */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">30-Day Liquidity Calendar</h3>
          <span className="text-xs text-slate-400">Individual milestone events & risks</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {data.days.map((day) => (
            <div
              key={day.date}
              className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between transition ${
                day.is_risky
                  ? 'bg-rose-950/30 border-rose-800/80 shadow-rose-950/20'
                  : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-300">{day.day_name} {day.day}</span>
                {day.is_risky && <AlertTriangle className="w-3 h-3 text-rose-400" />}
              </div>

              <div className="my-2">
                <span className={`font-mono font-bold block ${
                  day.is_risky ? 'text-rose-400' : 'text-slate-100'
                }`}>
                  ₹{(day.projected_balance / 1000).toFixed(1)}k
                </span>
                <span className="text-[10px] text-slate-500 block truncate">{day.date}</span>
              </div>

              {day.events && day.events.length > 0 ? (
                <div className="pt-1.5 border-t border-slate-700/60 text-[10px] text-cyan-300 truncate">
                  {day.events[0].title}
                </div>
              ) : (
                <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-500">
                  Daily Burn
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
