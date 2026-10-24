import React, { useState } from 'react';
import { useDecision } from '../context/DecisionContext';
import { formatINR } from '../utils/formatters';
import { DEMO_PRESETS } from '../utils/presets';
import { 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  SlidersHorizontal, 
  FileText, 
  TrendingUp, 
  Home, 
  ChevronDown 
} from 'lucide-react';

export default function Navbar() {
  const { 
    profile, 
    profileAnalysis, 
    setIsProfileModalOpen, 
    loadPreset,
    activeTab,
    setActiveTab,
    decisionBrief
  } = useDecision();

  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('loan')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">Neev</span>
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Second Opinion
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Before you commit, understand.</p>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('loan')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'loan'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Loan & Offers</span>
            </button>

            <button
              onClick={() => setActiveTab('investments')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'investments'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Investment Risk</span>
            </button>

            <button
              onClick={() => setActiveTab('property')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'property'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Property / Rent vs Buy</span>
            </button>

            {decisionBrief && (
              <button
                onClick={() => setActiveTab('brief')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'brief'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-teal-400 hover:text-teal-300 hover:bg-teal-950/40'
                }`}
              >
                <Sparkles className="w-4 h-4 text-teal-300" />
                <span>Decision Brief</span>
              </button>
            )}
          </nav>

          {/* Right Action Bar: Presets & Profile Pill */}
          <div className="flex items-center space-x-3">
            
            {/* 1-Click Demo Scenarios Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">1-Click Demo Presets</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {presetDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                    Select Test Scenario
                  </div>
                  {DEMO_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        loadPreset(p.id);
                        setPresetDropdownOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 transition group mb-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-100 group-hover:text-blue-400">
                          {p.title}
                        </span>
                        <span className="text-[10px] bg-slate-800 group-hover:bg-blue-900/60 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                          {p.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {p.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Status Pill */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-700 transition text-left"
            >
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <UserCheck className="w-4 h-4 text-teal-400" />
              </div>
              <div className="hidden lg:block">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Your Cashflow
                </div>
                <div className="text-xs font-semibold text-slate-100">
                  {profileAnalysis ? `${formatINR(profileAnalysis.monthly_surplus)}/mo surplus` : `${formatINR(profile.monthly_income)}/mo`}
                </div>
              </div>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
