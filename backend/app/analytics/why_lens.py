import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional

class WhyLensEngine:
    """
    WhyLens decomposes category spending differences into:
    1. Price effect (change in average transaction size)
    2. Frequency effect (change in transaction count)
    3. New merchant spending (merchants first visited in current period)
    4. Outlier / One-off spending
    All calculations are strictly computed via Pandas / NumPy.
    """

    @classmethod
    def analyze_category_change(
        cls,
        transactions: List[Dict[str, Any]],
        category: str,
        current_period: Optional[str] = None,
        previous_period: Optional[str] = None
    ) -> Dict[str, Any]:
        
        if not transactions:
            return cls._empty_response(category)

        df = pd.DataFrame(transactions)
        df["date"] = pd.to_datetime(df["date"])
        df["month"] = df["date"].dt.strftime("%Y-%m")
        df_cat = df[(df["category"].str.lower() == category.lower()) & (df["type"] == "debit") & (~df["is_excluded"])].copy()

        if df_cat.empty:
            return cls._empty_response(category)

        available_months = sorted(df["month"].unique().tolist())
        if len(available_months) < 2:
            return cls._empty_response(category, msg="Need at least two months of data for comparative WhyLens analysis.")

        if not current_period:
            current_period = available_months[-1]
        if not previous_period:
            # Pick month right before current_period
            idx = available_months.index(current_period) if current_period in available_months else len(available_months) - 1
            previous_period = available_months[max(0, idx - 1)]

        df_curr = df_cat[df_cat["month"] == current_period]
        df_prev = df_cat[df_cat["month"] == previous_period]

        curr_total = float(df_curr["amount"].sum()) if not df_curr.empty else 0.0
        prev_total = float(df_prev["amount"].sum()) if not df_prev.empty else 0.0
        total_change = round(curr_total - prev_total, 2)
        pct_change = round(((curr_total - prev_total) / prev_total * 100) if prev_total > 0 else 0, 1)

        curr_count = len(df_curr)
        prev_count = len(df_prev)

        curr_avg = curr_total / curr_count if curr_count > 0 else 0.0
        prev_avg = prev_total / prev_count if prev_count > 0 else 0.0

        # 1. New Merchant Spending
        prev_merchants = set(df_prev["merchant"].str.lower().unique()) if not df_prev.empty else set()
        new_merchant_rows = df_curr[~df_curr["merchant"].str.lower().isin(prev_merchants)] if not df_curr.empty else pd.DataFrame()
        new_merchant_spend = float(new_merchant_rows["amount"].sum()) if not new_merchant_rows.empty else 0.0

        new_merchants_list = []
        if not new_merchant_rows.empty:
            for m, g in new_merchant_rows.groupby("merchant"):
                new_merchants_list.append({
                    "merchant": str(m),
                    "total": round(float(g["amount"].sum()), 2),
                    "count": len(g)
                })

        # 2. Outliers (> 2.5 * median of current period)
        curr_median = df_curr["amount"].median() if not df_curr.empty else 0.0
        outlier_rows = df_curr[df_curr["amount"] > max(1500, curr_median * 2.5)] if not df_curr.empty else pd.DataFrame()
        outlier_spend = float(outlier_rows["amount"].sum() - len(outlier_rows) * curr_median) if not outlier_rows.empty else 0.0
        outlier_spend = max(0.0, outlier_spend)

        outliers_list = []
        if not outlier_rows.empty:
            for _, r in outlier_rows.iterrows():
                outliers_list.append({
                    "id": r["id"],
                    "merchant": r["merchant"],
                    "amount": round(float(r["amount"]), 2),
                    "date": r["date"].strftime("%Y-%m-%d")
                })

        # 3. Frequency Effect: (count_curr - count_prev) * avg_prev
        frequency_effect = round((curr_count - prev_count) * prev_avg, 2)

        # 4. Price Effect: (avg_curr - avg_prev) * curr_count
        price_effect = round((curr_avg - prev_avg) * curr_count, 2)

        # Normalize contribution components
        contributions = []
        abs_change = max(1.0, abs(total_change))

        contributions.append({
            "component": "frequency_effect",
            "label": "Order Frequency Shift",
            "amount": frequency_effect,
            "percentage_contribution": round(frequency_effect / abs_change * 100, 1),
            "description": f"{curr_count} orders in {current_period} vs {prev_count} orders in {previous_period}."
        })

        contributions.append({
            "component": "price_effect",
            "label": "Ticket Size Shift",
            "amount": price_effect,
            "percentage_contribution": round(price_effect / abs_change * 100, 1),
            "description": f"Average ticket was ₹{curr_avg:,.0f} vs ₹{prev_avg:,.0f} previously."
        })

        if new_merchant_spend > 0:
            contributions.append({
                "component": "new_merchant",
                "label": "New Merchants",
                "amount": round(new_merchant_spend, 2),
                "percentage_contribution": round(new_merchant_spend / abs_change * 100, 1),
                "description": f"First-time spend at: {', '.join([m['merchant'] for m in new_merchants_list[:3]])}."
            })

        if outlier_spend > 0:
            contributions.append({
                "component": "outlier",
                "label": "One-off / Outlier Spends",
                "amount": round(outlier_spend, 2),
                "percentage_contribution": round(outlier_spend / abs_change * 100, 1),
                "description": f"Unusually large single orders identified in {current_period}."
            })

        direction = "increased" if total_change >= 0 else "decreased"
        explanation = (
            f"{category} spending {direction} by ₹{abs(total_change):,.0f} ({pct_change:+0.1f}%) "
            f"from ₹{prev_total:,.0f} ({previous_period}) to ₹{curr_total:,.0f} ({current_period}). "
            f"Key factor: {contributions[0]['label']} contributed ₹{abs(contributions[0]['amount']):,.0f}."
        )

        return {
            "category": category,
            "current_period": current_period,
            "previous_period": previous_period,
            "current_total": round(curr_total, 2),
            "previous_total": round(prev_total, 2),
            "total_change": total_change,
            "percent_change": pct_change,
            "contributions": contributions,
            "new_merchants": new_merchants_list,
            "outliers": outliers_list,
            "explanation": explanation,
            "evidence_id": f"ev_why_{category.lower()}_{current_period}"
        }

    @classmethod
    def _empty_response(cls, category: str, msg: str = "Insufficient comparative data for this category.") -> Dict[str, Any]:
        return {
            "category": category,
            "current_period": "",
            "previous_period": "",
            "current_total": 0.0,
            "previous_total": 0.0,
            "total_change": 0.0,
            "percent_change": 0.0,
            "contributions": [],
            "new_merchants": [],
            "outliers": [],
            "explanation": msg,
            "evidence_id": None
        }
