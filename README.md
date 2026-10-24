# Neev — Your Financial Second Opinion

> **"Before you commit, understand."**  
> *Financial decisions should respond to the user's circumstances, not a generic rule. The unknown becomes part of the financial plan.*

[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E.svg)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. The Core Idea

People frequently commit to loans, investments, and property decisions without understanding the true consequences for their own finances:
- A loan headline claims **10.5% p.a.**, but undisclosed processing fees and GST turn the effective APR into **12.4%**, while floating rate clauses expose the borrower to future rate hikes.
- An investment return is promised based on a recent bull market, ignoring historical drawdowns exceeding **-28%** that could wipe out savings needed for a house down payment in 2 years.
- Financial advice on the internet is either too generic or biased by sales commissions.

**Neev** answers the single question:  
**"What does this particular financial decision mean for MY financial situation?"**

Neev does **not** blindly tell users what to buy or pretend that uncertain market outcomes are guaranteed. Instead, it provides an evidence-based **Decision Brief** that separates facts from assumptions, isolates critical missing terms, evaluates readiness, and stress-tests decisions against real-world shocks.

---

## 2. Core Pillars & Architecture

```
React / Vite Frontend (Port 5173)
│
├── 1-Click Demo Scenarios (Judge Evaluation)
├── Personal Financial Profile (Cashflow & Liquidity Buffer)
├── Offer Input (Structured Text Parsing & Pressure Checks)
├── Known / Estimated / Unknown Triad Matrix
├── Decision Readiness Meter (Insufficient | Partially Assessable | Ready)
├── "What Changes My Decision?" Interactive Simulator (Recharts)
└── Audit-Ready Decision Brief (Export / Print / Copy)
       │
       ▼ (REST API / JSON)
FastAPI Backend (Port 8000)
│
├── Gemini API / Regex Fallback Extractor (Structured Contract Ingestion)
├── Deterministic Calculation Engine (Monthly Reducing EMI, IRR APR, DTI, Surplus)
├── Decision Readiness Rules & Critical Unknowns Identifier
├── Dynamic Scenario Sensitivity Engine (Assumptions Shock Recalculation)
└── ML Volatility Regime Classifier (scikit-learn Random Forest, Chronological Split)
```

---

## 3. Mandatory Differentiators

### A. Known / Estimated / Unknown Framework
Every financial analysis strictly categorizes information into:
1. **KNOWN:** Facts explicitly provided by the user or written in the offer (e.g., Stated Principal, Nominal Rate, User Income).
2. **ESTIMATED:** Derived values computed via deterministic Python math with transparent formulas (e.g., Monthly Reducing EMI, Lifetime Interest, Post-Commitment Surplus).
3. **UNKNOWN (DECISION-CRITICAL):** Missing or ambiguous terms that materially alter the outcome (e.g., Undisclosed Processing Fees, Floating vs Fixed spread, Prepayment foreclosure penalties). Each critical unknown includes **Why it Matters**, **Rupee Impact**, and the **Exact Question to Ask the Lender**.

### B. Decision Readiness Meter
Assesses whether sufficient information exists to commit:
- 🔴 **INSUFFICIENT INFORMATION:** Critical variables missing; repayment cannot be calculated.
- 🟡 **PARTIALLY ASSESSABLE:** Baseline EMI calculated, but decision-critical unknowns (such as undisclosed upfront fees or unconfirmed floating rate terms) remain unverified.
- 🟢 **READY FOR SCENARIO ANALYSIS:** Terms and fees verified against personal cashflow; ready for stress testing.

### C. Signature Feature: "What Changes My Decision?"
An interactive sensitivity simulator powered by real backend math. Users adjust sliders to test:
- **Floating Rate Hike (+0.5% to +4.0%):** Shows lifetime interest surge and EMI expansion.
- **Income Shocks (-10% to -30%):** Detects cashflow deficit breakpoints.
- **Living Expense Inflation (+5% to +30%):** Flags thinning discretionary buffers.
- **Lump-Sum Prepayment:** Quantifies interest savings and tenure relief.

