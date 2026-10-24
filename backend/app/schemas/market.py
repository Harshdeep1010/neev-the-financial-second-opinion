from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class InvestmentAnalysisInput(BaseModel):
    available_capital: float = Field(..., ge=1000, description="Amount user has available to allocate in INR")
    investment_horizon_months: int = Field(default=36, ge=6, description="Planned holding horizon in months")
    user_risk_tolerance: str = Field(default="moderate", description="conservative | moderate | aggressive")
    competing_goal_lockin_months: Optional[int] = Field(default=None, description="E.g. if capital needed for downpayment in 24 months")

class AssetPerformanceCard(BaseModel):
    symbol: str
    name: str
    asset_class: str
    cagr_5y_pct: float
    annualized_volatility_pct: float
    max_drawdown_historical_pct: float
    worst_1y_return_pct: float
    best_1y_return_pct: float
    ml_volatility_regime: str
    regime_confidence_pct: float
    suitability_verdict: str
    tradeoff_warning: str

class InvestmentAnalysisResponse(BaseModel):
    capital: float
    horizon_months: int
    asset_comparisons: List[AssetPerformanceCard]
    ml_model_metadata: Dict[str, Any]
    goal_conflict_warning: Optional[str]
    unknowns_and_limitations: List[str]

class PropertyAnalysisInput(BaseModel):
    property_price: float = Field(..., ge=100000, description="Total purchase price in INR")
    down_payment_saved: float = Field(..., ge=0, description="Cash available for down payment")
    interest_rate_pct: float = Field(default=8.75, ge=5.0, le=20.0, description="Home loan annual interest rate")
    tenure_years: int = Field(default=20, ge=5, le=30, description="Loan tenure in years")
    alternative_current_rent: float = Field(default=25000, ge=0, description="Current monthly rent paid")
    holding_period_years: int = Field(default=10, ge=3, le=30, description="Anticipated ownership horizon")

class PropertyAnalysisResponse(BaseModel):
    property_price: float
    stamp_duty_and_registration: float
    total_upfront_cash_required: float
    loan_amount_needed: float
    monthly_home_loan_emi: float
    monthly_maintenance_tax_estimate: float
    total_monthly_ownership_cost: float
    net_monthly_cost_difference_vs_rent: float
    emergency_fund_depletion_warning: Optional[str]
    rent_vs_buy_verdict: str
    known_facts: List[str]
    decision_critical_unknowns: List[str]
    verification_checklist: List[str]
