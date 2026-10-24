import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { DEMO_PRESETS } from '../utils/presets';

const DecisionContext = createContext();

export function DecisionProvider({ children }) {
  // Navigation
  const [activeTab, setActiveTab] = useState('loan'); // 'loan' | 'investments' | 'property' | 'brief'
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Profile State (Defaulting to Aakash preset for instant usability)
  const [profile, setProfile] = useState(DEMO_PRESETS[0].profile);
  const [profileAnalysis, setProfileAnalysis] = useState(null);

  // Offer State
  const [offerInput, setOfferInput] = useState(DEMO_PRESETS[0].offer);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Scenario Simulator State
  const [scenarioAssumptions, setScenarioAssumptions] = useState({
    income_delta_pct: 0,
    rate_delta_pct: 0,
    expense_delta_pct: 0,
    tenure_delta_months: 0,
    prepayment_lump_sum: 0
  });
  const [scenarioResult, setScenarioResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Decision Brief
  const [decisionBrief, setDecisionBrief] = useState(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  // Auto-analyze profile on change
  useEffect(() => {
    if (profile && profile.monthly_income > 0) {
      api.analyzeProfile(profile)
        .then(setProfileAnalysis)
        .catch(err => console.error("Profile analysis error:", err));
    }
  }, [profile]);

  // Handle Preset Selection
  const loadPreset = (presetId) => {
    const selected = DEMO_PRESETS.find(p => p.id === presetId);
    if (!selected) return;

    setProfile(selected.profile);
    setOfferInput(selected.offer);
    setAnalysisResult(null);
    setScenarioResult(null);
    setDecisionBrief(null);
    setScenarioAssumptions({
      income_delta_pct: 0,
      rate_delta_pct: 0,
      expense_delta_pct: 0,
      tenure_delta_months: 0,
      prepayment_lump_sum: 0
    });

    // Auto-trigger analysis for seamless judging UX
    setIsAnalyzing(true);
    setAnalysisError(null);
    api.analyzeOffer(selected.offer, selected.profile)
      .then(res => {
        setAnalysisResult(res);
        setIsAnalyzing(false);
      })
      .catch(err => {
        console.error("Analysis error:", err);
        setAnalysisError(err.message);
        setIsAnalyzing(false);
      });
  };

  // Trigger Offer Analysis
  const runOfferAnalysis = async (customOffer = null) => {
    const targetOffer = customOffer || offerInput;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await api.analyzeOffer(targetOffer, profile);
      setAnalysisResult(res);
      // Reset scenario and brief on new offer
      setScenarioResult(null);
      setDecisionBrief(null);
      return res;
    } catch (err) {
      console.error("Offer analysis failed:", err);
      setAnalysisError(err.message || "Failed to analyze offer");
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger Scenario Stress Test
  const runScenarioSimulation = async (updatedAssumptions) => {
    const assumptions = updatedAssumptions || scenarioAssumptions;
    if (!analysisResult) return;
    setIsSimulating(true);
    try {
      const payload = {
        profile,
        offer: {
          principal: analysisResult.calculations.principal,
          annual_interest_rate_pct: analysisResult.calculations.annual_interest_rate_pct,
          tenure_months: analysisResult.calculations.tenure_months,
          interest_rate_type: analysisResult.parsed_offer.interest_rate_type,
          processing_fee_amount: analysisResult.calculations.processing_fee_estimated
        },
        income_delta_pct: Number(assumptions.income_delta_pct) || 0,
        rate_delta_pct: Number(assumptions.rate_delta_pct) || 0,
        expense_delta_pct: Number(assumptions.expense_delta_pct) || 0,
        tenure_delta_months: Number(assumptions.tenure_delta_months) || 0,
        prepayment_lump_sum: Number(assumptions.prepayment_lump_sum) || 0
      };
      const res = await api.simulateScenario(payload);
      setScenarioResult(res);
    } catch (err) {
      console.error("Scenario simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Generate Final Decision Brief
  const compileDecisionBrief = async () => {
    if (!analysisResult) return;
    setIsGeneratingBrief(true);
    try {
      const payload = {
        decision_question: "Should I commit to this financial offer under my current circumstances?",
        profile,
        offer_analysis: analysisResult,
        scenario_result: scenarioResult
      };
      const brief = await api.getDecisionBrief(payload);
      setDecisionBrief(brief);
      setActiveTab('brief');
    } catch (err) {
      console.error("Error generating brief:", err);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  return (
    <DecisionContext.Provider value={{
      activeTab,
      setActiveTab,
      isProfileModalOpen,
      setIsProfileModalOpen,
      profile,
      setProfile,
      profileAnalysis,
      offerInput,
      setOfferInput,
      analysisResult,
      isAnalyzing,
      analysisError,
      scenarioAssumptions,
      setScenarioAssumptions,
      scenarioResult,
      isSimulating,
      decisionBrief,
      isGeneratingBrief,
      loadPreset,
      runOfferAnalysis,
      runScenarioSimulation,
      compileDecisionBrief
    }}>
      {children}
    </DecisionContext.Provider>
  );
}

export function useDecision() {
  return useContext(DecisionContext);
}
