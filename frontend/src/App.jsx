import React from 'react';
import { DecisionProvider, useDecision } from './context/DecisionContext';
import Navbar from './components/Navbar';
import ProfileModal from './components/ProfileModal';
import OfferInput from './components/OfferInput';
import KnownEstimatedUnknown from './components/KnownEstimatedUnknown';
import DecisionReadinessMeter from './components/DecisionReadinessMeter';
import ScenarioSimulator from './components/ScenarioSimulator';
import DecisionBriefView from './components/DecisionBriefView';
import MarketIntelligenceView from './components/MarketIntelligenceView';
import PropertyIntelligenceView from './components/PropertyIntelligenceView';
import { ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

function MainAppContent() {
  const { activeTab, setActiveTab, analysisResult } = useDecision();

  const scrollToScenario = () => {
    const el = document.getElementById('scenario-simulator-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-slate-100 selection:bg-blue-600 selection:text-white">
      <Navbar />
      <ProfileModal />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Loan & Offer Journey (P0 Core) */}
        {activeTab === 'loan' && (
          <div className="space-y-8">
            
            {/* Top Brand Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-teal-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-teal-400 block mb-1">
                  Financial Second Opinion
                </span>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  Before you commit, understand.
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Financial decisions should respond to your actual circumstances, not generic rules. 
                  Neev combines deterministic mathematics, structured offer extraction, and decision-critical unknowns to evaluate whether you are truly ready to commit.
                </p>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0">
                <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>100% Deterministic Math</span>
                </div>
                <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>Unbiased Second Opinion</span>
                </div>
              </div>
            </div>

            {/* Offer Ingestion Component */}
            <OfferInput />

            {/* If Analysis is Ready: Render K/E/U, Readiness, and Scenario Simulator */}
            {analysisResult && (
              <>
                <KnownEstimatedUnknown />
                
                <DecisionReadinessMeter onProceedToScenario={scrollToScenario} />

                <ScenarioSimulator />
              </>
            )}

          </div>
        )}

        {/* Investment Risk Journey (Module C) */}
        {activeTab === 'investments' && (
          <MarketIntelligenceView />
        )}

        {/* Property Journey (Module D) */}
        {activeTab === 'property' && (
          <PropertyIntelligenceView />
        )}

        {/* Executive Decision Brief */}
        {activeTab === 'brief' && (
          <DecisionBriefView />
        )}

      </main>

      {/* Trust & Transparency Footer */}
      <footer className="border-t border-slate-800 bg-[#070B14] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">Neev</span>
            <span>— Your Financial Second Opinion.</span>
          </div>

          <div className="flex items-center space-x-4">
            <span>Deterministic Core</span>
            <span>•</span>
            <span>Known / Estimated / Unknown</span>
            <span>•</span>
            <span>Decision Readiness</span>
          </div>

          <div className="text-slate-600 text-[11px]">
            Educational Decision Support Hackathon Prototype
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <DecisionProvider>
      <MainAppContent />
    </DecisionProvider>
  );
}
