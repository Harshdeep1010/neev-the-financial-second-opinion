import React, { useState } from 'react';
import { useDecision } from '../context/DecisionContext';
import { formatINR, formatPct } from '../utils/formatters';
import { 
  FileCheck, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft,
  Calendar,
  Hash,
  HelpCircle
} from 'lucide-react';

export default function DecisionBriefView() {
  const { decisionBrief, setActiveTab } = useDecision();
  const [copied, setCopied] = useState(false);

  if (!decisionBrief) {
    return (
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center space-y-4">
        <FileCheck className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Decision Brief Compiled Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Analyze an offer and run sensitivity analysis in the Loan Intelligence tab, then click "Compile Executive Decision Brief".
        </p>
        <button
          onClick={() => setActiveTab('loan')}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
        >
          Go to Loan Evaluation
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `NEEV DECISION BRIEF — ${decisionBrief.brief_id}
Generated: ${decisionBrief.generated_at}
Decision: ${decisionBrief.question}

READINESS: ${decisionBrief.decision_readiness_status}
${decisionBrief.readiness_reason}

EXECUTIVE SUMMARY:
${decisionBrief.executive_summary}

KEY CALCULATIONS:
- Monthly EMI: ₹${decisionBrief.baseline_calculations.monthly_emi.toLocaleString('en-IN')}/mo
- Total Interest: ₹${decisionBrief.baseline_calculations.total_interest.toLocaleString('en-IN')}
- Effective APR: ${decisionBrief.baseline_calculations.effective_apr_pct}%
- Post-Commitment DTI: ${decisionBrief.baseline_calculations.post_commitment_dti_pct}%
- Monthly Surplus Remaining: ₹${decisionBrief.baseline_calculations.post_commitment_surplus.toLocaleString('en-IN')}/mo

VERIFICATION CHECKLIST FOR LENDER:
${decisionBrief.verification_checklist_for_lender.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Audit: ${decisionBrief.audit_trail.engine_version} | ${decisionBrief.audit_trail.calculation_methodology}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => setActiveTab('loan')}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Simulator</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyText}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-teal-400 font-semibold">Copied Text</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Brief</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Brief Document */}
      <div className="bg-[#111827] border border-slate-700/80 rounded-2xl p-8 shadow-2xl space-y-6 text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest font-bold text-blue-400">
                Decision Brief
              </span>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">
                Official Second Opinion
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Neev Financial Second Opinion Brief
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Decision: <span className="text-slate-200 font-medium">{decisionBrief.question}</span>
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 font-mono text-slate-400">
            <div className="flex sm:justify-end items-center space-x-1">
              <Hash className="w-3.5 h-3.5" />
              <span>{decisionBrief.brief_id}</span>
            </div>
            <div className="flex sm:justify-end items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{decisionBrief.generated_at}</span>
            </div>
          </div>
        </div>

        {/* Readiness State Card */}
        <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
          decisionBrief.decision_readiness_status === 'READY_FOR_SCENARIO_ANALYSIS'
            ? 'bg-teal-950/30 border-teal-800/60'
            : decisionBrief.decision_readiness_status === 'PARTIALLY_ASSESSABLE'
              ? 'bg-amber-950/30 border-amber-800/60'
              : 'bg-red-950/30 border-red-800/60'
        }`}>
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Decision Readiness Status: <span className="text-white font-mono font-bold">{decisionBrief.decision_readiness_status}</span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              {decisionBrief.readiness_reason}
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Executive Assessment
          </h3>
          <p className="text-sm text-slate-200 bg-slate-900/80 p-4 rounded-xl border border-slate-800 leading-relaxed font-sans">
            {decisionBrief.executive_summary}
          </p>
        </div>

        {/* Key Numerical Baseline Metrics */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            2. Verified Financial Calculations
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Monthly EMI</div>
              <div className="text-base font-bold text-white mt-0.5">
                {formatINR(decisionBrief.baseline_calculations.monthly_emi)}/mo
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Interest</div>
              <div className="text-base font-bold text-blue-300 mt-0.5">
                {formatINR(decisionBrief.baseline_calculations.total_interest)}
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Effective APR</div>
              <div className="text-base font-bold text-amber-300 mt-0.5">
                {decisionBrief.baseline_calculations.effective_apr_pct}%
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Remaining Surplus</div>
              <div className="text-base font-bold text-teal-300 mt-0.5">
                {formatINR(decisionBrief.baseline_calculations.post_commitment_surplus)}/mo
              </div>
            </div>
          </div>
        </div>

        {/* Decision-Critical Unknowns Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>3. Decision-Critical Missing Information</span>
          </h3>
          <div className="space-y-2">
            {decisionBrief.decision_critical_unknowns.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-900/90 border border-amber-900/40 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span>{item.name}</span>
                  <span className="text-amber-400 font-mono text-[11px]">{item.value}</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  <span className="text-slate-400 font-medium">Impact: </span>
                  {item.impact_description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stress Test & Downside Resilience */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            4. Scenario Stress-Test Highlights
          </h3>
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-200">
            <ul className="list-disc list-inside space-y-1">
              {decisionBrief.stress_test_highlights.map((h, idx) => (
                <li key={idx}>{h}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trade-Offs Identified */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            5. Key Trade-Offs
          </h3>
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-200">
            <ul className="list-disc list-inside space-y-1">
              {decisionBrief.tradeoffs_identified.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">
            6. Mandatory Questions to Ask Lender
          </h3>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
            {decisionBrief.verification_checklist_for_lender.map((q, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="font-bold text-teal-400 shrink-0">{idx + 1}.</span>
                <span className="text-slate-200">{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Next Steps */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            7. Actionable Next Steps
          </h3>
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-200">
            <ol className="list-decimal list-inside space-y-1">
              {decisionBrief.suggested_next_steps.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Audit Footer & Disclaimer */}
        <div className="border-t border-slate-800 pt-4 text-[11px] text-slate-500 space-y-1 font-mono">
          <div className="flex justify-between flex-wrap gap-2">
            <span>Engine: {decisionBrief.audit_trail.engine_version}</span>
            <span>Math: {decisionBrief.audit_trail.calculation_methodology}</span>
          </div>
          <p className="text-[10px] text-slate-600 mt-2 font-sans">
            Disclaimer: Neev is an educational financial decision support system, not a SEBI/RBI registered investment advisor or credit broker. Calculations are based on deterministic mathematical models and user-supplied parameters. Verify all terms with your lender before financial commitment.
          </p>
        </div>

      </div>

    </div>
  );
}
