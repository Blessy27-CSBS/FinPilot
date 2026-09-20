import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

class RecurringDetector:
    """
    Detects recurring payments using:
    - merchant similarity
    - amount similarity
    - transaction intervals (weekly, monthly, quarterly, yearly)
    """

    @classmethod
    def detect_recurring(cls, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not transactions:
            return []

        df = pd.DataFrame(transactions)
        if df.empty or "merchant" not in df.columns:
            return []

        # Filter out excluded/transfers and credit items
        df_expenses = df[(df["type"] == "debit") & (~df["is_excluded"])].copy()
        if len(df_expenses) < 2:
            return []

        df_expenses["date"] = pd.to_datetime(df_expenses["date"])
        df_expenses = df_expenses.sort_values(by=["date"])

        recurring_list: List[Dict[str, Any]] = []

        # Group by merchant
        for merchant, group in df_expenses.groupby("merchant"):
            if len(group) < 2:
                continue

            group = group.sort_values(by="date")
            dates = group["date"].tolist()
            amounts = group["amount"].tolist()

            # Calculate intervals in days
            intervals = [(dates[i] - dates[i - 1]).days for i in range(1, len(dates))]
            avg_interval = np.mean(intervals)
            std_interval = np.std(intervals) if len(intervals) > 1 else 0

            # Calculate amount consistency
            avg_amount = np.mean(amounts)
            std_amount = np.std(amounts) if len(amounts) > 1 else 0
            amount_cv = (std_amount / avg_amount) if avg_amount > 0 else 0

            # Determine frequency
            frequency = None
            if 5 <= avg_interval <= 9:
                frequency = "weekly"
            elif 25 <= avg_interval <= 35:
                frequency = "monthly"
            elif 80 <= avg_interval <= 100:
                frequency = "quarterly"
            elif 340 <= avg_interval <= 385:
                frequency = "yearly"

            if frequency and amount_cv < 0.25:
                # High confidence recurring payment
                last_dt = dates[-1]
                if frequency == "weekly":
                    next_dt = last_dt + timedelta(days=7)
                elif frequency == "monthly":
                    next_dt = last_dt + timedelta(days=30)
                elif frequency == "quarterly":
                    next_dt = last_dt + timedelta(days=91)
                else:
                    next_dt = last_dt + timedelta(days=365)

                confidence = max(0.70, min(0.98, 1.0 - (amount_cv * 0.5) - (std_interval / (avg_interval + 1) * 0.2)))

                recurring_list.append({
                    "id": f"rec_{abs(hash(merchant)) % 1000000}",
                    "merchant": str(merchant),
                    "amount": round(float(amounts[-1]), 2),
                    "average_amount": round(float(avg_amount), 2),
                    "frequency": frequency,
                    "category": group["category"].iloc[-1],
                    "occurrences": len(group),
                    "last_payment": last_dt.strftime("%Y-%m-%d"),
                    "next_expected_payment": next_dt.strftime("%Y-%m-%d"),
                    "confidence": round(float(confidence), 2),
                    "transaction_ids": group["id"].tolist() if "id" in group.columns else []
                })

        return recurring_list
