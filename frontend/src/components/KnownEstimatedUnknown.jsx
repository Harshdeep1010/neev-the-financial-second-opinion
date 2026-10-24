import React, { useState } from 'react';
import { useDecision } from '../context/DecisionContext';
import { 
  CheckCircle, 
  Calculator, 
  HelpCircle, 
  AlertTriangle, 
  Info,
  Copy,
  Check
} from 'lucide-react';

export default function KnownEstimatedUnknown() {
  const { analysisResult } = useDecision();
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!analysisResult) return null;

  const { knowns, estimateds, unknowns, critical_unknowns } = analysisResult;

  const copyQuestion = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Known / Estimated / Unknown Framework</span>
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-normal">
              Mandatory Evidence Separation
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every financial claim is strictly categorized into verified facts, transparent estimates, and decision-critical gaps.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1 text-teal-400">
            <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
            <span>{knowns.length} Known</span>
          </span>
          <span className="flex items-center space-x-1 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            <span>{estimateds.length} Estimated</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span>{critical_unknowns.length} Critical Unknowns</span>
          </span>
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* 1. KNOWN COLUMN */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Known Facts ({knowns.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Explicitly Provided</span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {knowns.map((item, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-teal-500/30 transition group"
              >
                <div className="text-[11px] font-medium text-slate-400">
                  {item.name}
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {item.value}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center space-x-1">
                  <span>Source:</span>
                  <span className="text-slate-400 truncate">{item.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. ESTIMATED COLUMN */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Calculator className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Estimated Values ({estimateds.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Deterministic Math</span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {estimateds.map((item, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-blue-500/30 transition"
              >
                <div className="text-[11px] font-medium text-slate-400">
                  {item.name}
                </div>
                <div className="text-sm font-bold text-blue-300 mt-0.5">
                  {item.value}
                </div>
                {item.impact_description && (
                  <div className="text-[11px] text-slate-300 mt-1 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                    {item.impact_description}
                  </div>
                )}
                <div className="text-[10px] text-slate-500 mt-1.5 flex items-center space-x-1">
                  <span>Formula:</span>
                  <span className="text-slate-400 line-clamp-1">{item.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. UNKNOWN COLUMN (HIGHLIGHTING CRITICAL UNKNOWNS) */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Decision-Critical Unknowns ({unknowns.length})
              </h3>
            </div>
            <span className="text-[10px] text-amber-300 font-semibold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
              Verify Before Signing
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {unknowns.map((item, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl transition border ${
                  item.is_critical 
                    ? 'bg-amber-950/20 border-amber-800/50 shadow-sm shadow-amber-950/40' 
                    : 'bg-slate-900/80 border-slate-800/90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-200">
                    {item.name}
                  </span>
                  {item.is_critical && (
                    <span className="text-[9px] uppercase tracking-wider font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                      Critical Gap
                    </span>
                  )}
                </div>

                <div className="text-xs text-amber-300 font-medium mt-0.5">
                  Status: {item.value}
                </div>

                {item.impact_description && (
                  <p className="text-[11px] text-slate-300 mt-1.5 bg-slate-900/70 p-2 rounded-lg border border-slate-800">
                    <span className="font-semibold text-amber-400">Why it matters: </span>
                    {item.impact_description}
                  </p>
                )}

                {item.verification_question && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold text-teal-400">Ask Lender:</span>
                      <button
                        onClick={() => copyQuestion(item.verification_question, idx)}
                        className="flex items-center space-x-1 text-slate-400 hover:text-white transition"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-teal-400" />
                            <span className="text-teal-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Question</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs italic text-slate-200 font-sans bg-slate-950/50 p-2 rounded border border-slate-800/80">
                      "{item.verification_question}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
