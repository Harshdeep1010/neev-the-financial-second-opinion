from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from ..schemas.decision import DecisionBriefResponse, ScenarioSimulateResponse
from ..schemas.offer import OfferAnalysisResponse
from ..schemas.profile import PersonalProfileInput

router = APIRouter(prefix="/api/decision", tags=["decision"])

class CompileBriefRequest(BaseModel):
    decision_question: Optional[str] = "Should I commit to this personal loan offer?"
    profile: Optional[PersonalProfileInput] = None
    offer_analysis: OfferAnalysisResponse
    scenario_result: Optional[ScenarioSimulateResponse] = None

@router.post("/brief", response_model=DecisionBriefResponse)
async def generate_decision_brief(payload: CompileBriefRequest):
    """
    Compiles an audit-ready, evidence-based Decision Brief combining verified facts,
    deterministic calculations, critical unknowns, and verification checklist.
    """
    profile = payload.profile
    analysis = payload.offer_analysis
    scenario = payload.scenario_result
    calcs = analysis.calculations
    
    # Compose high-impact, non-generic executive summary
    if profile:
        exec_summary = (
            f"You are evaluating a loan of ₹{calcs.principal:,.0f} requiring ₹{calcs.monthly_emi:,.0f}/month for {calcs.tenure_months} months. "
            f"Against your monthly in-hand income of ₹{profile.monthly_income:,.0f}, this increases your Debt-to-Income ratio from "
            f"{calcs.baseline_dti_pct:.1f}% to {calcs.post_commitment_dti_pct:.1f}%, leaving a monthly surplus of ₹{calcs.post_commitment_surplus:,.0f}. "
            f"Current Decision Readiness is '{analysis.readiness_status}' due to {len(analysis.critical_unknowns)} decision-critical unknowns."
        )
    else:
        exec_summary = (
            f"The evaluated offer entails a principal of ₹{calcs.principal:,.0f} at {calcs.annual_interest_rate_pct:.2f}% p.a. for {calcs.tenure_months} months, "
            f"generating a monthly EMI of ₹{calcs.monthly_emi:,.0f} and lifetime interest of ₹{calcs.total_interest:,.0f}. "
            f"Current status is '{analysis.readiness_status}' pending verification of missing contractual terms."
        )

    # Stress test highlights
    stress_highlights = []
    if scenario:
        stress_highlights.extend(scenario.risk_alerts)
        if scenario.simulated_surplus < 0:
            stress_highlights.append(f"STRESS TEST BREACH: Downside scenario results in a monthly deficit of -₹{abs(scenario.simulated_surplus):,.0f}.")
        else:
            stress_highlights.append(f"STRESS TEST TOLERANCE: Monthly surplus shifts by {scenario.simulated_surplus - scenario.baseline_surplus:+,.0f} under tested shocks.")
    else:
        stress_highlights.append("Stress test not yet executed. Run 'What Changes My Decision?' to test interest rate and income sensitivities.")

    # Trade-offs identified
    tradeoffs = []
    tradeoffs.append(f"Committing ₹{calcs.monthly_emi:,.0f}/month reduces your free capital to allocate toward savings, property down payments, or emergency reserves.")
    if calcs.effective_apr_pct > calcs.annual_interest_rate_pct:
        tradeoffs.append(f"Due to upfront processing deductions, the effective borrowing rate is {calcs.effective_apr_pct:.2f}% (higher than the headline {calcs.annual_interest_rate_pct:.2f}%).")
    if profile and profile.emergency_fund_months < 6:
        tradeoffs.append(f"Your emergency cushion ({profile.emergency_fund_months:.1f} months) is below the recommended 6-month threshold; servicing this debt increases default vulnerability if income is disrupted.")

    # Next steps
    next_steps = [
        "Present the lender verification checklist to the loan officer and request written clarification.",
        "Obtain the final Key Fact Statement (KFS) / Loan Agreement before executing signature or accepting disbursement.",
        "Ensure processing fee is explicitly documented and not deducted without prior consent."
    ]

    brief_id = f"DB-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    audit_trail = {
        "engine_version": "Neev Decision Core v1.0",
        "calculation_methodology": "Deterministic monthly reducing balance compound model (Act/365)",
        "rate_structure_confidence": "High" if analysis.parsed_offer.get("interest_rate_type") != "unknown" else "Unverified",
        "timestamp": datetime.now().isoformat()
    }

    return DecisionBriefResponse(
        brief_id=brief_id,
        generated_at=datetime.now().strftime("%d %b %Y, %H:%M IST"),
        decision_type="Loan / Credit Facility Evaluation",
        question=payload.decision_question or "Should I commit to this personal loan offer?",
        executive_summary=exec_summary,
        decision_readiness_status=analysis.readiness_status,
        readiness_reason=analysis.readiness_reason,
        known_facts=analysis.knowns,
        estimates_with_assumptions=analysis.estimateds,
        decision_critical_unknowns=analysis.critical_unknowns,
        baseline_calculations=calcs,
        stress_test_highlights=stress_highlights,
        tradeoffs_identified=tradeoffs,
        verification_checklist_for_lender=analysis.verification_checklist,
        suggested_next_steps=next_steps,
        audit_trail=audit_trail
    )
