from fastapi import APIRouter
from ..schemas.profile import PersonalProfileInput, ProfileAnalysisOutput
from ..services.calculations import analyze_profile_fundamentals

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.post("/analyze", response_model=ProfileAnalysisOutput)
async def analyze_profile(profile: PersonalProfileInput):
    """
    Validates personal financial profile and returns baseline cashflow indicators,
    debt-to-income ratio, and discretionary surplus.
    """
    return analyze_profile_fundamentals(profile)
