from typing import List, Dict, Any, Tuple, Optional
from ..schemas.offer import TermItem, OfferInput, LoanCalculationsOutput
from ..schemas.profile import PersonalProfileInput

def build_known_estimated_unknown(
    parsed_offer: Dict[str, Any],
    calculations: LoanCalculationsOutput,
    profile: Optional[PersonalProfileInput] = None
) -> Tuple[List[TermItem], List[TermItem], List[TermItem], List[TermItem]]:
    """
    Constructs the Known, Estimated, and Unknown matrix, isolating decision-critical ambiguities.
    """
    knowns: List[TermItem] = []
    estimateds: List[TermItem] = []
    unknowns: List[TermItem] = []
    critical_unknowns: List[TermItem] = []
    
    # 1. EVALUATE KNOWN TERMS
    if parsed_offer.get("principal"):
        knowns.append(TermItem(
            name="Loan Principal Amount",
            value=f"₹{parsed_offer['principal']:,.0f}",
            category="known",
            confidence="high",
            source="Offer text extraction / user entry",
            is_critical=False
        ))
        
    if parsed_offer.get("annual_interest_rate_pct"):
        knowns.append(TermItem(
            name="Stated Annual Interest Rate",
            value=f"{parsed_offer['annual_interest_rate_pct']:.2f}% p.a.",
            category="known",
            confidence="high",
            source="Explicitly stated in offer",
            is_critical=False
        ))
        
    if parsed_offer.get("tenure_months"):
        knowns.append(TermItem(
            name="Loan Tenure",
            value=f"{parsed_offer['tenure_months']} months ({parsed_offer['tenure_months']//12} yrs {parsed_offer['tenure_months']%12} mos)",
            category="known",
            confidence="high",
            source="Explicitly stated in offer",
            is_critical=False
        ))

    if profile:
        knowns.append(TermItem(
            name="User Monthly In-Hand Income",
            value=f"₹{profile.monthly_income:,.0f}",
            category="known",
            confidence="high",
            source="Personal Financial Profile",
            is_critical=False
        ))
        knowns.append(TermItem(
            name="User Fixed Living Expenses",
            value=f"₹{profile.monthly_essential_expenses:,.0f}",
            category="known",
            confidence="high",
            source="Personal Financial Profile",
            is_critical=False
        ))

    # 2. EVALUATE ESTIMATED TERMS (Transparent calculations with assumptions)
    estimateds.append(TermItem(
        name="Calculated Monthly EMI",
        value=f"₹{calculations.monthly_emi:,.0f}",
        category="estimated",
        confidence="inferred",
        source="Deterministic reducing balance formula (1/12th annual rate compounding)",
        impact_description="Determines recurring monthly cash outflow for the full tenure."
    ))

    markup_pct = (calculations.total_interest / calculations.principal * 100.0) if calculations.principal > 0 else 0.0
    estimateds.append(TermItem(
        name="Total Interest Cost Over Tenure",
        value=f"₹{calculations.total_interest:,.0f}",
        category="estimated",
        confidence="inferred",
        source="Total payments (EMI * tenure) minus Principal",
        impact_description=f"Represents a {markup_pct:.1f}% markup over the borrowed capital."
    ))

    estimateds.append(TermItem(
        name="Effective Annual Percentage Rate (APR)",
        value=f"{calculations.effective_apr_pct:.2f}%",
        category="estimated",
        confidence="inferred",
        source="Internal Rate of Return (IRR) factoring upfront processing fees",
        impact_description="The real borrowing cost exceeds the nominal headline rate."
    ))

    if profile:
        if profile.monthly_income > 0:
            surplus_desc = f"Leaves {((calculations.post_commitment_surplus / profile.monthly_income)*100):.1f}% of your monthly income as discretionary room."
        else:
            surplus_desc = f"Net monthly surplus is ₹{calculations.post_commitment_surplus:,.0f} (no regular income declared)."
            
        estimateds.append(TermItem(
            name="Post-Commitment Free Monthly Surplus",
            value=f"₹{calculations.post_commitment_surplus:,.0f}",
            category="estimated",
            confidence="inferred",
            source=f"Income (₹{profile.monthly_income:,.0f}) - Living Expenses (₹{profile.monthly_essential_expenses:,.0f}) - All EMIs (₹{profile.existing_monthly_emi + calculations.monthly_emi:,.0f})",
            impact_description=surplus_desc
        ))

    # 3. EVALUATE UNKNOWNS & DECISION-CRITICAL GAPS
    
    # Interest Rate Type Unknown
    rate_type = parsed_offer.get("interest_rate_type", "unknown")
    if rate_type == "unknown":
        item = TermItem(
            name="Interest Rate Structure (Fixed vs Floating/Repo-Linked)",
            value="Undisclosed in Offer",
            category="unknown",
            confidence="unverified",
            source="Missing from offer copy",
            is_critical=True,
            impact_description="If floating, subsequent RBI repo rate hikes will increase your monthly EMI or extend your tenure.",
            verification_question="Is this interest rate fixed for the entire duration, or is it floating/linked to RBI repo rate / EBLR?"
        )
        unknowns.append(item)
        critical_unknowns.append(item)
    elif rate_type == "flat":
        item = TermItem(
            name="Flat vs Reducing Rate Disparity",
            value="Flat Rate Detected",
            category="unknown",
            confidence="unverified",
            source="Offer indicates flat rate",
            is_critical=True,
            impact_description=f"A flat rate of {parsed_offer.get('annual_interest_rate_pct', 0)}% equates to an effective reducing rate of approximately {(parsed_offer.get('annual_interest_rate_pct', 0) * 1.85):.1f}%.",
            verification_question="Can you confirm if interest is calculated on a reducing monthly balance or flat initial principal?"
        )
        unknowns.append(item)
        critical_unknowns.append(item)

    # Processing Fee Unknown
    if parsed_offer.get("processing_fee_pct") is None and parsed_offer.get("processing_fee_amount") is None:
        item = TermItem(
            name="Exact Processing & Documentation Fee",
            value="Undisclosed (Estimated at standard 2% + 18% GST)",
            category="unknown",
            confidence="unverified",
            source="Missing from offer copy",
            is_critical=True,
            impact_description=f"An undisclosed fee of 2-3% on ₹{calculations.principal:,.0f} means ₹{calculations.processing_fee_estimated:,.0f} will be deducted upfront from your disbursement.",
            verification_question="What is the total processing fee including 18% GST, and will it be deducted upfront from the disbursed amount?"
        )
        unknowns.append(item)
        critical_unknowns.append(item)

    # Prepayment & Foreclosure Penalty Unknown
    if not parsed_offer.get("prepayment_penalty_disclosed"):
        item = TermItem(
            name="Prepayment & Foreclosure Charges",
            value="Unspecified Terms",
            category="unknown",
            confidence="unverified",
            source="Missing from offer copy",
            is_critical=True,
            impact_description="Many lenders impose a 2% to 5% penalty or a mandatory lock-in period if you attempt to close early.",
            verification_question="Are there foreclosure or part-prepayment penalties? Is there a minimum lock-in period before I can prepay?"
        )
        unknowns.append(item)
        critical_unknowns.append(item)

    # Insurance Bundling / Hidden Surcharges
    item_ins = TermItem(
        name="Mandatory Loan Protection Insurance / Surcharges",
        value="Undisclosed in Headline Offer",
        category="unknown",
        confidence="unverified",
        source="Omitted in headline text",
        is_critical=False,
        impact_description="Lenders often bundle ₹5,000–₹25,000 in loan protection insurance directly into the financed principal.",
        verification_question="Does this loan require mandatory credit shield or loan protection insurance? Can I opt out?"
    )
    unknowns.append(item_ins)

    return knowns, estimateds, unknowns, critical_unknowns

