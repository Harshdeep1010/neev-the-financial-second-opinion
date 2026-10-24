import React, { useEffect } from 'react';
import { useDecision } from '../context/DecisionContext';
import { formatINR, formatPct } from '../utils/formatters';
import { 
  Sliders, 
  RotateCcw, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  Cell 
} from 'recharts';

export default function ScenarioSimulator() {
  const { 
    analysisResult, 
    scenarioAssumptions, 
    setScenarioAssumptions, 
    scenarioResult, 
    runScenarioSimulation, 
    isSimulating,
    compileDecisionBrief,
    isGeneratingBrief
  } = useDecision();

  // Run initial baseline simulation once analysis result is ready
  useEffect(() => {
    if (analysisResult && !scenarioResult) {
      runScenarioSimulation(scenarioAssumptions);
    }
  }, [analysisResult]);

  if (!analysisResult) return null;

  const handleSliderChange = (field, value) => {
    const updated = {
      ...scenarioAssumptions,
      [field]: Number(value)
    };
    setScenarioAssumptions(updated);
    runScenarioSimulation(updated);
  };

  const applyStressPreset = (presetType) => {
    let updated = { ...scenarioAssumptions };
    if (presetType === 'rate_hike') {
      updated = { ...updated, rate_delta_pct: 2.0 };
    } else if (presetType === 'income_drop') {
      updated = { ...updated, income_delta_pct: -20.0 };
    } else if (presetType === 'expense_spike') {
      updated = { ...updated, expense_delta_pct: 15.0 };
    } else if (presetType === 'prepay') {
      updated = { ...updated, prepayment_lump_sum: 100000 };
    } else if (presetType === 'reset') {
      updated = {
        income_delta_pct: 0,
        rate_delta_pct: 0,
        expense_delta_pct: 0,
        tenure_delta_months: 0,
        prepayment_lump_sum: 0
      };
    }
    setScenarioAssumptions(updated);
    runScenarioSimulation(updated);
  };

  // Prepare chart data comparing baseline and simulated
  const chartData = scenarioResult ? [
    {
      name: 'Monthly EMI',
      Baseline: scenarioResult.baseline_emi,
      Simulated: scenarioResult.simulated_emi
    },
    {
      name: 'Free Surplus',
      Baseline: scenarioResult.baseline_surplus,
      Simulated: Math.max(0, scenarioResult.simulated_surplus)
    }
  ] : [];

  return (
    <div id="scenario-simulator-section" className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white">
              Signature Feature: "What Changes My Decision?"
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Interactive Sensitivity Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Modify assumptions below to stress-test your cashflow. The backend deterministically recalculates your monthly surplus, EMI, and debt limits.
          </p>
        </div>

        {/* 1-Click Stress Preset Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => applyStressPreset('rate_hike')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs border border-amber-900/50 font-medium transition"
          >
            +2% Floating Rate Hike
          </button>
          <button
            onClick={() => applyStressPreset('income_drop')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-300 text-xs border border-red-900/50 font-medium transition"
          >
            -20% Income Drop
          </button>
          <button
            onClick={() => applyStressPreset('prepay')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs border border-teal-900/50 font-medium transition"
          >
            ₹1 Lakh Prepayment
          </button>
          <button
            onClick={() => applyStressPreset('reset')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            title="Reset to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        
        {/* Slider 1: Rate Delta */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Interest Rate Shift</span>
            <span className={`font-mono font-bold ${scenarioAssumptions.rate_delta_pct > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
              {scenarioAssumptions.rate_delta_pct >= 0 ? `+${scenarioAssumptions.rate_delta_pct.toFixed(1)}%` : `${scenarioAssumptions.rate_delta_pct.toFixed(1)}%`}
            </span>
          </div>
          <input
            type="range"
            min="-2.0"
            max="4.0"
            step="0.25"
            value={scenarioAssumptions.rate_delta_pct}
            onChange={(e) => handleSliderChange('rate_delta_pct', e.target.value)}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>-2.0%</span>
            <span>0%</span>
            <span>+4.0%</span>
          </div>
        </div>

        {/* Slider 2: Income Delta */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Income Change</span>
            <span className={`font-mono font-bold ${scenarioAssumptions.income_delta_pct < 0 ? 'text-red-400' : 'text-slate-200'}`}>
              {scenarioAssumptions.income_delta_pct > 0 ? `+${scenarioAssumptions.income_delta_pct}%` : `${scenarioAssumptions.income_delta_pct}%`}
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="20"
            step="5"
            value={scenarioAssumptions.income_delta_pct}
            onChange={(e) => handleSliderChange('income_delta_pct', e.target.value)}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>-30%</span>
            <span>0%</span>
            <span>+20%</span>
          </div>
        </div>

        {/* Slider 3: Expense Surge */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Living Expense Surge</span>
            <span className={`font-mono font-bold ${scenarioAssumptions.expense_delta_pct > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
              +{scenarioAssumptions.expense_delta_pct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="5"
            value={scenarioAssumptions.expense_delta_pct}
            onChange={(e) => handleSliderChange('expense_delta_pct', e.target.value)}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0%</span>
            <span>+15%</span>
            <span>+30%</span>
          </div>
        </div>

        {/* Slider 4: Prepayment */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Lump Sum Prepayment</span>
            <span className="font-mono font-bold text-teal-400">
              {formatINR(scenarioAssumptions.prepayment_lump_sum)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="300000"
            step="25000"
            value={scenarioAssumptions.prepayment_lump_sum}
            onChange={(e) => handleSliderChange('prepayment_lump_sum', e.target.value)}
            className="w-full accent-teal-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>₹0</span>
            <span>₹1.5 L</span>
            <span>₹3.0 L</span>
          </div>
        </div>

      </div>

      {/* Results & Visual Feedback */}
      {scenarioResult && (
        <div className="space-y-5">
          
          {/* Verdict Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            scenarioResult.simulated_surplus < 0 
              ? 'bg-red-950/30 border-red-800/60 text-red-200' 
              : scenarioResult.risk_alerts.length > 0 
                ? 'bg-amber-950/30 border-amber-800/50 text-amber-200' 
                : 'bg-teal-950/30 border-teal-800/50 text-teal-200'
          }`}>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                Stress Scenario Verdict
              </div>
              <div className="text-base font-bold text-white mt-0.5">
                {scenarioResult.verdict}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {scenarioResult.what_changed_explanation}
              </p>
            </div>
            
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 block">Simulated Surplus</span>
              <span className={`text-xl font-bold font-mono ${scenarioResult.simulated_surplus >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                {formatINR(scenarioResult.simulated_surplus)}/mo
              </span>
            </div>
          </div>

          {/* Metric Cards Comparison */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {scenarioResult.metrics_comparison.map((pair, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400">{pair.metric_name}</div>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-base font-bold text-white">
                    {pair.unit === '₹/mo' || pair.unit === '₹' ? formatINR(pair.simulated_value) : `${pair.simulated_value}${pair.unit}`}
                  </span>
                  <span className={`text-[11px] font-bold ${
                    pair.status === 'critical' ? 'text-red-400' :
                    pair.status === 'warning' ? 'text-amber-400' :
                    pair.status === 'favorable' ? 'text-teal-400' : 'text-slate-400'
                  }`}>
                    {pair.delta_value > 0 ? `+${pair.delta_value}` : pair.delta_value} ({pair.delta_pct > 0 ? `+${pair.delta_pct}%` : `${pair.delta_pct}%`})
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Baseline: {pair.unit === '₹/mo' || pair.unit === '₹' ? formatINR(pair.baseline_value) : `${pair.baseline_value}${pair.unit}`}
                </div>
              </div>
            ))}
          </div>

          {/* Risk Alerts Activated */}
          {scenarioResult.risk_alerts.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-amber-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Activated Risk Thresholds:</span>
              </span>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside pl-1">
                {scenarioResult.risk_alerts.map((alert, i) => (
                  <li key={i}>{alert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Side-by-side Chart */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Baseline vs. Stress Scenario Comparison (₹/month)
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val) => [formatINR(val), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Baseline" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Next Step: Decision Brief CTA */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-teal-900/30 border border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Generate Final Decision Brief</span>
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Compile your verified evidence, calculations, critical unknowns, and lender checklist into an actionable executive brief.
          </p>
        </div>

        <button
          onClick={compileDecisionBrief}
          disabled={isGeneratingBrief}
          className="flex items-center space-x-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-600/30 transition shrink-0 active:scale-98"
        >
          {isGeneratingBrief ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Synthesizing Brief...</span>
            </>
          ) : (
            <>
              <span>Compile Executive Decision Brief</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
