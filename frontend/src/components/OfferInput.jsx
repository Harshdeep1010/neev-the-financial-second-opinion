import React, { useState } from 'react';
import { useDecision } from '../context/DecisionContext';
import { 
  Sparkles, 
  FileText, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  HelpCircle,
  Sliders,
  ShieldAlert
} from 'lucide-react';

export default function OfferInput() {
  const { 
    offerInput, 
    setOfferInput, 
    runOfferAnalysis, 
    isAnalyzing, 
    analysisError,
    analysisResult
  } = useDecision();

  const [inputMode, setInputMode] = useState('text'); // 'text' | 'manual'

  const handleTextChange = (e) => {
    setOfferInput(prev => ({
      ...prev,
      raw_text: e.target.value
    }));
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setOfferInput(prev => ({
      ...prev,
      [name]: name === 'interest_rate_type' ? value : (name === 'prepayment_penalty_disclosed' ? value === 'true' : Number(value) || null)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runOfferAnalysis();
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Offer Evaluation Input</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              Module B
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Paste sanction text, an SMS, or enter terms manually. Neev extracts the variables and flags hidden gaps.
          </p>
        </div>

        {/* Input Toggle */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              inputMode === 'text' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Offer Text</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('manual')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              inputMode === 'manual' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Enter Terms Manually</span>
          </button>
        </div>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {inputMode === 'text' ? (
          <div>
            <div className="relative">
              <textarea
                rows={5}
                value={offerInput.raw_text || ''}
                onChange={handleTextChange}
                placeholder="e.g. Pre-approved loan! Get ₹8,00,000 at 10.5% p.a. for 48 months. Minimal documentation, processing fee as per policy..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition"
              />
            </div>

            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
              <div className="flex items-center space-x-1 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Parsed via Gemini Structured Extraction with deterministic math engine.</span>
              </div>
              <span>No data saved to third-party databases.</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Principal Amount (₹)</label>
              <input
                type="number"
                name="principal"
                value={offerInput.principal || ''}
                onChange={handleManualChange}
                placeholder="800000"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Stated Annual Rate (%)</label>
              <input
                type="number"
                step="0.05"
                name="annual_interest_rate_pct"
                value={offerInput.annual_interest_rate_pct || ''}
                onChange={handleManualChange}
                placeholder="10.5"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tenure (Months)</label>
              <input
                type="number"
                name="tenure_months"
                value={offerInput.tenure_months || ''}
                onChange={handleManualChange}
                placeholder="48"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Interest Rate Type</label>
              <select
                name="interest_rate_type"
                value={offerInput.interest_rate_type || 'unknown'}
                onChange={handleManualChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="unknown">Undisclosed / Unknown in Offer</option>
                <option value="fixed">Fixed Rate</option>
                <option value="floating">Floating (Repo / EBLR linked)</option>
                <option value="flat">Flat Rate (Deceptive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Processing Fee (₹ or %)</label>
              <input
                type="number"
                name="processing_fee_amount"
                value={offerInput.processing_fee_amount || ''}
                onChange={handleManualChange}
                placeholder="Leave blank if undisclosed"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Prepayment Terms Disclosed?</label>
              <select
                name="prepayment_penalty_disclosed"
                value={offerInput.prepayment_penalty_disclosed ? 'true' : 'false'}
                onChange={handleManualChange}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="false">No / Undisclosed</option>
                <option value="true">Yes, explicitly disclosed</option>
              </select>
            </div>
          </div>
        )}

        {/* Error notification */}
        {analysisError && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{analysisError}</span>
          </div>
        )}

        {/* Pressure & Scam flags if found in current analysis */}
        {analysisResult && analysisResult.scam_or_pressure_flags && analysisResult.scam_or_pressure_flags.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-amber-300 block">
                Sales Pressure / Urgency Tactics Detected:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {analysisResult.scam_or_pressure_flags.map((flag, idx) => (
                  <span key={idx} className="text-[11px] bg-amber-900/40 text-amber-200 px-2 py-0.5 rounded border border-amber-700/50">
                    "{flag}"
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-amber-300/80 mt-1">
                Artificial urgency is often used to discourage borrowers from verifying fees and repayment schedules.
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            {analysisResult && (
              <span className="text-slate-300">
                Extraction: <span className="font-semibold text-blue-400">{analysisResult.parsed_offer.extraction_method}</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-blue-600/30 transition active:scale-98"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Auditing Terms & Math...</span>
              </>
            ) : (
              <>
                <span>Analyze Decision with Neev</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
