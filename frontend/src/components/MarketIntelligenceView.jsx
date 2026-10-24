import React, { useState, useEffect } from 'react';
import { useDecision } from '../context/DecisionContext';
import { api } from '../services/api';
import { formatINR, formatPct } from '../utils/formatters';
import { 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Cpu, 
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';

export default function MarketIntelligenceView() {
  const { profile } = useDecision();

  const [capital, setCapital] = useState(100000);
  const [horizonMonths, setHorizonMonths] = useState(36);
  const [riskTolerance, setRiskTolerance] = useState(profile ? profile.risk_tolerance : 'moderate');
  
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMlDetails, setShowMlDetails] = useState(false);

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await api.analyzeInvestments({
        available_capital: Number(capital),
        investment_horizon_months: Number(horizonMonths),
        user_risk_tolerance: riskTolerance
      }, profile);
      setResult(res);
    } catch (err) {
      console.error("Investment analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Investment Risk Intelligence</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Module C Extension
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Evaluates investment candidates against your personal horizon, downside drawdowns, and a trained ML volatility regime classifier.
            </p>
          </div>

          <button
            onClick={() => setShowMlDetails(!showMlDetails)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-xs font-semibold border border-blue-900/40 transition self-start sm:self-auto"
          >
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>{showMlDetails ? 'Hide Model Architecture' : 'View ML Model Audit & Metrics'}</span>
          </button>
        </div>

        {/* ML Model Transparency Drawer */}
        {showMlDetails && result && result.ml_model_metadata && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900 border border-blue-900/40 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>Authentic scikit-learn Model Evaluation</span>
              </span>
              <span className="text-[11px] text-teal-400 font-mono font-semibold">
                Leakage-Free Chronological Split
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-800/80 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Out-of-Sample Accuracy</span>
                <span className="text-base font-bold text-white mt-0.5 block">
                  {result.ml_model_metadata.test_accuracy_pct}%
                </span>
                <span className="text-[10px] text-slate-400">Baseline: {result.ml_model_metadata.baseline_accuracy_pct}%</span>
              </div>

              <div className="p-2.5 bg-slate-800/80 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Out-of-Sample Macro F1</span>
                <span className="text-base font-bold text-teal-400 mt-0.5 block">
                  {result.ml_model_metadata.test_macro_f1}
                </span>
                <span className="text-[10px] text-slate-400">Baseline F1: {result.ml_model_metadata.baseline_macro_f1}</span>
              </div>

              <div className="p-2.5 bg-slate-800/80 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Training Period</span>
                <span className="text-xs font-medium text-slate-200 mt-0.5 block font-mono">
                  2018–2022
                </span>
                <span className="text-[10px] text-slate-400">Test Period: 2023–2024</span>
              </div>

              <div className="p-2.5 bg-slate-800/80 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Target Classification</span>
                <span className="text-[11px] text-slate-200 mt-0.5 block">
                  Forward 20-Day Realized Volatility Regime
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 pt-1">
              <div className="font-semibold text-slate-300">Documented Limitations:</div>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                {result.ml_model_metadata.limitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Available Capital (₹)</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Investment Horizon (Months)</label>
            <input
              type="number"
              value={horizonMonths}
              onChange={(e) => setHorizonMonths(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={runAnalysis}
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              {isLoading ? 'Recalculating...' : 'Update Risk Evaluation'}
            </button>
          </div>
        </div>

        {/* Goal Conflict Warning */}
        {result && result.goal_conflict_warning && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-200">
              <span className="font-bold text-red-300 block">Personal Profile Goal Conflict:</span>
              <p className="mt-0.5 leading-relaxed">{result.goal_conflict_warning}</p>
            </div>
          </div>
        )}

      </div>

      {/* Asset Comparison Cards */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {result.asset_comparisons.map((asset, idx) => (
            <div key={idx} className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {asset.asset_class}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    asset.ml_volatility_regime.includes('LOW') ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                    asset.ml_volatility_regime.includes('ELEVATED') ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    ML: {asset.ml_volatility_regime.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-1">
                  {asset.name}
                </h3>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-[10px] text-slate-400">5-Year CAGR</span>
                    <span className="text-sm font-bold text-teal-400 block mt-0.5">
                      +{asset.cagr_5y_pct}%
                    </span>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-[10px] text-slate-400">Annualized Volatility</span>
                    <span className="text-sm font-bold text-slate-200 block mt-0.5">
                      {asset.annualized_volatility_pct}%
                    </span>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-[10px] text-slate-400">Max Historical Drawdown</span>
                    <span className="text-sm font-bold text-red-400 block mt-0.5">
                      {asset.max_drawdown_historical_pct}%
                    </span>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-[10px] text-slate-400">Worst 1-Year Period</span>
                    <span className="text-sm font-bold text-amber-400 block mt-0.5">
                      {asset.worst_1y_return_pct}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-300 block mb-1">Trade-off & Reality:</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {asset.tradeoff_warning}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Horizon Suitability</span>
                <span className="text-xs font-semibold text-slate-200 mt-0.5 block">
                  {asset.suitability_verdict}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
