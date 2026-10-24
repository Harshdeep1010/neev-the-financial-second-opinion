import React, { useState } from 'react';
import { useDecision } from '../context/DecisionContext';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight,
  ClipboardList,
  Copy,
  Check
} from 'lucide-react';

export default function DecisionReadinessMeter({ onProceedToScenario }) {
  const { analysisResult, compileDecisionBrief, isGeneratingBrief } = useDecision();
  const [checklistCopied, setChecklistCopied] = useState(false);

  if (!analysisResult) return null;

  const { readiness_status, readiness_reason, recommended_action, verification_checklist } = analysisResult;

  const getStatusConfig = () => {
    switch (readiness_status) {
      case 'READY_FOR_SCENARIO_ANALYSIS':
        return {
          label: 'Ready for Scenario Analysis',
          color: 'text-teal-400',
          bg: 'bg-teal-500/10',
          border: 'border-teal-500/30',
          badgeBg: 'bg-teal-500',
          icon: CheckCircle2,
          step: 3
        };
      case 'PARTIALLY_ASSESSABLE':
        return {
          label: 'Partially Assessable',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          badgeBg: 'bg-amber-500',
          icon: AlertTriangle,
          step: 2
        };
      case 'INSUFFICIENT_INFORMATION':
      default:
        return {
          label: 'Insufficient Information',
          color: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          badgeBg: 'bg-red-500',
          icon: AlertCircle,
          step: 1
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const copyFullChecklist = () => {
    const text = verification_checklist.map((q, idx) => `${idx + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text);
    setChecklistCopied(true);
    setTimeout(() => setChecklistCopied(false), 2000);
  };

  return (
    <div className={`p-6 rounded-2xl border ${config.border} ${config.bg} shadow-xl relative overflow-hidden transition-all`}>
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-start space-x-3.5">
          <div className={`p-2.5 rounded-xl ${config.bg} border ${config.border} shrink-0`}>
            <StatusIcon className={`w-7 h-7 ${config.color}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Decision Readiness Assessment
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-slate-900 ${config.badgeBg}`}>
                {config.label}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {readiness_reason}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 self-start md:self-center shrink-0">
          <button
            onClick={onProceedToScenario}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition"
          >
            <span>Stress Test Assumption (What Changes?)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Readiness Progress Gauge Bar */}
      <div className="py-4 border-b border-slate-800/60">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
          <span>1. Insufficient Information</span>
          <span>2. Partially Assessable</span>
          <span>3. Ready for Scenario Analysis</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5">
          <div className={`h-full rounded-full transition-all duration-500 ${config.step >= 1 ? 'bg-red-500 flex-1' : 'bg-slate-700 flex-1'}`} />
          <div className={`h-full rounded-full transition-all duration-500 ${config.step >= 2 ? 'bg-amber-500 flex-1' : 'bg-slate-700 flex-1'}`} />
          <div className={`h-full rounded-full transition-all duration-500 ${config.step >= 3 ? 'bg-teal-500 flex-1' : 'bg-slate-700 flex-1'}`} />
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          <span className="font-semibold text-slate-300">Recommended Next Step: </span>
          {recommended_action}
        </p>
      </div>

      {/* Verification Checklist */}
      {verification_checklist.length > 0 && (
        <div className="mt-4 pt-1">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2">
              <ClipboardList className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Actionable Verification Checklist for Lender
              </span>
            </div>
            <button
              onClick={copyFullChecklist}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded bg-slate-900/60 border border-slate-700/60"
            >
              {checklistCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-teal-400 font-semibold">Checklist Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All Questions</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {verification_checklist.map((item, idx) => (
              <div 
                key={idx}
                className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 flex items-start space-x-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 text-[10px] font-bold border border-blue-500/20">
                  {idx + 1}
                </span>
                <span className="mt-0.5">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
