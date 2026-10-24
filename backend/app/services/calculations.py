import math
from typing import Dict, Any, List, Optional
from ..schemas.profile import PersonalProfileInput, ProfileAnalysisOutput
from ..schemas.offer import LoanCalculationsOutput

def calculate_reducing_emi(principal: float, annual_rate_pct: float, tenure_months: int) -> float:
    """
    Standard monthly reducing balance Equated Monthly Installment (EMI) calculation.
    Formula: EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
    """
    if principal <= 0 or tenure_months <= 0:
        return 0.0
    if annual_rate_pct <= 0:
        return round(principal / tenure_months, 2)
    
    monthly_rate = (annual_rate_pct / 100.0) / 12.0
    numerator = principal * monthly_rate * math.pow(1.0 + monthly_rate, tenure_months)
    denominator = math.pow(1.0 + monthly_rate, tenure_months) - 1.0
    
    if denominator == 0:
        return round(principal / tenure_months, 2)
    
    emi = numerator / denominator
    return round(emi, 2)

def calculate_effective_apr(principal: float, processing_fee: float, emi: float, tenure_months: int) -> float:
    """
    Calculates the true annualized percentage rate (APR) considering upfront deducted fees
    via bisection search on monthly internal rate of return (IRR).
    Net disbursement = Principal - Processing Fee.
    """
    net_disbursed = principal - processing_fee
    if net_disbursed <= 0 or emi <= 0 or tenure_months <= 0:
        return 0.0
    
    # Bisection search for monthly rate r such that:
    # sum(emi / (1 + r)^t for t in 1..tenure) == net_disbursed
    low = 0.0
    high = 1.0 # up to 100% per month
    
    for _ in range(60): # 60 iterations yields < 1e-10 precision
        mid = (low + high) / 2.0
        if mid == 0:
            npv = emi * tenure_months
        else:
            npv = emi * (1.0 - math.pow(1.0 + mid, -tenure_months)) / mid
        
        if npv > net_disbursed:
            low = mid
        else:
            high = mid
            
    monthly_irr = (low + high) / 2.0
    annual_apr = monthly_irr * 12.0 * 100.0
    return round(annual_apr, 2)

def generate_amortization_summary(principal: float, annual_rate_pct: float, tenure_months: int) -> Dict[str, Any]:
    """
    Computes exact total repayment, total interest, and year-by-year principal vs interest split.
    """
    monthly_rate = (annual_rate_pct / 100.0) / 12.0
    emi = calculate_reducing_emi(principal, annual_rate_pct, tenure_months)
    
    total_repayment = round(emi * tenure_months, 2)
    total_interest = round(total_repayment - principal, 2)
    
    # Year-wise split
    schedule = []
    balance = principal
    cumulative_interest = 0.0
    
    for m in range(1, tenure_months + 1):
        interest_for_month = balance * monthly_rate
        principal_for_month = emi - interest_for_month
        if principal_for_month > balance or m == tenure_months:
            principal_for_month = balance
            interest_for_month = max(0.0, emi - principal_for_month)
            
        balance = max(0.0, balance - principal_for_month)
        cumulative_interest += interest_for_month
        
        if m % 12 == 0 or m == tenure_months:
            year_num = (m + 11) // 12
            schedule.append({
                "period_month": m,
                "year": year_num,
                "remaining_principal": round(balance, 2),
                "cumulative_interest_paid": round(cumulative_interest, 2)
            })
            
    return {
        "monthly_emi": emi,
        "total_repayment": total_repayment,
        "total_interest": total_interest,
        "schedule_milestones": schedule
    }

def analyze_profile_fundamentals(profile: PersonalProfileInput) -> ProfileAnalysisOutput:
    """
    Computes non-negotiable cashflow indicators from personal financial profile.
    """
    surplus = profile.monthly_income - profile.monthly_essential_expenses - profile.existing_monthly_emi
    dti_pct = (profile.existing_monthly_emi / profile.monthly_income * 100.0) if profile.monthly_income > 0 else 0.0
    
    emergency_months = (
        (profile.emergency_savings or profile.current_savings * 0.5) / profile.monthly_essential_expenses
        if profile.monthly_essential_expenses > 0 else 0.0
    )
    
    savings_rate_pct = (surplus / profile.monthly_income * 100.0) if profile.monthly_income > 0 else 0.0
    
    vulnerabilities = []
    if dti_pct > 40.0:
        vulnerabilities.append(f"Existing Debt-to-Income ratio is high at {dti_pct:.1f}% (ideal ceiling is 35%).")
    if emergency_months < 3.0:
        vulnerabilities.append(f"Emergency safety buffer holds only {emergency_months:.1f} months of expenses (recommended min is 6 months).")
    if surplus < 0:
        vulnerabilities.append("Current cashflow is in a monthly deficit; no capacity for additional liabilities.")
    elif surplus < (0.15 * profile.monthly_income):
        vulnerabilities.append(f"Discretionary buffer is tight at ₹{surplus:,.0f}/month.")

    health = "STABLE"
    if len(vulnerabilities) >= 2 or surplus < 0 or dti_pct > 50:
        health = "VULNERABLE"
    elif len(vulnerabilities) == 1:
        health = "MODERATE"
        
    capacity = max(0.0, surplus * 0.5) # safe max allocation for a new commitment is at most 50% of free surplus

    return ProfileAnalysisOutput(
        monthly_income=profile.monthly_income,
        monthly_essential_expenses=profile.monthly_essential_expenses,
        existing_monthly_emi=profile.existing_monthly_emi,
        monthly_surplus=round(surplus, 2),
        debt_to_income_ratio_pct=round(dti_pct, 1),
        emergency_fund_months=round(emergency_months, 1),
        savings_rate_pct=round(savings_rate_pct, 1),
        health_assessment=health,
        key_vulnerabilities=vulnerabilities,
        capacity_for_new_commitment=round(capacity, 2)
    )

