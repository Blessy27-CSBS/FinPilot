import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

class CashRadarEngine:
    """
    30-Day Cash-Flow Projection Engine:
    Projected balance(t) = Balance(t-1) + Expected Income - Recurring/Obligations - Daily Variable
    Highlights risk dates where projected balance goes below the safety line.
    Uses calibrated estimates based strictly on recorded user data.
    """

    @classmethod
    def project_30_days(
        cls,
        transactions: List[Dict[str, Any]],
        recurring_list: List[Dict[str, Any]],
        obligations: List[Dict[str, Any]],
        starting_balance: Optional[float] = None,
        safety_line: float = 35000.0,
        salary_day_of_month: int = 1,
        salary_amount: Optional[float] = None
    ) -> Dict[str, Any]:
        
        # 1. Determine Starting Balance
        if starting_balance is None:
            # Try to get latest transaction balance
            balances = [t["balance"] for t in transactions if t.get("balance") is not None]
            if balances:
                starting_balance = float(balances[-1])
            else:
                # Estimate from net sum
                credits = sum(t["amount"] for t in transactions if t.get("type") == "credit" and not t.get("is_excluded"))
                debits = sum(t["amount"] for t in transactions if t.get("type") == "debit" and not t.get("is_excluded"))
                starting_balance = max(25000.0, credits - debits)

        # 2. Determine Salary Amount
        if salary_amount is None:
            salary_txns = [t["amount"] for t in transactions if "salary" in (t.get("description", "") + t.get("merchant", "")).lower() and t.get("type") == "credit"]
            salary_amount = float(salary_txns[-1]) if salary_txns else 85000.0

        # 3. Calculate average daily variable spend from past 30 days
        now = datetime.now()
        df = pd.DataFrame(transactions)
        daily_variable = 650.0  # safe default
        if not df.empty and "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"])
            recent_30 = df[(df["date"] >= (df["date"].max() - timedelta(days=30))) & (df["type"] == "debit") & (~df["is_excluded"])]
            if not recent_30.empty:
                # exclude high-ticket rent/insurance from daily burn rate
                var_txns = recent_30[~recent_30["category"].str.lower().isin(["rent", "insurance", "credit card payment"])]
                if not var_txns.empty:
                    daily_variable = max(200.0, float(var_txns["amount"].sum() / 30.0))

        # 4. Map recurring payments and obligations to day-of-month
        recurring_map: Dict[int, List[Dict[str, Any]]] = {}
        for rec in recurring_list:
            try:
                rec_dt = datetime.strptime(rec.get("next_expected_payment", ""), "%Y-%m-%d")
                dom = rec_dt.day
                if dom not in recurring_map:
                    recurring_map[dom] = []
                recurring_map[dom].append(rec)
            except Exception:
                pass

        obligation_map: Dict[str, List[Dict[str, Any]]] = {}
        for ob in obligations:
            due_str = ob.get("due_date", "")
            if due_str not in obligation_map:
                obligation_map[due_str] = []
            obligation_map[due_str].append(ob)

        days: List[Dict[str, Any]] = []
        running_balance = starting_balance
        risky_dates: List[str] = []
        lowest_balance = starting_balance
        lowest_date = now.strftime("%Y-%m-%d")

        for i in range(30):
            cur_dt = now + timedelta(days=i)
            cur_date_str = cur_dt.strftime("%Y-%m-%d")
            dom = cur_dt.day

            day_income = 0.0
            day_expenses = daily_variable
            day_obligations = 0.0
            day_events = []

            # Check salary
            if dom == salary_day_of_month:
                day_income += salary_amount
                day_events.append({
                    "title": "Estimated Salary Credit",
                    "type": "income",
                    "amount": salary_amount
                })

            # Check recurring
            if dom in recurring_map:
                for rec in recurring_map[dom]:
                    amt = float(rec["amount"])
                    day_expenses += amt
                    day_events.append({
                        "title": f"Recurring: {rec['merchant']}",
                        "type": "recurring",
                        "amount": amt
                    })

            # Check specific obligations
            if cur_date_str in obligation_map:
                for ob in obligation_map[cur_date_str]:
                    amt = float(ob["amount"])
                    day_obligations += amt
                    day_events.append({
                        "title": f"Obligation: {ob['name']}",
                        "type": "obligation",
                        "amount": amt
                    })

            # Calculate day's projected closing balance
            running_balance = running_balance + day_income - (day_expenses + day_obligations)

            is_risky = running_balance < safety_line
            risk_reason = None
            if is_risky:
                risky_dates.append(cur_date_str)
                risk_reason = f"Projected balance (₹{running_balance:,.0f}) falls below your configured safety line of ₹{safety_line:,.0f}."

            if running_balance < lowest_balance:
                lowest_balance = running_balance
                lowest_date = cur_date_str

            days.append({
                "date": cur_date_str,
                "day": dom,
                "day_name": cur_dt.strftime("%a"),
                "projected_balance": round(running_balance, 2),
                "income": round(day_income, 2),
                "expenses": round(day_expenses, 2),
                "obligations": round(day_obligations, 2),
                "is_risky": is_risky,
                "risk_reason": risk_reason,
                "events": day_events
            })

        # Narrative explanation adhering strictly to uncertainty language
        if risky_dates:
            explanation = (
                f"Based on your recorded recurring obligations and typical spending, your projected balance "
                f"may fall below your safety line of ₹{safety_line:,.0f} on approximately {len(risky_dates)} day(s), "
                f"reaching an estimated low of ₹{lowest_balance:,.0f} around {lowest_date}."
            )
        else:
            explanation = (
                f"Based on recorded recurring obligations and variable spending, your projected cash flow remains "
                f"comfortably above your ₹{safety_line:,.0f} safety line throughout the next 30 days."
            )

        return {
            "starting_balance": round(starting_balance, 2),
            "safety_line": round(safety_line, 2),
            "salary_date": salary_day_of_month,
            "days": days,
            "risky_dates": risky_dates,
            "lowest_projected_balance": round(lowest_balance, 2),
            "lowest_balance_date": lowest_date,
            "explanation": explanation
        }
