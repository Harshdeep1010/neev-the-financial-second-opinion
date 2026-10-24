const API_BASE = 'http://127.0.0.1:8000/api';

async function postJSON(endpoint, data) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Server returned ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

async function getJSON(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  analyzeProfile: (profile) => postJSON('/profile/analyze', profile),
  analyzeOffer: (offer, profile) => postJSON('/offer/analyze', { offer, profile }),
  simulateScenario: (scenarioPayload) => postJSON('/scenario/simulate', scenarioPayload),
  getDecisionBrief: (briefPayload) => postJSON('/decision/brief', briefPayload),
  analyzeInvestments: (investment_input, profile) => postJSON('/market/investments', { investment_input, profile }),
  analyzeProperty: (property_input, profile) => postJSON('/market/property', { property_input, profile }),
  getMlMetadata: () => getJSON('/market/ml-metadata')
};
