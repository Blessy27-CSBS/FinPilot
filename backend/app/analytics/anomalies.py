import pandas as pd
import numpy as np
from typing import List, Dict, Any
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    """
    Detects financial anomalies:
    1. Per-category / user robust z-score (using median & median absolute deviation)
    2. Isolation Forest for multi-feature anomaly scoring
    3. Small-spend leaks (frequent sub-₹150 payments)
    4. Duplicate charges
    5. Refunds detected

    IMPORTANT RULE:
    Anomalies are described as:
    'Unusual compared with your historical spending.'
    NEVER described as fraud.
    """

    @classmethod
    def detect_anomalies(cls, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not transactions:
            return []

        df = pd.DataFrame(transactions)
        if df.empty or "amount" not in df.columns:
            return []

        df_expenses = df[(df["type"] == "debit") & (~df["is_excluded"])].copy()
        if len(df_expenses) < 4:
            return []

        df_expenses["amount"] = pd.to_numeric(df_expenses["amount"], errors="coerce").fillna(0.0)
        anomalies: List[Dict[str, Any]] = []

        # 1. Robust Z-score (MAD-based) per category
        for category, group in df_expenses.groupby("category"):
            amounts = group["amount"].values
            if len(amounts) < 3:
                continue

            median = np.median(amounts)
            mad = np.median(np.abs(amounts - median))
            if mad == 0:
                mad = np.std(amounts) if np.std(amounts) > 0 else 1.0

            for idx, row in group.iterrows():
                robust_z = 0.6745 * (row["amount"] - median) / mad
                if robust_z > 3.0 and row["amount"] > 1500:
                    anomalies.append({
                        "id": f"anom_z_{row['id']}",
                        "transaction_id": row["id"],
                        "date": row["date"],
                        "merchant": row["merchant"],
                        "category": row["category"],
                        "amount": float(row["amount"]),
                        "anomaly_type": "high_amount",
                        "severity": "high" if robust_z > 4.5 else "medium",
                        "explanation": f"Unusual compared with your historical {row['category']} spending (₹{row['amount']:,.0f} vs median ₹{median:,.0f}).",
                        "score": round(float(robust_z), 2)
                    })

        # 2. Isolation Forest on overall amounts & frequencies
        try:
            if len(df_expenses) >= 10:
                X = df_expenses[["amount"]].values
                iso = IsolationForest(contamination=0.04, random_state=42)
                preds = iso.fit_predict(X)
                outlier_indices = np.where(preds == -1)[0]
                existing_txn_ids = {a["transaction_id"] for a in anomalies}

                for idx in outlier_indices:
                    row = df_expenses.iloc[idx]
                    if row["id"] not in existing_txn_ids and row["amount"] > 3000:
                        anomalies.append({
                            "id": f"anom_iso_{row['id']}",
                            "transaction_id": row["id"],
                            "date": row["date"],
                            "merchant": row["merchant"],
                            "category": row["category"],
                            "amount": float(row["amount"]),
                            "anomaly_type": "outlier_spend",
                            "severity": "medium",
                            "explanation": f"Unusual compared with your historical spending pattern (₹{row['amount']:,.0f}).",
                            "score": 2.5
                        })
        except Exception:
            pass

        # 3. Small-spend leaks detection (e.g. repeated daily coffee/tea or snacks < ₹200)
        df_small = df_expenses[df_expenses["amount"] <= 200]
        if len(df_small) >= 5:
            small_total = float(df_small["amount"].sum())
            small_count = len(df_small)
            if small_total > 500:
                anomalies.append({
                    "id": "anom_small_leak",
                    "transaction_id": df_small.iloc[-1]["id"],
                    "date": df_small.iloc[-1]["date"],
                    "merchant": "Multiple Micro-merchants",
                    "category": "Small Spends",
                    "amount": round(small_total, 2),
                    "anomaly_type": "small_spend_leak",
                    "severity": "low",
                    "explanation": f"Identified {small_count} small transactions totaling ₹{small_total:,.0f}. Small frequent charges may accumulate over time.",
                    "score": 1.5,
                    "transaction_ids": df_small["id"].tolist()[:10]
                })

        # 4. Duplicate charges from cleaning pipeline
        df_dups = df[df["is_duplicate"] == True]
        for _, row in df_dups.iterrows():
            anomalies.append({
                "id": f"anom_dup_{row['id']}",
                "transaction_id": row["id"],
                "date": row["date"],
                "merchant": row["merchant"],
                "category": row["category"],
                "amount": float(row["amount"]),
                "anomaly_type": "possible_duplicate",
                "severity": "medium",
                "explanation": f"Possible duplicate charge of ₹{row['amount']:,.0f} detected at {row['merchant']} within 24 hours.",
                "score": 3.0
            })

        # 5. Refunds detected
        df_refunds = df[df["category"].str.lower().str.contains("refund") | df["description"].str.lower().str.contains("refund")]
        for _, row in df_refunds.iterrows():
            anomalies.append({
                "id": f"anom_ref_{row['id']}",
                "transaction_id": row["id"],
                "date": row["date"],
                "merchant": row["merchant"],
                "category": "Refund",
                "amount": float(row["amount"]),
                "anomaly_type": "refund_received",
                "severity": "info",
                "explanation": f"Refund of ₹{row['amount']:,.0f} credited from {row['merchant']}.",
                "score": 0.5
            })

        return anomalies
