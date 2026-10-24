from typing import List, Dict, Any, Optional
from ..schemas.market import (
    AssetPerformanceCard, InvestmentAnalysisResponse,
    PropertyAnalysisInput, PropertyAnalysisResponse
)
from ..schemas.profile import PersonalProfileInput
from .calculations import calculate_reducing_emi
from .ml_engine import ml_service

def analyze_investment_candidates(
    capital: float,
    horizon_months: int,
    user_risk: str,
    profile: Optional[PersonalProfileInput] = None
) -> InvestmentAnalysisResponse:
    """
    Evaluates benchmark asset allocations with historical risk metrics and ML regime prediction.
    """
    # 1. Asset 1: Broad Equities (NIFTY 50 Index Proxy)
    eq_regime, eq_conf = ml_service.predict_regime(
        vol_20d=14.2, ret_20d=1.8, ret_60d=4.5, dist_sma200=3.2, drawdown=-5.4
    )
    eq_suitability = "SUITABLE FOR LONG HORIZONS (3+ YRS)" if horizon_months >= 36 else "HIGH HORIZON MISMATCH RISK"
    eq_tradeoff = "Higher long-term inflation hedge, but subjected to short-term drawdowns of 15% to 30%."

    equity_card = AssetPerformanceCard(
        symbol="NIFTY_50",
        name="Indian Large-Cap Equity Index (NIFTY 50)",
        asset_class="Equities",
        cagr_5y_pct=13.8,
        annualized_volatility_pct=14.6,
        max_drawdown_historical_pct=-28.4,
        worst_1y_return_pct=-14.2,
        best_1y_return_pct=34.1,
        ml_volatility_regime=eq_regime,
        regime_confidence_pct=eq_conf,
        suitability_verdict=eq_suitability,
        tradeoff_warning=eq_tradeoff
    )

    # 2. Asset 2: Sovereign Gold
    gold_regime, gold_conf = ml_service.predict_regime(
        vol_20d=11.0, ret_20d=0.8, ret_60d=2.1, dist_sma200=1.5, drawdown=-3.2
    )
    gold_suitability = "GOOD DIVERSIFIER & INFLATION BUFFER"
    gold_tradeoff = "Hedging hedge against currency depreciation, but generates zero cashflow or dividends."

    gold_card = AssetPerformanceCard(
        symbol="GOLD_SGB",
        name="Sovereign Gold / Benchmark Gold",
        asset_class="Precious Metals",
        cagr_5y_pct=11.2,
        annualized_volatility_pct=11.4,
        max_drawdown_historical_pct=-16.1,
        worst_1y_return_pct=-4.5,
        best_1y_return_pct=26.8,
        ml_volatility_regime=gold_regime,
        regime_confidence_pct=gold_conf,
        suitability_verdict=gold_suitability,
        tradeoff_warning=gold_tradeoff
    )

    # 3. Asset 3: Bank Fixed Deposit / Liquid Debt
    fd_card = AssetPerformanceCard(
        symbol="BANK_FD",
        name="Scheduled Commercial Bank Fixed Deposit",
        asset_class="Fixed Income / Cash Equivalents",
        cagr_5y_pct=7.1,
        annualized_volatility_pct=0.4,
        max_drawdown_historical_pct=0.0,
        worst_1y_return_pct=5.8,
        best_1y_return_pct=7.5,
        ml_volatility_regime="LOW_VOLATILITY_STEADY",
        regime_confidence_pct=99.0,
        suitability_verdict="CAPITAL PRESERVATION FOR SHORT HORIZONS (<24 MOS)",
        tradeoff_warning="Guaranteed principal return up to ₹5 Lakh (DICGC cover), but post-tax returns barely beat inflation."
    )

    # Goal conflict check
    goal_warning = None
    if profile and profile.primary_goal and "property" in profile.primary_goal.lower() and horizon_months < 36:
        goal_warning = (
            f"GOAL CONFLICT ALERT: You stated a near-term objective ('{profile.primary_goal}') with a horizon of {horizon_months} months. "
            f"Allocating funds to equities carries a historical worst-year return of -14.2% and drawdowns exceeding -28%. "
            f"If equity markets correct, your down-payment capital will be depleted."
        )

    unknowns = [
        "Future returns are probabilistic and will deviate from historical CAGR.",
        "Individual tax bracket (e.g. LTCG @ 12.5% on equities, slab rate on debt/FD) alters post-tax yield.",
        "Inflation trajectory over holding period is unhedged in fixed deposits."
    ]

    return InvestmentAnalysisResponse(
        capital=capital,
        horizon_months=horizon_months,
        asset_comparisons=[equity_card, gold_card, fd_card],
        ml_model_metadata=ml_service.metrics,
        goal_conflict_warning=goal_warning,
        unknowns_and_limitations=unknowns
    )

