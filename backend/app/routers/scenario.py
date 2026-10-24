from fastapi import APIRouter
from ..schemas.decision import ScenarioSimulateInput, ScenarioSimulateResponse
from ..services.scenario_engine import run_scenario_simulation

router = APIRouter(prefix="/api/scenario", tags=["scenario"])

@router.post("/simulate", response_model=ScenarioSimulateResponse)
async def simulate_scenario(payload: ScenarioSimulateInput):
    """
    Simulates sensitivity to modified assumptions (income drops, rate spikes, expenses rise),
    recalculating exact deterministic outcomes and risk triggers.
    """
    return run_scenario_simulation(payload)