### D. Module Extensions
- **Module C (Investment Risk):** Evaluates Large-Cap Equities (NIFTY 50), Sovereign Gold, and Fixed Deposits against user horizons, historical drawdowns, and a trained `scikit-learn` Volatility Regime Classifier.
- **Module D (Property Affordability):** Evaluates upfront stamp duty liquidity drain (7%), home loan EMI burden, and rent-vs-buy monthly cost differentials.

---

## 4. Machine Learning Implementation & Integrity

Neev adheres to strict technical honesty:
- **Task:** Forward 20-Day Volatility Regime Classification (Low Volatility <12%, Normal 12–20%, High Volatility >20%).
- **Dataset:** 7 years of benchmark daily index series (2018–2024).
- **Chronological Split:**
  - **Training:** 2018-01-01 to 2022-12-31 (~1,250 trading days).
  - **Out-of-Sample Test:** 2023-01-01 to 2024-12-31 (~500 trading days). Zero lookahead bias or future-data leakage.
- **Model:** `RandomForestClassifier(n_estimators=100, max_depth=4)`.
- **Baseline Comparison:** Evaluated against a persistence baseline (*"Tomorrow's regime = Today's regime"*).
- **Transparency:** All metrics, feature importances, and explicit limitations are accessible in the UI via the **"View ML Model Audit"** button.

---

## 5. Quick Start (Run Locally)

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ (tested on Node v24)
- npm

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Create .env for Gemini API structured parsing
# If omitted, Neev automatically uses its built-in deterministic regex fallback parser.
echo "GEMINI_API_KEY=your_key_here" > .env

# Run unit tests to verify mathematical exactness
python -m pytest

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at: `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).

### 2. Frontend Setup
In a new terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
Frontend will be live at: `http://localhost:5173`.

---

## 6. How to Demo for Hackathon Judges (2-3 Minutes)

1. Open `http://localhost:5173`.
2. Click **"1-Click Demo Presets"** in the top navigation bar and select **"Aakash — Deceptive Pre-Approved Loan Offer"**.
3. **Inspect Known/Estimated/Unknown:**
   - **Known:** Principal (₹8,00,000), Stated Rate (10.5%), Tenure (48 months).
   - **Estimated:** Monthly EMI (₹20,483/mo), Total Interest (₹1,83,170), Post-Commitment Surplus (₹39,517/mo).
   - **Decision-Critical Unknowns:** Notice the yellow alert: *Floating vs Fixed rate undisclosed* and *Processing fee undisclosed upfront*.
4. **Inspect Decision Readiness Meter:**
   - Status: **`PARTIALLY ASSESSABLE`**.
   - Note the exact verification checklist generated to ask the lender before signing.
5. **Test "What Changes My Decision?":**
   - Click the **"+2% Floating Rate Hike"** button or slide rate to +2.5%.
   - Observe the live recalculation: Lifetime interest surges, surplus buffer compresses.
   - Click the **"-20% Income Drop"** button: Notice the activated alert flagging cashflow strain.
6. **Generate Decision Brief:**
   - Click **"Compile Executive Decision Brief"**.
   - View the formatted, audit-ready document with verified calculations, risk alerts, and lender questions. Click **"Print / Save PDF"**.
7. **Module C & D Extension (1-click):**
   - Click the **"Investment Risk"** tab to view the scikit-learn volatility model and goal conflict warning.
   - Click the **"Property / Rent vs Buy"** tab to test upfront stamp duty liquidity drain.

---

## 7. Mathematical Formulas

- **Reducing Balance EMI:**
  $$EMI = P \times r \times \frac{(1+r)^n}{(1+r)^n - 1}$$
  where $P$ is principal, $r = \frac{\text{Annual Rate}}{12 \times 100}$, and $n$ is tenure in months.

- **Effective APR (Internal Rate of Return):**
  Solves for $r_{irr}$ via bisection where:
  $$(P - \text{Fee}) = \sum_{t=1}^{n} \frac{EMI}{(1 + r_{irr})^t}$$

- **Debt-to-Income (DTI):**
  $$\text{DTI} = \frac{\text{Existing EMIs} + \text{New EMI}}{\text{Monthly In-Hand Income}} \times 100$$

---

## 8. License & Ethical Disclaimer

Neev is developed as a hackathon educational prototype for financial decision support. It is **not** a registered investment advisory service (SEBI/RBI). Deterministic math and transparent assumptions empower the user to ask the right questions before committing capital.
