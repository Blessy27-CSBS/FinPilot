import pandas as pd
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.app.database import get_connection

class MonthlySummaryEngine:
    """
    Computes deterministic monthly financial summaries and a transparent,
    rule-based Money Health Score (0-100).
    Never uses an LLM to calculate arithmetic or financial health metrics.
    """

    @classmethod
    def calculate_summary(cls, transactions: List[Dict[str, Any]], month_str: Optional[str] = None) -> Dict[str, Any]:
        if not transactions:
            return cls._empty_summary()

        df = pd.DataFrame(transactions)
        df["date"] = pd.to_datetime(df["date"])
        df["month"] = df["date"].dt.strftime("%Y-%m")

        target_month = month_str or df["month"].max()
        df_curr = df[df["month"] == target_month].copy()

        if df_curr.empty:
            return cls._empty_summary()

        # Income: credits excluding transfers & refunds
        df_income = df_curr[(df_curr["type"] == "credit") & (~df_curr["is_excluded"]) & (~df_curr["category"].str.lower().str.contains("refund"))]
        total_income = float(df_income["amount"].sum())

        # Expenses: debits excluding transfers & cc payments
        df_expenses = df_curr[(df_curr["type"] == "debit") & (~df_curr["is_excluded"])]
        total_expenses = float(df_expenses["amount"].sum())

        net_savings = round(total_income - total_expenses, 2)
        savings_rate = round((net_savings / total_income * 100) if total_income > 0 else 0, 1)

        # Top Categories
        top_categories = []
        if not df_expenses.empty:
            cat_group = df_expenses.groupby("category")["amount"].sum().reset_index()
            cat_group = cat_group.sort_values(by="amount", ascending=False)
            for _, r in cat_group.iterrows():
                amt = float(r["amount"])
                top_categories.append({
                    "category": r["category"],
                    "amount": round(amt, 2),
                    "percentage": round((amt / total_expenses * 100) if total_expenses > 0 else 0, 1)
                })

        # Largest Transactions
        largest_transactions = []
        if not df_expenses.empty:
            df_large = df_expenses.sort_values(by="amount", ascending=False).head(5)
            for _, r in df_large.iterrows():
                largest_transactions.append({
                    "id": r["id"],
                    "merchant": r["merchant"],
                    "category": r["category"],
                    "amount": round(float(r["amount"]), 2),
                    "date": r["date"].strftime("%Y-%m-%d")
                })

        # Budgets & Adherence
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT category, amount FROM budgets")
        budgets_rows = cursor.fetchall()
        
        budget_performance = []
        categories_under_budget = 0
        total_budgeted_categories = len(budgets_rows)

        for b in budgets_rows:
            cat_name = b["category"]
            b_amt = float(b["amount"])
            spent = float(df_expenses[df_expenses["category"].str.lower() == cat_name.lower()]["amount"].sum()) if not df_expenses.empty else 0.0
            remaining = b_amt - spent
            pct_used = round((spent / b_amt * 100) if b_amt > 0 else 0, 1)
            is_under = spent <= b_amt
            if is_under:
                categories_under_budget += 1

            budget_performance.append({
                "category": cat_name,
                "budget": b_amt,
                "spent": round(spent, 2),
                "remaining": round(remaining, 2),
                "percent_used": pct_used,
                "status": "within_budget" if is_under else "over_budget"
            })

        # Goals count & contribution
        cursor.execute("SELECT COUNT(*) as cnt, SUM(monthly_contribution) as total_contr FROM goals")
        goal_summary = cursor.fetchone()
        goal_count = goal_summary["cnt"] if goal_summary else 0
        conn.close()

        # Transparent Rule-Based Health Score (0-100)
        # 1. Budget adherence (max 25)
        adherence_ratio = (categories_under_budget / total_budgeted_categories) if total_budgeted_categories > 0 else 0.8
        score_budget = int(round(adherence_ratio * 25))

        # 2. Savings trend (max 25)
        if savings_rate >= 30:
            score_savings = 25
        elif savings_rate >= 20:
            score_savings = 20
        elif savings_rate >= 10:
            score_savings = 15
        elif savings_rate > 0:
            score_savings = 10
        else:
            score_savings = 3

        # 3. Obligation load (max 20)
        # Committed vs Income
        committed_spend = float(df_expenses[df_expenses["category"].str.lower().isin(["rent", "subscription", "utilities", "insurance"])]["amount"].sum()) if not df_expenses.empty else 0.0
        comm_ratio = (committed_spend / total_income) if total_income > 0 else 0.5
        if comm_ratio <= 0.40:
            score_obligation = 20
        elif comm_ratio <= 0.50:
            score_obligation = 16
        elif comm_ratio <= 0.65:
            score_obligation = 11
        else:
            score_obligation = 6

        # 4. Cash-flow safety (max 15)
        score_cashflow = 14 if net_savings >= 0 else 7

        # 5. Goal progress (max 15)
        score_goal = 15 if goal_count > 0 else 8

        total_health_score = min(100, max(0, score_budget + score_savings + score_obligation + score_cashflow + score_goal))

        grade = "Strong" if total_health_score >= 80 else ("Moderate" if total_health_score >= 60 else "Needs Attention")

        score_breakdown = [
            {"factor": "Budget Adherence", "points": score_budget, "max": 25, "reason": f"{categories_under_budget} of {total_budgeted_categories} tracked categories remained within target limits."},
            {"factor": "Savings Trend", "points": score_savings, "max": 25, "reason": f"Net savings rate was recorded at {savings_rate:0.1f}% for the period."},
            {"factor": "Obligation Load", "points": score_obligation, "max": 20, "reason": f"Fixed commitments represent {comm_ratio*100:0.1f}% of monthly income."},
            {"factor": "Cash-Flow Safety", "points": score_cashflow, "max": 15, "reason": "Positive operational monthly cash margin recorded."},
            {"factor": "Goal Progress", "points": score_goal, "max": 15, "reason": f"Active contribution tracking enabled across {goal_count} designated savings goals."}
        ]

        # Key Observations & Non-prescriptive action items
        key_observations = [
            f"Monthly income recorded at ₹{total_income:,.0f} with total expenses of ₹{total_expenses:,.0f}.",
            f"Net savings totaled ₹{net_savings:,.0f} representing a savings rate of {savings_rate:0.1f}%.",
            f"Top spending category was {top_categories[0]['category']} at ₹{top_categories[0]['amount']:,.0f} ({top_categories[0]['percentage']}% of expenses)." if top_categories else "Spending evenly distributed."
        ]

        action_items = [
            "Review categories nearing or exceeding designated monthly thresholds.",
            "Inspect the ProofTrail evidence panel for significant category shifts.",
            "Verify that upcoming subscription renewals align with active service usage."
        ]

        return {
            "period": target_month,
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "net_savings": round(net_savings, 2),
            "savings_rate": savings_rate,
            "top_categories": top_categories,
            "largest_transactions": largest_transactions,
            "budget_performance": budget_performance,
            "money_health_score": {
                "total_score": total_health_score,
                "grade": grade,
                "budget_adherence_score": score_budget,
                "obligation_load_score": score_obligation,
                "savings_trend_score": score_savings,
                "cash_flow_safety_score": score_cashflow,
                "goal_progress_score": score_goal,
                "breakdown": score_breakdown,
                "summary_text": f"Rule-based Money Health Index calculated at {total_health_score}/100 ({grade}). Insights only, not financial advice."
            },
            "key_observations": key_observations,
            "action_items": action_items
        }

    @classmethod
    def _empty_summary(cls) -> Dict[str, Any]:
        return {
            "period": datetime.now().strftime("%Y-%m"),
            "total_income": 0.0,
            "total_expenses": 0.0,
            "net_savings": 0.0,
            "savings_rate": 0.0,
            "top_categories": [],
            "largest_transactions": [],
            "budget_performance": [],
            "money_health_score": {
                "total_score": 50,
                "grade": "Moderate",
                "budget_adherence_score": 10,
                "obligation_load_score": 10,
                "savings_trend_score": 10,
                "cash_flow_safety_score": 10,
                "goal_progress_score": 10,
                "breakdown": [],
                "summary_text": "Insufficient transaction history to calculate Money Health Index."
            },
            "key_observations": ["Awaiting initial transaction import."],
            "action_items": ["Import CSV or PDF statements to generate personalized metrics."]
        }
