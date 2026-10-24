from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ..schemas.market import (
    InvestmentAnalysisInput, InvestmentAnalysisResponse,
    PropertyAnalysisInput, PropertyAnalysisResponse
)
from ..schemas.profile import PersonalProfileInput
from ..services.data_service import analyze_investment_candidates, evaluate_property_affordability
from ..services.ml_engine import ml_service

router = APIRouter(prefix="/api/market", tags=["market"])

class InvestmentRequest(BaseModel):
    investment_input: InvestmentAnalysisInput
    profile: Optional[PersonalProfileInput] = None

class PropertyRequest(BaseModel):
    property_input: PropertyAnalysisInput
    profile: Optional[PersonalProfileInput] = None

@router.post("/investments", response_model=InvestmentAnalysisResponse)
async def analyze_investments(payload: InvestmentRequest):
    """
    Evaluates benchmark assets against personal capital, horizon, and trained ML regime predictions.
    """
    return analyze_investment_candidates(
        capital=payload.investment_input.available_capital,
        horizon_months=payload.investment_input.investment_horizon_months,
        user_risk=payload.investment_input.user_risk_tolerance,
        profile=payload.profile
    )

@router.post("/property", response_model=PropertyAnalysisResponse)
async def analyze_property(payload: PropertyRequest):
    """
    Evaluates home purchase affordability, down-payment liquidity impact, and rent-vs-buy breakeven.
    """
    return evaluate_property_affordability(
        input_data=payload.property_input,
        profile=payload.profile
    )

@router.get("/ml-metadata")
async def get_ml_metadata() -> Dict[str, Any]:
    """
    Exposes authentic evaluation metrics, chronological test split details,
    baseline comparisons, and documented limitations of the trained ML model.
    """
    return ml_service.metrics