def evaluate_decision_readiness(
    parsed_offer: Dict[str, Any],
    critical_unknowns: List[TermItem],
    calculations: LoanCalculationsOutput,
    profile: Optional[PersonalProfileInput] = None
) -> Tuple[str, str, str, List[str]]:
    """
    Evaluates Decision Readiness based on evidence completeness and financial safety.
    States: INSUFFICIENT_INFORMATION | PARTIALLY_ASSESSABLE | READY_FOR_SCENARIO_ANALYSIS
    """
    checklist: List[str] = []
    for cu in critical_unknowns:
        if cu.verification_question:
            checklist.append(cu.verification_question)

    # 1. Check for Insufficient Information
    if not parsed_offer.get("principal") or not parsed_offer.get("annual_interest_rate_pct") or not parsed_offer.get("tenure_months"):
        status = "INSUFFICIENT_INFORMATION"
        reason = "The offer lacks essential terms (Principal, Stated Interest Rate, or Tenure). Repayment costs cannot be determined."
        next_step = "Obtain the exact sanction letter or written terms sheet specifying principal, rate, and tenure."
        return status, reason, next_step, checklist

    if not profile:
        status = "PARTIALLY_ASSESSABLE"
        reason = "Loan mechanics are calculated, but personal financial profile is missing. Cannot verify whether this fits your cashflow or liquidity."
        next_step = "Complete your Personal Financial Profile to test affordability and disposable cashflow impact."
        checklist.append("Fill in monthly income and existing debt obligations to evaluate cashflow impact.")
        return status, reason, next_step, checklist

    if profile.monthly_income <= 0:
        status = "INSUFFICIENT_INFORMATION"
        reason = "Monthly in-hand income is recorded as ₹0. Debt servicing capacity and disposable cashflow cannot be established without verified income."
        next_step = "Update your Personal Financial Profile with your actual monthly income."
        checklist.append("Provide a valid monthly income figure to assess debt servicing capacity.")
        return status, reason, next_step, checklist

    # 2. Check for Critical Unknowns
    if len(critical_unknowns) >= 2 or parsed_offer.get("interest_rate_type") == "unknown":
        status = "PARTIALLY_ASSESSABLE"
        reason = f"Identified {len(critical_unknowns)} decision-critical unknowns (such as undisclosed processing fees or unconfirmed fixed/floating rate). While baseline EMI is ₹{calculations.monthly_emi:,.0f}, actual disbursement and rate volatility remain unverified."
        next_step = "Clarify the critical lender questions below before accepting the sanction or signing the loan agreement."
        return status, reason, next_step, checklist

    # 3. Ready for Scenario Analysis
    status = "READY_FOR_SCENARIO_ANALYSIS"
    reason = "Core loan parameters and fee structures are verified against your personal profile. You are ready to stress-test this commitment against rate increases or income shocks."
    next_step = "Proceed to the 'What Changes My Decision?' simulator to test downside resilience."
    return status, reason, next_step, checklist
