from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import profile, offer, scenario, market, brief

app = FastAPI(
    title="Neev — Your Financial Second Opinion API",
    description="Evidence-first financial decision support engine powered by deterministic math, structured text parsing, and ML volatility regime classification.",
    version="1.0.0"
)

# Enable CORS for local React/Vite frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(profile.router)
app.include_router(offer.router)
app.include_router(scenario.router)
app.include_router(market.router)
app.include_router(brief.router)

@app.get("/")
async def root():
    return {
        "app": "Neev — Your Financial Second Opinion",
        "tagline": "Before you commit, understand.",
        "status": "operational",
        "endpoints": [
            "/api/profile/analyze",
            "/api/offer/analyze",
            "/api/scenario/simulate",
            "/api/market/investments",
            "/api/market/property",
            "/api/market/ml-metadata",
            "/api/decision/brief"
        ]
    }

@app.get("/api/health")
async def health():
    return {"status": "healthy"}
