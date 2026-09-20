import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

class SubscriptionIntelligence:
    """
    Analyzes subscriptions:
    - Service name, current price, previous price
    - Annualized cost
    - Next renewal date
    - Price creep detection
    - Overlapping service categories
    """

    OVERLAP_DOMAINS = {
        "video_streaming": ["netflix", "amazon prime", "hotstar", "disney", "youtube premium", "sony liv", "zee5", "hulu", "apple tv"],
        "music_streaming": ["spotify", "apple music", "youtube music", "amazon music", "gaana", "wynk"],
        "cloud_storage": ["google one", "icloud", "dropbox", "onedrive"],
        "productivity": ["notion", "chatgpt", "midjourney", "github copilot", "canva"]
    }

    @classmethod
    def analyze_subscriptions(cls, transactions: List[Dict[str, Any]], recurring_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not transactions:
            return []

        df = pd.DataFrame(transactions)
        df_sub = df[(df["category"] == "Subscription") | (df["merchant"].str.lower().str.contains("netflix|spotify|prime|google one|hotstar|youtube|apple|cloud|storage", regex=True))].copy()
        
        subscriptions: List[Dict[str, Any]] = []
        if df_sub.empty:
            return []

        df_sub["date"] = pd.to_datetime(df_sub["date"])
        df_sub = df_sub.sort_values(by=["date"])

        # Map active services
        service_names = df_sub["merchant"].unique()
        all_detected_merchants = [s.lower() for s in service_names]

        for s_name in service_names:
            group = df_sub[df_sub["merchant"] == s_name].sort_values(by="date")
            amounts = group["amount"].tolist()
            dates = group["date"].tolist()

            current_price = float(amounts[-1])
            previous_price = float(amounts[-2]) if len(amounts) > 1 else current_price
            price_creep = round(current_price - previous_price, 2)

            # Frequency detection (default monthly)
            frequency = "monthly"
            annualized_cost = current_price * 12

            # Check if interval indicates annual
            if len(dates) >= 2:
                days_diff = (dates[-1] - dates[-2]).days
                if days_diff > 300:
                    frequency = "yearly"
                    annualized_cost = current_price

            last_dt = dates[-1]
            if frequency == "monthly":
                next_renewal = (last_dt + timedelta(days=30)).strftime("%Y-%m-%d")
            else:
                next_renewal = (last_dt + timedelta(days=365)).strftime("%Y-%m-%d")

            # Check potential overlaps
            m_lower = s_name.lower()
            potential_overlap = None
            for domain, services in cls.OVERLAP_DOMAINS.items():
                if any(k in m_lower for k in services):
                    # Check if user has other services in this domain
                    matches = [other for other in all_detected_merchants if other != m_lower and any(k in other for k in services)]
                    if matches:
                        potential_overlap = f"Potential overlap in {domain.replace('_', ' ')} with {', '.join([m.title() for m in matches])}"
                    break

            subscriptions.append({
                "id": f"sub_{abs(hash(s_name)) % 1000000}",
                "service": str(s_name),
                "current_price": round(current_price, 2),
                "previous_price": round(previous_price, 2) if previous_price != current_price else None,
                "frequency": frequency,
                "annualized_cost": round(annualized_cost, 2),
                "next_renewal": next_renewal,
                "price_creep": price_creep,
                "category": "Subscription",
                "potential_overlap": potential_overlap,
                "last_payment_date": last_dt.strftime("%Y-%m-%d"),
                "payment_count": len(group)
            })

        return subscriptions
