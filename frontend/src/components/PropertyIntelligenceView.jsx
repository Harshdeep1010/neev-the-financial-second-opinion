import React, { useState, useEffect } from 'react';
import { useDecision } from '../context/DecisionContext';
import { api } from '../services/api';
import { formatINR } from '../utils/formatters';
import { 
  Home, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight,
  ShieldAlert,
  ClipboardList
} from 'lucide-react';

export default function PropertyIntelligenceView() {
  const { profile } = useDecision();

  const [propertyPrice, setPropertyPrice] = useState(8500000);
  const [downPayment, setDownPayment] = useState(2000000);
  const [interestRate, setInterestRate] = useState(8.75);
  const [tenureYears, setTenureYears] = useState(20);
  const [currentRent, setCurrentRent] = useState(32000);
  const [holdingYears, setHoldingYears] = useState(10);

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runPropertyAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await api.analyzeProperty({
        property_price: Number(propertyPrice),
        down_payment_saved: Number(downPayment),
        interest_rate_pct: Number(interestRate),
        tenure_years: Number(tenureYears),
        alternative_current_rent: Number(currentRent),
        holding_period_years: Number(holdingYears)
      }, profile);
      setResult(res);
    } catch (err) {
      console.error("Property analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runPropertyAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Input Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Home className="w-5 h-5 text-blue-400" />
            <span>Property Purchase & Rent-vs-Buy Intelligence</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              Module D Extension
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Examines upfront liquidity depletion, stamp duty friction, recurring maintenance, and cashflow difference against renting.
          </p>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Property Value (₹)</label>
            <input
              type="number"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Down Payment Available (₹)</label>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Monthly Rent (₹/mo)</label>
            <input
              type="number"
              value={currentRent}
              onChange={(e) => setCurrentRent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Home Loan Rate (%)</label>
            <input
              type="number"
              step="0.05"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tenure (Years)</label>
            <input
              type="number"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={runPropertyAnalysis}
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              {isLoading ? 'Calculating...' : 'Evaluate Property Affordability'}
            </button>
          </div>
        </div>

        {/* Emergency Fund Depletion Alarm if triggered */}
        {result && result.emergency_fund_depletion_warning && (
          <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-200">
              <span className="font-bold text-red-300 block">Upfront Liquidity Depletion Alert:</span>
              <p className="mt-0.5 leading-relaxed">{result.emergency_fund_depletion_warning}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Display */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card 1: Upfront & Recurring Cashflow Breakdown */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Capital & Monthly Outflow Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-900 rounded-lg">
                <span className="text-slate-400">Stamp Duty & Registration (7%)</span>
                <span className="font-mono font-bold text-white">{formatINR(result.stamp_duty_and_registration)}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-900 rounded-lg">
                <span className="text-slate-400">Total Upfront Cash Required</span>
                <span className="font-mono font-bold text-amber-400">{formatINR(result.total_upfront_cash_required)}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-900 rounded-lg">
                <span className="text-slate-400">Required Home Loan Principal</span>
                <span className="font-mono font-bold text-white">{formatINR(result.loan_amount_needed)}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-900 rounded-lg">
                <span className="text-slate-400">Monthly Home Loan EMI</span>
                <span className="font-mono font-bold text-blue-300">{formatINR(result.monthly_home_loan_emi)}/mo</span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-900 rounded-lg">
                <span className="text-slate-400">Est. Society Maintenance & Taxes</span>
                <span className="font-mono font-bold text-slate-300">{formatINR(result.monthly_maintenance_tax_estimate)}/mo</span>
              </div>

              <div className="flex justify-between p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl">
                <span className="font-semibold text-blue-200">Total Monthly Ownership Cost</span>
                <span className="font-mono font-bold text-blue-300 text-sm">{formatINR(result.total_monthly_ownership_cost)}/mo</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block font-medium">Monthly Cost Difference vs Current Rent:</span>
              <div className="text-sm font-bold text-amber-400 mt-0.5">
                {result.net_monthly_cost_difference_vs_rent > 0 ? `+${formatINR(result.net_monthly_cost_difference_vs_rent)}/mo more than renting` : `${formatINR(result.net_monthly_cost_difference_vs_rent)}/mo less than renting`}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Verdict: {result.rent_vs_buy_verdict}
              </p>
            </div>
          </div>

          {/* Card 2: Decision-Critical Real Estate Unknowns */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Real-Estate Critical Unknowns</span>
              </h3>

              <div className="space-y-2 mt-3 text-xs">
                {result.decision_critical_unknowns.map((unk, i) => (
                  <div key={i} className="p-2.5 bg-slate-900/90 border border-amber-900/30 rounded-lg text-slate-300">
                    {unk}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-400 mb-2">
                <ClipboardList className="w-4 h-4" />
                <span>Verification Checklist Before Token Advance</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {result.verification_checklist.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
