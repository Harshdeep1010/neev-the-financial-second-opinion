import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_historical_benchmark_data():
    """
    Generates a reproducible 7-year daily benchmark dataset (2018-01-01 to 2024-12-31)
    for Indian equities (NIFTY 50 proxy), Sovereign Gold, and Bank Fixed Deposits,
    modeling historical shocks (e.g. 2020 pandemic crash, 2021 bull run, 2022 rate hike consolidation).
    """
    np.random.seed(42) # Strict reproducibility
    start_date = datetime(2018, 1, 1)
    dates = [start_date + timedelta(days=i) for i in range(2550) if (start_date + timedelta(days=i)).weekday() < 5]
    
    n_days = len(dates)
    
    # Simulate NIFTY-like price series with realistic historical regimes
    nifty_prices = [10500.0]
    gold_prices = [30000.0]
    fd_values = [10000.0]
    
    fd_daily_rate = (0.065 / 252.0)
    
    for i in range(1, n_days):
        dt = dates[i]
        
        # Volatility regime conditioning
        if datetime(2020, 2, 15) <= dt <= datetime(2020, 5, 1):
            # Covid crash & spike
            daily_vol_nifty = 0.035
            drift_nifty = -0.005 if dt < datetime(2020, 3, 24) else 0.006
            daily_vol_gold = 0.015
            drift_gold = 0.003 # gold safe haven spike
        elif datetime(2020, 5, 2) <= dt <= datetime(2021, 10, 1):
            # Recovery & liquidity expansion
            daily_vol_nifty = 0.012
            drift_nifty = 0.0012
            daily_vol_gold = 0.010
            drift_gold = 0.0002
        elif datetime(2022, 1, 1) <= dt <= datetime(2022, 10, 1):
            # Inflation & rate hikes
            daily_vol_nifty = 0.016
            drift_nifty = -0.0002
            daily_vol_gold = 0.012
            drift_gold = 0.0008
        else:
            # Steady normal regime
            daily_vol_nifty = 0.009
            drift_nifty = 0.0005
            daily_vol_gold = 0.007
            drift_gold = 0.0003
            
        r_nifty = np.random.normal(drift_nifty, daily_vol_nifty)
        r_gold = np.random.normal(drift_gold, daily_vol_gold)
        
        new_nifty = nifty_prices[-1] * (1.0 + r_nifty)
        new_gold = gold_prices[-1] * (1.0 + r_gold)
        new_fd = fd_values[-1] * (1.0 + fd_daily_rate)
        
        nifty_prices.append(new_nifty)
        gold_prices.append(new_gold)
        fd_values.append(new_fd)
        
    df = pd.DataFrame({
        "date": dates,
        "nifty_close": nifty_prices,
        "gold_close": gold_prices,
        "fd_nav": fd_values
    })
    return df
