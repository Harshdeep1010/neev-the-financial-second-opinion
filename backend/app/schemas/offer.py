from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class OfferInput(BaseModel):
    raw_text: Optional[str] = Field(default="", description="Pasted loan offer text, SMS, email, or advertisement")
    principal: Optional[float] = Field(default=None, ge=1000, description="Principal loan amount in INR")
    annual_interest_rate_pct: Optional[float] = Field(default=None, ge=0.1, le=100.0, description="Annual nominal interest rate %")
    tenure_months: Optional[int] = Field(default=None, ge=1, le=360, description="Tenure in months")
    interest_rate_type: Optional[str] = Field(default="unknown", description="fixed | floating | reducing | flat | unknown")
    processing_fee_pct: Optional[float] = Field(default=None, ge=0, description="Processing fee percentage if known")
    processing_fee_amount: Optional[float] = Field(default=None, ge=0, description="Explicit processing fee in INR")
    prepayment_penalty_disclosed: Optional[bool] = Field(default=None, description="Whether prepayment conditions are explicitly stated")
    stated_emi: Optional[float] = Field(default=None, ge=0, description="EMI if explicitly written in the offer")

class TermItem(BaseModel):
    name: str
    value: Any
    category: str  # "known" | "estimated" | "unknown"
    confidence: str # "high" | "inferred" | "unverified"
    source: str    # "User Input" | "Extracted from text" | "Calculated via reducing balance" | "Industry benchmark assumption"
    is_critical: bool = False
    impact_description: Optional[str] = None
    verification_question: Optional[str] = None

class LoanCalculationsOutput(BaseModel):
    principal: float
    annual_interest_rate_pct: float
    tenure_months: int
    interest_rate_type: str
    monthly_emi: float
    total_repayment: float
    total_interest: float
    processing_fee_estimated: float
    net_disbursed_amount: float
    effective_apr_pct: float
    
    # Financial context impact (if profile provided)
    baseline_dti_pct: float
    post_commitment_dti_pct: float
    baseline_surplus: float
    post_commitment_surplus: float
    surplus_depletion_pct: float
    affordability_grade: str # "COMFORTABLE" | "STRETCHED" | "CRITICAL_BURDEN"
    affordability_explanation: str

class OfferAnalysisResponse(BaseModel):
    parsed_offer: Dict[str, Any]
    calculations: LoanCalculationsOutput
    knowns: List[TermItem]
    estimateds: List[TermItem]
    unknowns: List[TermItem]
    critical_unknowns: List[TermItem]
    readiness_status: str  # "INSUFFICIENT_INFORMATION" | "PARTIALLY_ASSESSABLE" | "READY_FOR_SCENARIO_ANALYSIS"
    readiness_reason: str
    recommended_action: str
    verification_checklist: List[str]
    scam_or_pressure_flags: List[str]
