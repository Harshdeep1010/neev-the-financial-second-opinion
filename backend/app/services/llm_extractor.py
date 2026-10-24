import re
import json
import logging
from typing import Dict, Any, Optional, List
import httpx
from ..config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

PRESSURE_KEYWORDS = [
    "instant approval", "limited time", "act now", "urgent", "exclusive offer",
    "zero verification", "no questions asked", "guaranteed sanction", "pre-approved for today only",
    "offer expiring", "hurry", "click here immediately"
]

def fallback_regex_extractor(text: str) -> Dict[str, Any]:
    """
    High-reliability deterministic parser for Indian loan offer messages, SMS, and documents.
    Operates without external API dependency.
    """
    clean = text.lower()
    extracted: Dict[str, Any] = {
        "principal": None,
        "annual_interest_rate_pct": None,
        "tenure_months": None,
        "interest_rate_type": "unknown",
        "processing_fee_pct": None,
        "processing_fee_amount": None,
        "stated_emi": None,
        "prepayment_penalty_disclosed": False,
        "lender_name": None,
        "pressure_signals": [],
        "extraction_method": "deterministic_regex_fallback"
    }
    
    # 1. Detect pressure signals
    for phrase in PRESSURE_KEYWORDS:
        if phrase in clean:
            extracted["pressure_signals"].append(phrase.title())
            
    # 2. Extract Principal
    # Patterns: ₹8,00,000 / Rs 800000 / 8 Lakh / 8 Lacs / 10K
    lakh_match = re.search(r'(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)', clean)
    if lakh_match:
        extracted["principal"] = float(lakh_match.group(1)) * 100000.0
    else:
        # Standard digits with optional commas
        amt_match = re.search(r'(?:rs\.?|inr|₹|loan of|amount of)\s*[:\-]?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d+)?|\d{4,9})', clean)
        if amt_match:
            raw_num = amt_match.group(1).replace(',', '')
            val = float(raw_num)
            if val >= 5000:
                extracted["principal"] = val
                
    # 3. Extract Interest Rate
    # Patterns: 10.5% p.a. / 11 % / @ 9.25%
    rate_match = re.search(r'(\d+(?:\.\d+)?)\s*%\s*(?:p\.?a\.?|per annum|interest|annual)?', clean)
    if rate_match:
        rate = float(rate_match.group(1))
        if 0.5 <= rate <= 50.0:
            extracted["annual_interest_rate_pct"] = rate
            
    # 4. Extract Tenure
    # Patterns: 48 months / 4 years / 3 yrs / tenure of 36m
    tenure_months_match = re.search(r'(\d+)\s*(?:months?|mths?|m\b)', clean)
    tenure_years_match = re.search(r'(\d+)\s*(?:years?|yrs?|y\b)', clean)
    if tenure_months_match:
        extracted["tenure_months"] = int(tenure_months_match.group(1))
    elif tenure_years_match:
        extracted["tenure_months"] = int(tenure_years_match.group(1)) * 12

    # 5. Rate Type
    if "floating" in clean or "variable" in clean or "repo linked" in clean or "rllr" in clean:
        extracted["interest_rate_type"] = "floating"
    elif "fixed" in clean:
        extracted["interest_rate_type"] = "fixed"
    elif "flat rate" in clean:
        extracted["interest_rate_type"] = "flat"
    elif "reducing" in clean:
        extracted["interest_rate_type"] = "reducing"
        
    # 6. Processing Fee
    proc_pct_match = re.search(r'processing fee[:\s]*(?:of\s*)?(\d+(?:\.\d+)?)\s*%', clean)
    if proc_pct_match:
        extracted["processing_fee_pct"] = float(proc_pct_match.group(1))
    proc_amt_match = re.search(r'processing fee[:\s]*(?:of\s*)?(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*)', clean)
    if proc_amt_match:
        extracted["processing_fee_amount"] = float(proc_amt_match.group(1).replace(',', ''))
        
    # 7. Prepayment mention
    if "prepayment" in clean or "foreclosure" in clean or "part-payment" in clean:
        extracted["prepayment_penalty_disclosed"] = True
        
    # 8. Stated EMI
    emi_match = re.search(r'emi[:\s]*(?:of\s*)?(?:rs\.?|inr|₹)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d+)?|\d{3,6})\s*(?:\/|\s*per month|\s*pm)?', clean)
    if emi_match:
        val = float(emi_match.group(1).replace(',', ''))
        if 500 <= val < (extracted["principal"] or 10000000):
            extracted["stated_emi"] = val
            
    # 9. Lender Name Detection (common banks / NBFCs)
    common_lenders = ["hdfc", "sbi", "icici", "axis", "kotak", "bajaj finserv", "tata capital", "idfc first", "bank of baroda", "pnb"]
    for lender in common_lenders:
        if lender in clean:
            extracted["lender_name"] = lender.upper()
            break

    return extracted

async def extract_offer_with_gemini(text: str) -> Dict[str, Any]:
    """
    Extracts structured financial terms using Gemini API with JSON enforcement.
    Falls back gracefully to regex heuristic parser if API is unavailable.
    """
    if not GEMINI_API_KEY or not text.strip():
        logger.info("Gemini API key missing or empty text; employing deterministic regex extractor.")
        return fallback_regex_extractor(text)
        
    prompt = f"""
You are a senior financial analyst and contract auditor.
Carefully extract the key financial terms from this loan or financial offer text:

\"\"\"{text}\"\"\"

Return ONLY a valid JSON object with the following schema:
{{
  "principal": float or null (the loan amount in INR),
  "annual_interest_rate_pct": float or null (annual percentage rate e.g. 10.5),
  "tenure_months": int or null (duration in months e.g. 48),
  "interest_rate_type": "fixed" or "floating" or "reducing" or "flat" or "unknown",
  "processing_fee_pct": float or null (processing fee percentage),
  "processing_fee_amount": float or null (processing fee in absolute INR),
  "stated_emi": float or null (monthly repayment amount if explicitly claimed),
  "prepayment_penalty_disclosed": boolean (true if foreclosure/prepayment terms are explicitly mentioned),
  "lender_name": string or null,
  "pressure_signals": list of strings (e.g. "Instant Approval", "Limited Time Offer", "Urgent Action Required")
}}
Do NOT invent numbers not present in the text. If a term is ambiguous or missing, set it to null or "unknown".
"""
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "response_mime_type": "application/json",
                    "temperature": 0.1
                }
            }
            res = await client.post(endpoint, json=payload)
            if res.status_code == 200:
                data = res.json()
                raw_json = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(raw_json)
                parsed["extraction_method"] = "gemini"
                return parsed
            else:
                logger.warning(f"Gemini API returned status {res.status_code}: {res.text}. Falling back to regex.")
                return fallback_regex_extractor(text)
    except Exception as e:
        logger.warning(f"Gemini extraction failed ({str(e)}). Falling back to deterministic extractor.")
        return fallback_regex_extractor(text)
