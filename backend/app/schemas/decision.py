from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from .profile import PersonalProfileInput, ProfileAnalysisOutput
from .offer import OfferInput, LoanCalculationsOutput, TermItem

class ScenarioSimulateInput(BaseModel):
    profile: PersonalProfileInput
    offer: OfferInput
    
    # Stress assumptions
    income_delta_pct: float = Field(default=0.0, description="Percentage change in monthly income, e.g. -15.0 for 15% reduction")
    rate_delta_pct: float = Field(default=0.0, description="Absolute change in interest rate %, e.g. +2.0 for 2% hike")
    expense_delta_pct: float = Field(default=0.0, description="Percentage increase in non-negotiable living expenses")
    tenure_delta_months: int = Field(default=0, description="Tenure change in months, e.g. +12 or -12")
    prepayment_lump_sum: float = Field(default=0.0, ge=0, description="Simulated partial prepayment amount")

class ScenarioMetricPair(BaseModel):
    metric_name: str
    baseline_value: float
    simulated_value: float
    delta_value: float
    delta_pct: float
    unit: str
    status: str # "favorable" | "warning" | "critical" | "neutral"

class ScenarioSimulateResponse(BaseModel):
    baseline_emi: float
    simulated_emi: float
    baseline_surplus: float
    simulated_surplus: float
    baseline_dti: float
    simulated_dti: float
    baseline_total_interest: float
    simulated_total_interest: float
    metrics_comparison: List[ScenarioMetricPair]
    risk_alerts: List[str]
    verdict: str
    what_changed_explanation: str

class DecisionBriefResponse(BaseModel):
    brief_id: str
    generated_at: str
    decision_type: str
    question: str
    executive_summary: str
    decision_readiness_status: str
    readiness_reason: str
    known_facts: List[TermItem]
    estimates_with_assumptions: List[TermItem]
    decision_critical_unknowns: List[TermItem]
    baseline_calculations: LoanCalculationsOutput
    stress_test_highlights: List[str]
    tradeoffs_identified: List[str]
    verification_checklist_for_lender: List[str]
    suggested_next_steps: List[str]
    audit_trail: Dict[str, Any]