def evaluate_loan_affordability(
    principal: float,
    annual_rate_pct: float,
    tenure_months: int,
    rate_type: str = "unknown",
    processing_fee: Optional[float] = None,
    profile: Optional[PersonalProfileInput] = None
) -> LoanCalculationsOutput:
    """
    Main deterministic calculation engine connecting loan terms with personal profile context.
    """
    emi = calculate_reducing_emi(principal, annual_rate_pct, tenure_months)
    total_repayment = round(emi * tenure_months, 2)
    total_interest = round(total_repayment - principal, 2)
    
    # If processing fee not explicitly given, standard industry baseline is ~2% + 18% GST (2.36%)
    fee_amount = processing_fee if processing_fee is not None else round(principal * 0.0236, 2)
    net_disbursed = round(principal - fee_amount, 2)
    effective_apr = calculate_effective_apr(principal, fee_amount, emi, tenure_months)
    
    # Financial profile context
    if profile:
        baseline_surplus = profile.monthly_income - profile.monthly_essential_expenses - profile.existing_monthly_emi
        baseline_dti = (profile.existing_monthly_emi / profile.monthly_income * 100.0) if profile.monthly_income > 0 else 0.0
        
        post_commitment_dti = ((profile.existing_monthly_emi + emi) / profile.monthly_income * 100.0) if profile.monthly_income > 0 else 0.0
        post_commitment_surplus = baseline_surplus - emi
        surplus_depletion = ((baseline_surplus - post_commitment_surplus) / baseline_surplus * 100.0) if baseline_surplus > 0 else 100.0
    else:
        # Defaults if no profile provided
        baseline_surplus = 0.0
        baseline_dti = 0.0
        post_commitment_dti = 0.0
        post_commitment_surplus = 0.0
        surplus_depletion = 0.0
        
    # Grade affordability
    if profile:
        if post_commitment_surplus < 0 or post_commitment_dti > 50.0:
            grade = "CRITICAL_BURDEN"
            explanation = (
                f"Proposed EMI of ₹{emi:,.0f} pushes total debt obligations to {post_commitment_dti:.1f}% of income, "
                f"leaving your monthly surplus at ₹{post_commitment_surplus:,.0f}. This introduces severe default and liquidity risk."
            )
        elif post_commitment_dti > 38.0 or post_commitment_surplus < (0.15 * profile.monthly_income):
            grade = "STRETCHED"
            explanation = (
                f"Affordable only under stable conditions. Debt burden rises to {post_commitment_dti:.1f}%, "
                f"depleting {surplus_depletion:.1f}% of your existing free cashflow. Low margin for unexpected emergencies."
            )
        else:
            grade = "COMFORTABLE"
            explanation = (
                f"Affordable within standard prudential limits. Total debt obligations stay at {post_commitment_dti:.1f}% "
                f"(below 35% safe ceiling), maintaining ₹{post_commitment_surplus:,.0f}/month of surplus."
            )
    else:
        grade = "STRETCHED"
        explanation = "Contextual affordability cannot be assessed without a personal financial profile."
        
    return LoanCalculationsOutput(
        principal=principal,
        annual_interest_rate_pct=annual_rate_pct,
        tenure_months=tenure_months,
        interest_rate_type=rate_type,
        monthly_emi=emi,
        total_repayment=total_repayment,
        total_interest=total_interest,
        processing_fee_estimated=fee_amount,
        net_disbursed_amount=net_disbursed,
        effective_apr_pct=effective_apr,
        baseline_dti_pct=round(baseline_dti, 1),
        post_commitment_dti_pct=round(post_commitment_dti, 1),
        baseline_surplus=round(baseline_surplus, 2),
        post_commitment_surplus=round(post_commitment_surplus, 2),
        surplus_depletion_pct=round(surplus_depletion, 1),
        affordability_grade=grade,
        affordability_explanation=explanation
    )
