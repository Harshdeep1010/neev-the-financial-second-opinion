from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from ..schemas.offer import OfferInput, OfferAnalysisResponse
from ..schemas.profile import PersonalProfileInput
from ..services.llm_extractor import extract_offer_with_gemini
from ..services.calculations import evaluate_loan_affordability
from ..services.decision_engine import build_known_estimated_unknown, evaluate_decision_readiness

router = APIRouter(prefix="/api/offer", tags=["offer"])

class OfferAnalyzeRequest(BaseModel):
    offer: OfferInput
    profile: Optional[PersonalProfileInput] = None

@router.post("/analyze", response_model=OfferAnalysisResponse)
async def analyze_offer(payload: OfferAnalyzeRequest):
    """
    Ingests financial offer (raw text or manual terms), extracts structured variables,
    calculates deterministic loan mechanics, maps Known/Estimated/Unknown,
    and returns Decision Readiness status with verification checklist.
    """
    offer = payload.offer
    profile = payload.profile
    
    # 1. Structured extraction if raw text is provided
    extracted_data = {}
    if offer.raw_text and offer.raw_text.strip():
        extracted_data = await extract_offer_with_gemini(offer.raw_text)
    
    # Merge explicit manual overrides over extracted values
    principal = offer.principal if offer.principal is not None else (extracted_data.get("principal") or 800000.0)
    annual_rate = offer.annual_interest_rate_pct if offer.annual_interest_rate_pct is not None else (extracted_data.get("annual_interest_rate_pct") if extracted_data.get("annual_interest_rate_pct") is not None else 10.5)
    tenure_months = offer.tenure_months if offer.tenure_months is not None else (extracted_data.get("tenure_months") or 48)
    rate_type = offer.interest_rate_type if offer.interest_rate_type != "unknown" else extracted_data.get("interest_rate_type", "unknown")
    
    proc_fee_amt = offer.processing_fee_amount
    if proc_fee_amt is None and offer.processing_fee_pct is not None:
        proc_fee_amt = principal * (offer.processing_fee_pct / 100.0)
    elif proc_fee_amt is None and extracted_data.get("processing_fee_amount") is not None:
        proc_fee_amt = extracted_data.get("processing_fee_amount")
    elif proc_fee_amt is None and extracted_data.get("processing_fee_pct") is not None:
        proc_fee_amt = principal * (extracted_data.get("processing_fee_pct") / 100.0)
        
    prepay_disclosed = offer.prepayment_penalty_disclosed if offer.prepayment_penalty_disclosed is not None else extracted_data.get("prepayment_penalty_disclosed", False)
    
    merged_offer_dict = {
        "principal": principal,
        "annual_interest_rate_pct": annual_rate,
        "tenure_months": tenure_months,
        "interest_rate_type": rate_type,
        "processing_fee_amount": proc_fee_amt,
        "processing_fee_pct": offer.processing_fee_pct if offer.processing_fee_pct is not None else extracted_data.get("processing_fee_pct"),
        "prepayment_penalty_disclosed": prepay_disclosed,
        "lender_name": extracted_data.get("lender_name"),
        "extraction_method": extracted_data.get("extraction_method", "manual_or_default"),
        "stated_emi": offer.stated_emi if offer.stated_emi is not None else extracted_data.get("stated_emi")
    }
    
    # 2. Deterministic Financial Calculations
    calculations = evaluate_loan_affordability(
        principal=principal,
        annual_rate_pct=annual_rate,
        tenure_months=tenure_months,
        rate_type=rate_type,
        processing_fee=proc_fee_amt,
        profile=profile
    )
    
    # 3. Known / Estimated / Unknown Framework
    knowns, estimateds, unknowns, critical_unknowns = build_known_estimated_unknown(
        parsed_offer=merged_offer_dict,
        calculations=calculations,
        profile=profile
    )
    
    # 4. Decision Readiness Assessment
    readiness_status, readiness_reason, recommended_action, checklist = evaluate_decision_readiness(
        parsed_offer=merged_offer_dict,
        critical_unknowns=critical_unknowns,
        calculations=calculations,
        profile=profile
    )
    
    # 5. Pressure / Scam signals
    pressure_flags = extracted_data.get("pressure_signals", [])
    
    return OfferAnalysisResponse(
        parsed_offer=merged_offer_dict,
        calculations=calculations,
        knowns=knowns,
        estimateds=estimateds,
        unknowns=unknowns,
        critical_unknowns=critical_unknowns,
        readiness_status=readiness_status,
        readiness_reason=readiness_reason,
        recommended_action=recommended_action,
        verification_checklist=checklist,
        scam_or_pressure_flags=pressure_flags
    )
