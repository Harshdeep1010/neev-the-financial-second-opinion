from pydantic import BaseModel, Field
from typing import Optional, List

class PersonalProfileInput(BaseModel):
    monthly_income: float = Field(..., ge=0, description="Monthly in-hand post-tax income in INR")
    monthly_essential_expenses: float = Field(..., ge=0, description="Monthly non-negotiable living expenses (rent, food, utilities)")
    current_savings: float = Field(default=0.0, ge=0, description="Total liquid and semi-liquid savings")
    emergency_savings: Optional[float] = Field(default=0.0, ge=0, description="Designated emergency fund")
    existing_debts: Optional[float] = Field(default=0.0, ge=0, description="Total outstanding debt principal")
    existing_monthly_emi: Optional[float] = Field(default=0.0, ge=0, description="Current monthly debt repayments / EMIs")
    primary_goal: Optional[str] = Field(default="Preserve liquidity & manage commitments", description="Main stated financial objective")
    target_horizon_months: Optional[int] = Field(default=36, ge=1, description="Investment / goal horizon in months")
    risk_tolerance: Optional[str] = Field(default="moderate", description="conservative | moderate | aggressive")

class ProfileAnalysisOutput(BaseModel):
    monthly_income: float
    monthly_essential_expenses: float
    existing_monthly_emi: float
    monthly_surplus: float
    debt_to_income_ratio_pct: float
    emergency_fund_months: float
    savings_rate_pct: float
    health_assessment: str
    key_vulnerabilities: List[str]
    capacity_for_new_commitment: float
