from typing import List, Dict, Any
from ..schemas.decision import ScenarioSimulateInput, ScenarioSimulateResponse, ScenarioMetricPair
from .calculations import calculate_reducing_emi, evaluate_loan_affordability

def run_scenario_simulation(sim_input: ScenarioSimulateInput) -> ScenarioSimulateResponse:
    """
    Executes dynamic stress testing of changed assumptions against baseline financial profile.
    Deterministic recalculation of all metrics with granular delta attribution.
    """
    profile = sim_input.profile
    offer = sim_input.offer
    
    # 1. Baseline parameters
    principal = offer.principal or 800000.0
    base_rate = offer.annual_interest_rate_pct or 10.5
    base_tenure = offer.tenure_months or 48
    base_proc_fee = offer.processing_fee_amount or (principal * (offer.processing_fee_pct or 2.36) / 100.0)
    
    base_calc = evaluate_loan_affordability(
        principal=principal,
        annual_rate_pct=base_rate,
        tenure_months=base_tenure,
        rate_type=offer.interest_rate_type or "unknown",
        processing_fee=base_proc_fee,
        profile=profile
    )
    
    # 2. Simulated parameters
    sim_principal = max(1000.0, principal - sim_input.prepayment_lump_sum)
    sim_rate = max(0.1, base_rate + sim_input.rate_delta_pct)
    sim_tenure = max(6, base_tenure + sim_input.tenure_delta_months)
    
    sim_income = max(1000.0, profile.monthly_income * (1.0 + (sim_input.income_delta_pct / 100.0)))
    sim_expenses = profile.monthly_essential_expenses * (1.0 + (sim_input.expense_delta_pct / 100.0))
    
    # Create modified profile for simulated context
    from ..schemas.profile import PersonalProfileInput
    sim_profile = PersonalProfileInput(
        monthly_income=sim_income,
        monthly_essential_expenses=sim_expenses,
        current_savings=max(0.0, profile.current_savings - sim_input.prepayment_lump_sum),
        emergency_savings=profile.emergency_savings,
        existing_debts=profile.existing_debts,
        existing_monthly_emi=profile.existing_monthly_emi
    )
    
    sim_calc = evaluate_loan_affordability(
        principal=sim_principal,
        annual_rate_pct=sim_rate,
        tenure_months=sim_tenure,
        rate_type="simulated",
        processing_fee=base_proc_fee,
        profile=sim_profile
    )
    
    # 3. Metric comparisons
    metrics: List[ScenarioMetricPair] = []
    
    # EMI comparison
    emi_delta = sim_calc.monthly_emi - base_calc.monthly_emi
    emi_delta_pct = (emi_delta / base_calc.monthly_emi * 100.0) if base_calc.monthly_emi > 0 else 0.0
    metrics.append(ScenarioMetricPair(
        metric_name="Monthly EMI",
        baseline_value=base_calc.monthly_emi,
        simulated_value=sim_calc.monthly_emi,
        delta_value=round(emi_delta, 2),
        delta_pct=round(emi_delta_pct, 1),
        unit="₹/mo",
        status="critical" if emi_delta > (0.15 * base_calc.monthly_emi) else ("warning" if emi_delta > 0 else "favorable")
    ))
    
    # Surplus comparison
    surplus_delta = sim_calc.post_commitment_surplus - base_calc.post_commitment_surplus
    surplus_delta_pct = (surplus_delta / base_calc.post_commitment_surplus * 100.0) if base_calc.post_commitment_surplus != 0 else 0.0
    surplus_status = "critical" if sim_calc.post_commitment_surplus < 0 else ("warning" if sim_calc.post_commitment_surplus < (0.10 * sim_income) else "favorable")
    metrics.append(ScenarioMetricPair(
        metric_name="Net Monthly Surplus",
        baseline_value=base_calc.post_commitment_surplus,
        simulated_value=sim_calc.post_commitment_surplus,
        delta_value=round(surplus_delta, 2),
        delta_pct=round(surplus_delta_pct, 1),
        unit="₹/mo",
        status=surplus_status
    ))
    
    # DTI comparison
    dti_delta = sim_calc.post_commitment_dti_pct - base_calc.post_commitment_dti_pct
    metrics.append(ScenarioMetricPair(
        metric_name="Debt-to-Income (DTI)",
        baseline_value=base_calc.post_commitment_dti_pct,
        simulated_value=sim_calc.post_commitment_dti_pct,
        delta_value=round(dti_delta, 1),
        delta_pct=round((dti_delta / base_calc.post_commitment_dti_pct * 100.0) if base_calc.post_commitment_dti_pct > 0 else 0.0, 1),
        unit="%",
        status="critical" if sim_calc.post_commitment_dti_pct > 50.0 else ("warning" if sim_calc.post_commitment_dti_pct > 38.0 else "favorable")
    ))
    
    # Total interest comparison
    interest_delta = sim_calc.total_interest - base_calc.total_interest
    metrics.append(ScenarioMetricPair(
        metric_name="Total Interest Cost",
        baseline_value=base_calc.total_interest,
        simulated_value=sim_calc.total_interest,
        delta_value=round(interest_delta, 2),
        delta_pct=round((interest_delta / base_calc.total_interest * 100.0) if base_calc.total_interest > 0 else 0.0, 1),
        unit="₹",
        status="warning" if interest_delta > 0 else "favorable"
    ))
    
    # 4. Activated Risk Triggers & Explanations
    risk_alerts: List[str] = []
    
    if sim_calc.post_commitment_surplus < 0:
        risk_alerts.append(f"CASHFLOW DEFICIT: Under this scenario, your monthly cashflow turns negative by -₹{abs(sim_calc.post_commitment_surplus):,.0f}/mo. You will be forced to draw from savings to service regular EMIs.")
    elif sim_calc.post_commitment_surplus < (0.10 * sim_income):
        risk_alerts.append(f"RAZOR-THIN MARGIN: Remaining surplus is reduced to ₹{sim_calc.post_commitment_surplus:,.0f}/mo (<10% of income). Any unplanned medical or domestic expense could trigger a default.")

    if sim_calc.post_commitment_dti_pct > 50.0:
        risk_alerts.append(f"UNSUSTAINABLE DEBT BURDEN: DTI reaches {sim_calc.post_commitment_dti_pct:.1f}%. More than half your income is committed to debt repayments.")
        
    if sim_input.rate_delta_pct > 0:
        pct_increase = abs(round(interest_delta / base_calc.total_interest * 100.0, 1)) if base_calc.total_interest > 0 else 0.0
        risk_alerts.append(f"FLOATING RATE SENSITIVITY: A {sim_input.rate_delta_pct:+.1f}% rate hike increases total lifetime interest by ₹{interest_delta:,.0f} (+{pct_increase}%) and adds ₹{emi_delta:,.0f}/mo to each payment.")

    if sim_input.prepayment_lump_sum > 0:
        savings = base_calc.total_interest - sim_calc.total_interest
        risk_alerts.append(f"PREPAYMENT BENEFIT: Deploying a ₹{sim_input.prepayment_lump_sum:,.0f} lump sum slashes total interest by ₹{savings:,.0f} and lowers monthly EMI by ₹{abs(emi_delta):,.0f}/mo.")

    # 5. Formulate verdict and narrative
    if len(risk_alerts) == 0:
        verdict = "RESILIENT TO STRESS"
        narrative = "Your financial buffer comfortably absorbs these scenario adjustments without violating safe debt limits."
    elif sim_calc.post_commitment_surplus < 0 or sim_calc.post_commitment_dti_pct > 50.0:
        verdict = "HIGH STRESS BREAKPOINT REACHED"
        narrative = f"The simulated scenario breaks your cashflow safety margin. What previously seemed manageable at ₹{base_calc.monthly_emi:,.0f}/mo turns into a net deficit of -₹{abs(sim_calc.post_commitment_surplus):,.0f}/mo. Consider negotiating a longer tenure, borrowing a smaller principal, or maintaining a larger liquid buffer."
    else:
        verdict = "MODERATE VULNERABILITY DETECTED"
        narrative = f"While you do not enter a cashflow deficit, your discretionary monthly margin drops from ₹{base_calc.post_commitment_surplus:,.0f} down to ₹{sim_calc.post_commitment_surplus:,.0f} (-{abs(round(surplus_delta_pct, 1))}%). Discretionary spending or competing savings goals will have to be compromised."

    return ScenarioSimulateResponse(
        baseline_emi=base_calc.monthly_emi,
        simulated_emi=sim_calc.monthly_emi,
        baseline_surplus=base_calc.post_commitment_surplus,
        simulated_surplus=sim_calc.post_commitment_surplus,
        baseline_dti=base_calc.post_commitment_dti_pct,
        simulated_dti=sim_calc.post_commitment_dti_pct,
        baseline_total_interest=base_calc.total_interest,
        simulated_total_interest=sim_calc.total_interest,
        metrics_comparison=metrics,
        risk_alerts=risk_alerts,
        verdict=verdict,
        what_changed_explanation=narrative
    )
