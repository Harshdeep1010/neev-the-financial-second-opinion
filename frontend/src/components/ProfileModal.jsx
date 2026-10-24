import React, { useState } from 'react';
import { useDecision } from '../context/DecisionContext';
import { formatINR, formatPct } from '../utils/formatters';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ProfileModal() {
  const { 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    profile, 
    setProfile, 
    profileAnalysis,
    runOfferAnalysis,
    offerInput
  } = useDecision();

  const [formData, setFormData] = useState({ ...profile });

  if (!isProfileModalOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['primary_goal', 'risk_tolerance'].includes(name) ? value : Number(value) || 0
    }));
  };

  const handleSave = () => {
    setProfile(formData);
    setIsProfileModalOpen(false);
    // If offer was previously analyzed, re-evaluate with updated profile context
    if (offerInput && (offerInput.raw_text || offerInput.principal)) {
      runOfferAnalysis();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111827] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Personal Financial Profile</span>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-normal">
                Common Decision Foundation
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Neev evaluates financial offers relative to your real income, obligations, and safety buffers.
            </p>
          </div>
          <button 
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Live Financial Health Indicator */}
          {profileAnalysis && (
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Monthly Surplus</div>
                <div className={`text-base font-bold ${profileAnalysis.monthly_surplus >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                  {formatINR(profileAnalysis.monthly_surplus)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Baseline DTI</div>
                <div className={`text-base font-bold ${profileAnalysis.debt_to_income_ratio_pct > 35 ? 'text-amber-400' : 'text-slate-100'}`}>
                  {formatPct(profileAnalysis.debt_to_income_ratio_pct)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Emergency Buffer</div>
                <div className={`text-base font-bold ${profileAnalysis.emergency_fund_months < 3 ? 'text-red-400' : 'text-teal-400'}`}>
                  {profileAnalysis.emergency_fund_months} mos
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Cashflow Health</div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase mt-0.5 ${
                  profileAnalysis.health_assessment === 'STABLE' ? 'bg-teal-500/20 text-teal-300' :
                  profileAnalysis.health_assessment === 'MODERATE' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {profileAnalysis.health_assessment}
                </span>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly In-Hand Income (₹) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="monthly_income"
                value={formData.monthly_income}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. 120000"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Net post-tax salary or recurring income</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly Essential Expenses (₹) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="monthly_essential_expenses"
                value={formData.monthly_essential_expenses}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. 45000"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Rent, groceries, utilities, dependents</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Liquid Savings (₹)
              </label>
              <input
                type="number"
                name="current_savings"
                value={formData.current_savings}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. 300000"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Bank balance, liquid mutual funds, FDs</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Emergency Savings (₹)
              </label>
              <input
                type="number"
                name="emergency_savings"
                value={formData.emergency_savings}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. 200000"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Ring-fenced strictly for unexpected events</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Existing Monthly EMIs / Obligations (₹)
              </label>
              <input
                type="number"
                name="existing_monthly_emi"
                value={formData.existing_monthly_emi}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. 15000"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Car loans, personal loans, education loans</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Risk Tolerance
              </label>
              <select
                name="risk_tolerance"
                value={formData.risk_tolerance}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="conservative">Conservative (Capital preservation priority)</option>
                <option value="moderate">Moderate (Balanced risk & growth)</option>
                <option value="aggressive">Aggressive (High volatility tolerance)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Financial Goal
              </label>
              <input
                type="text"
                name="primary_goal"
                value={formData.primary_goal}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Save ₹20 Lakhs for home down payment in 3 years"
              />
            </div>

          </div>

          {/* Key Vulnerability Warnings if any */}
          {profileAnalysis && profileAnalysis.key_vulnerabilities.length > 0 && (
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Identified Cashflow Sensitivities:</span>
              </div>
              <ul className="text-xs text-amber-200/90 list-disc list-inside space-y-0.5 pl-1">
                {profileAnalysis.key_vulnerabilities.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end space-x-3">
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
          >
            <span>Update Profile & Re-evaluate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
