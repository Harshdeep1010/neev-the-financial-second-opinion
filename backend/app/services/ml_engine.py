import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, classification_report
from backend.data.market_benchmarks import generate_historical_benchmark_data

class MarketRegimeModel:
    _instance = None
    
    def __init__(self):
        self.model = None
        self.metrics = {}
        self.latest_features = None
        self.trained = False
        self.train_model()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MarketRegimeModel()
        return cls._instance

    def train_model(self):
        """
        Trains an honest, leakage-free historical volatility regime classifier
        using a strict chronological train/test split.
        """
        df = generate_historical_benchmark_data()
        df["daily_return"] = df["nifty_close"].pct_change()
        
        # Feature Engineering (Strictly backward-looking)
        df["vol_20d"] = df["daily_return"].rolling(window=20).std() * np.sqrt(252) * 100.0
        df["ret_20d"] = df["nifty_close"].pct_change(periods=20) * 100.0
        df["ret_60d"] = df["nifty_close"].pct_change(periods=60) * 100.0
        
        sma_200 = df["nifty_close"].rolling(window=200).mean()
        df["dist_sma200_pct"] = ((df["nifty_close"] - sma_200) / sma_200) * 100.0
        
        rolling_max_252 = df["nifty_close"].rolling(window=252, min_periods=50).max()
        df["drawdown_from_peak_pct"] = ((df["nifty_close"] - rolling_max_252) / rolling_max_252) * 100.0
        
        # Target: Forward 20-day realized volatility
        # Forward window shift(-20) ensures target is strictly in the future
        future_vol = df["daily_return"].shift(-20).rolling(window=20).std() * np.sqrt(252) * 100.0
        
        # Categorize Target Regimes:
        # 0: Low Volatility (< 12%)
        # 1: Moderate Volatility (12% to 20%)
        # 2: High Volatility (>= 20%)
        target = pd.Series(index=df.index, dtype=int)
        target[future_vol < 12.0] = 0
        target[(future_vol >= 12.0) & (future_vol < 20.0)] = 1
        target[future_vol >= 20.0] = 2
        df["target_regime"] = target
        
        # Baseline Feature: Persistence (Predict next regime is identical to current 20d vol regime)
        current_regime = pd.Series(index=df.index, dtype=int)
        current_regime[df["vol_20d"] < 12.0] = 0
        current_regime[(df["vol_20d"] >= 12.0) & (df["vol_20d"] < 20.0)] = 1
        current_regime[df["vol_20d"] >= 20.0] = 2
        df["baseline_pred"] = current_regime
        
        # Drop rows with NaNs caused by rolling windows and forward shifts
        clean_df = df.dropna().copy()
        
        feature_cols = ["vol_20d", "ret_20d", "ret_60d", "dist_sma200_pct", "drawdown_from_peak_pct"]
        
        # Chronological Split:
        # Train on 2018-01-01 to 2022-12-31 (~5 years)
        # Test on 2023-01-01 to 2024-12-31 (~2 years out-of-time evaluation)
        train_mask = clean_df["date"] < pd.Timestamp("2023-01-01")
        test_mask = clean_df["date"] >= pd.Timestamp("2023-01-01")
        
        X_train = clean_df.loc[train_mask, feature_cols]
        y_train = clean_df.loc[train_mask, "target_regime"].astype(int)
        
        X_test = clean_df.loc[test_mask, feature_cols]
        y_test = clean_df.loc[test_mask, "target_regime"].astype(int)
        y_baseline_test = clean_df.loc[test_mask, "baseline_pred"].astype(int)
        
        # Model Training: Random Forest
        clf = RandomForestClassifier(n_estimators=100, max_depth=4, min_samples_leaf=15, random_state=42)
        clf.fit(X_train, y_train)
        
        # Model Evaluation
        y_pred = clf.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        f1_macro = f1_score(y_test, y_pred, average="macro")
        
        # Baseline Comparison
        baseline_acc = accuracy_score(y_test, y_baseline_test)
        baseline_f1 = f1_score(y_test, y_baseline_test, average="macro")
        
        # Feature Importances
        importances = dict(zip(feature_cols, [round(float(v), 3) for v in clf.feature_importances_]))
        
        self.model = clf
        self.feature_cols = feature_cols
        self.latest_features = clean_df.iloc[-1][feature_cols].to_dict()
        self.metrics = {
            "model_type": "Chronologically Split Random Forest Classifier",
            "training_period": "2018-01-01 to 2022-12-31 (Out-of-sample test: 2023–2024)",
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "test_accuracy_pct": round(acc * 100.0, 1),
            "test_macro_f1": round(f1_macro, 3),
            "baseline_accuracy_pct": round(baseline_acc * 100.0, 1),
            "baseline_macro_f1": round(baseline_f1, 3),
            "performance_vs_baseline": f"Model F1 ({round(f1_macro, 2)}) vs Persistence Baseline ({round(baseline_f1, 2)})",
            "feature_importances": importances,
            "target_definition": "Next 20 trading days annualized volatility regime (0: Low <12%, 1: Normal 12-20%, 2: Elevated >20%)",
            "limitations": [
                "Trained on historical index distributions; does not predict black-swan geopolitical shocks or regulatory interventions.",
                "Evaluates volatility regime probability only; does NOT predict stock direction or guarantee investment profit.",
                "Chronological evaluation accounts for regime persistence, but past market conditions never guarantee future risk profiles."
            ]
        }
        self.trained = True

    def predict_regime(self, vol_20d: float, ret_20d: float, ret_60d: float, dist_sma200: float, drawdown: float) -> Tuple[str, float]:
        """
        Runs inference on given asset metrics.
        """
        if not self.trained:
            return "MODERATE_VOLATILITY", 50.0
            
        x = pd.DataFrame([[vol_20d, ret_20d, ret_60d, dist_sma200, drawdown]], columns=self.feature_cols)
        probs = self.model.predict_proba(x)[0]
        pred_class = int(np.argmax(probs))
        confidence = round(float(probs[pred_class]) * 100.0, 1)
        
        labels = {
            0: "LOW_VOLATILITY_STEADY",
            1: "MODERATE_FLUCTUATION",
            2: "ELEVATED_DOWNSIDE_RISK"
        }
        return labels.get(pred_class, "MODERATE_FLUCTUATION"), confidence

ml_service = MarketRegimeModel.get_instance()
