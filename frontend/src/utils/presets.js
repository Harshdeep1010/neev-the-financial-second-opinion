export const DEMO_PRESETS = [
  {
    id: 'aakash_personal_loan',
    title: 'Aakash — Deceptive Pre-Approved Loan Offer',
    tag: 'Loan Evaluation (P0 Demo)',
    description: 'A software engineer evaluating an ₹8 Lakh personal loan offer with hidden processing fees and ambiguous rate type.',
    profile: {
      monthly_income: 120000,
      monthly_essential_expenses: 45000,
      current_savings: 300000,
      emergency_savings: 200000,
      existing_debts: 200000,
      existing_monthly_emi: 15000,
      primary_goal: 'Save for property down payment in 3 years',
      target_horizon_months: 36,
      risk_tolerance: 'moderate'
    },
    offer: {
      raw_text: `Pre-approved loan sanction! Get ₹8,00,000 at an attractive interest rate of 10.5% per annum for a tenure of 48 months. Instant approval with minimal documentation. Processing fee as per bank policy. Prepayment allowed subject to applicable terms. Sanction valid for 48 hours only.`,
      principal: 800000,
      annual_interest_rate_pct: 10.5,
      tenure_months: 48,
      interest_rate_type: 'unknown',
      processing_fee_pct: null,
      processing_fee_amount: null,
      prepayment_penalty_disclosed: false
    }
  },
  {
    id: 'priya_urgent_nbfc',
    title: 'Priya — High DTI & High-Pressure NBFC Offer',
    tag: 'Debt Stress & Pressure Signals',
    description: 'A marketing lead with tight cashflow receiving an aggressive NBFC offer with high interest and urgency tactics.',
    profile: {
      monthly_income: 75000,
      monthly_essential_expenses: 40000,
      current_savings: 80000,
      emergency_savings: 50000,
      existing_debts: 350000,
      existing_monthly_emi: 20000,
      primary_goal: 'Consolidate debt and build 6-month emergency buffer',
      target_horizon_months: 24,
      risk_tolerance: 'conservative'
    },
    offer: {
      raw_text: `URGENT NOTICE: Exclusive sanction of ₹4,00,000 @ 16.5% interest for 24 months. Processing fee 3% applicable. Sanction expires today at 6 PM. Click here immediately to claim disbursement without questions asked!`,
      principal: 400000,
      annual_interest_rate_pct: 16.5,
      tenure_months: 24,
      interest_rate_type: 'fixed',
      processing_fee_pct: 3.0,
      processing_fee_amount: null,
      prepayment_penalty_disclosed: false
    }
  },
  {
    id: 'rohan_home_purchase',
    title: 'Rohan — Property Purchase & Upfront Liquidity Drain',
    tag: 'Property & Down Payment',
    description: 'Evaluating an ₹85 Lakh apartment purchase with ₹20 Lakh down payment and its impact on emergency reserves.',
    profile: {
      monthly_income: 200000,
      monthly_essential_expenses: 70000,
      current_savings: 2600000,
      emergency_savings: 600000,
      existing_debts: 0,
      existing_monthly_emi: 0,
      primary_goal: 'Buy first residential home',
      target_horizon_months: 240,
      risk_tolerance: 'moderate'
    },
    offer: {
      raw_text: `In-principle Home Loan sanction of ₹65,00,000 at 8.75% per annum for 240 months. Processing fee flat ₹10,000 + GST. Property value ₹85,00,000. Current rent paid is ₹32,000/month.`,
      principal: 6500000,
      annual_interest_rate_pct: 8.75,
      tenure_months: 240,
      interest_rate_type: 'floating',
      processing_fee_pct: null,
      processing_fee_amount: 11800,
      prepayment_penalty_disclosed: true
    }
  }
];
