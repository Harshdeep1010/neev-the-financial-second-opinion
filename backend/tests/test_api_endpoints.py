import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_profile_analysis_endpoint():
    payload = {
        "monthly_income": 120000,
        "monthly_essential_expenses": 45000,
        "current_savings": 300000,
        "emergency_savings": 200000,
        "existing_debts": 200000,
        "existing_monthly_emi": 15000,
        "primary_goal": "Buy property in 3 years",
        "target_horizon_months": 36,
        "risk_tolerance": "moderate"
    }
    response = client.post("/api/profile/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["monthly_surplus"] == 60000.0
    assert data["debt_to_income_ratio_pct"] == 12.5

def test_offer_analysis_endpoint_with_heuristic():
    offer_text = "Pre-approved offer! Get Rs 8,00,000 at 10.5% interest rate for 48 months. Instant approval."
    payload = {
        "offer": {
            "raw_text": offer_text
        },
        "profile": {
            "monthly_income": 120000,
            "monthly_essential_expenses": 45000,
            "current_savings": 300000,
            "emergency_savings": 200000,
            "existing_monthly_emi": 15000
        }
    }
    response = client.post("/api/offer/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["calculations"]["principal"] == 800000.0
    assert data["calculations"]["annual_interest_rate_pct"] == 10.5
    assert data["calculations"]["tenure_months"] == 48
    assert data["calculations"]["monthly_emi"] == 20482.70
    assert len(data["critical_unknowns"]) >= 1
    assert data["readiness_status"] == "PARTIALLY_ASSESSABLE"

def test_scenario_simulate_endpoint():
    payload = {
        "profile": {
            "monthly_income": 120000,
            "monthly_essential_expenses": 45000,
            "current_savings": 300000,
            "emergency_savings": 200000,
            "existing_monthly_emi": 15000
        },
        "offer": {
            "principal": 800000,
            "annual_interest_rate_pct": 10.5,
            "tenure_months": 48
        },
        "income_delta_pct": -15.0, # 15% income drop
        "rate_delta_pct": 2.0      # 2% interest rate hike
    }
    response = client.post("/api/scenario/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Simulated EMI should be higher than baseline EMI due to 2% rate hike
    assert data["simulated_emi"] > data["baseline_emi"]
    # Simulated surplus should be lower than baseline surplus due to lower income and higher EMI
    assert data["simulated_surplus"] < data["baseline_surplus"]
    assert len(data["risk_alerts"]) >= 1

def test_ml_metadata_endpoint():
    response = client.get("/api/market/ml-metadata")
    assert response.status_code == 200
    data = response.json()
    assert data["model_type"] == "Chronologically Split Random Forest Classifier"
    assert "test_accuracy_pct" in data
    assert "baseline_macro_f1" in data
    assert len(data["limitations"]) >= 1

def test_zero_income_and_minimal_terms_edge_case():
    payload = {
        "offer": {
            "raw_text": "",
            "principal": 1000,
            "annual_interest_rate_pct": 0.1,
            "tenure_months": 1,
            "interest_rate_type": "unknown",
            "processing_fee_pct": 0,
            "processing_fee_amount": 0,
            "prepayment_penalty_disclosed": True,
            "stated_emi": 0
        },
        "profile": {
            "monthly_income": 0,
            "monthly_essential_expenses": 0,
            "current_savings": 0,
            "emergency_savings": 0,
            "existing_debts": 0,
            "existing_monthly_emi": 0,
            "primary_goal": "Preserve liquidity & manage commitments",
            "target_horizon_months": 36,
            "risk_tolerance": "moderate"
        }
    }
    response = client.post("/api/offer/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["readiness_status"] == "INSUFFICIENT_INFORMATION"
    assert data["calculations"]["monthly_emi"] > 0