def evaluate_property_affordability(
    input_data: PropertyAnalysisInput,
    profile: Optional[PersonalProfileInput] = None
) -> PropertyAnalysisResponse:
    """
    Evaluates upfront capital depletion, EMI load, and Rent-vs-Buy dynamics.
    """
    price = input_data.property_price
    down_payment = input_data.down_payment_saved
    
    # Stamp duty & registration: standard 7% in major Indian metros
    stamp_duty = round(price * 0.07, 2)
    total_upfront = round(down_payment + stamp_duty, 2)
    
    loan_needed = max(0.0, price - down_payment)
    tenure_months = input_data.tenure_years * 12
    home_loan_emi = calculate_reducing_emi(loan_needed, input_data.interest_rate_pct, tenure_months)
    
    # Maintenance, property tax, and insurance approx 0.5% of property value per annum
    monthly_maintenance = round((price * 0.005) / 12.0, 2)
    total_monthly_cost = round(home_loan_emi + monthly_maintenance, 2)
    
    cost_diff_vs_rent = round(total_monthly_cost - input_data.alternative_current_rent, 2)
    
    emergency_warning = None
    if profile:
        remaining_cash = profile.current_savings - total_upfront
        if remaining_cash < (profile.monthly_essential_expenses * 3.0):
            emergency_warning = (
                f"LIQUIDITY ALARM: Deploying ₹{total_upfront:,.0f} for down payment and stamp duty leaves only "
                f"₹{max(0.0, remaining_cash):,.0f} in savings, which is under 3 months of emergency expenses "
                f"(₹{profile.monthly_essential_expenses * 3:,.0f}). You risk severe vulnerability to job loss or emergency."
            )

    if cost_diff_vs_rent > 25000:
        verdict = "BUYING CARRIES SIGNIFICANT CASHFLOW STRAIN COMPARED TO RENTING"
    elif cost_diff_vs_rent > 0:
        verdict = "BUYING ADDS MODERATE MONTHLY COST PREMIUM OVER RENTING"
    else:
        verdict = "BUYING RUNS CASHFLOW COMPETITIVE WITH RENTING"

    down_payment_pct = (down_payment / price * 100.0) if price > 0 else 0.0
    knowns = [
        f"Target Property Value: ₹{price:,.0f}",
        f"Down Payment Saved: ₹{down_payment:,.0f} ({down_payment_pct:.1f}% of purchase price)",
        f"Current Monthly Rent: ₹{input_data.alternative_current_rent:,.0f}/mo"
    ]

    critical_unknowns = [
        "Exact municipal stamp duty, registration charges, and brokerage for this specific sub-locality.",
        "Undisclosed builder maintenance / society corpus fund charges (often ₹2-5 Lakh upfront).",
        "Future property appreciation rate vs opportunity cost of equity returns on down payment.",
        "Whether home loan interest rate is fixed or linked to repo rate (RLLR)."
    ]

    checklist = [
        "Request the complete All-Inclusive Cost Sheet from seller/builder (including GST, club membership, electricity meter).",
        "Verify title deed clearance and RERA registration status.",
        "Check with bank for home loan sanction letter and exact EBLR spread."
    ]

    return PropertyAnalysisResponse(
        property_price=price,
        stamp_duty_and_registration=stamp_duty,
        total_upfront_cash_required=total_upfront,
        loan_amount_needed=loan_needed,
        monthly_home_loan_emi=home_loan_emi,
        monthly_maintenance_tax_estimate=monthly_maintenance,
        total_monthly_ownership_cost=total_monthly_cost,
        net_monthly_cost_difference_vs_rent=cost_diff_vs_rent,
        emergency_fund_depletion_warning=emergency_warning,
        rent_vs_buy_verdict=verdict,
        known_facts=knowns,
        decision_critical_unknowns=critical_unknowns,
        verification_checklist=checklist
    )
