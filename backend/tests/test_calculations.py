import pytest
from app.services.calculations import calculate_reducing_emi, calculate_effective_apr, generate_amortization_summary, evaluate_loan_affordability
from app.schemas.profile import PersonalProfileInput

def test_emi_calculation():
    # 8,00,000 at 10.5% for 48 months
    # r = 10.5 / 1200 = 0.00875
    # EMI = 800000 * 0.00875 * (1.00875^48) / ((1.00875^48) - 1) = 20482.70
    emi = calculate_reducing_emi(800000, 10.5, 48)
    assert 20450 <= emi <= 20550
    assert emi == 20482.70

def test_zero_rate_emi():
    # 1,20,000 at 0% for 12 months
    emi = calculate_reducing_emi(120000, 0, 12)
    assert emi == 10000.0

def test_effective_apr():
    # With upfront fee deducted, APR is higher than nominal rate
    apr = calculate_effective_apr(800000, 20000, 20482.70, 48)
    assert apr > 10.5 # APR must exceed nominal interest rate due to fee deduction
    assert 11.0 <= apr <= 13.5

def test_profile_impact():
    profile = PersonalProfileInput(
        monthly_income=120000,
        monthly_essential_expenses=45000,
        current_savings=300000,
        emergency_savings=200000,
        existing_debts=200000,
        existing_monthly_emi=15000
    )
    result = evaluate_loan_affordability(
        principal=800000,
        annual_rate_pct=10.5,
        tenure_months=48,
        rate_type="fixed",
        processing_fee=18880,
        profile=profile
    )
    # Baseline surplus: 120000 - 45000 - 15000 = 60000
    assert result.baseline_surplus == 60000
    # Post commitment surplus: 60000 - 20482.70 = 39517.30
    assert result.post_commitment_surplus == 39517.30
    # Baseline DTI: 15000 / 120000 = 12.5%
    assert result.baseline_dti_pct == 12.5
    # Post DTI: (15000 + 20482.70) / 120000 = 29.6%
    assert result.post_commitment_dti_pct == 29.6
    assert result.affordability_grade == "COMFORTABLE"
