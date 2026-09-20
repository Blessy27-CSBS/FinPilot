import pandas as pd
from typing import List, Dict, Any, Optional
from backend.app.schemas import CommitStackResult, CommitStackItem
from backend.app.database import get_connection

class CommitStackEngine:
    """
    CommitStack calculates monthly income allocation:
    1. Committed money (Rent, EMI, Utilities, Subscriptions, Insurance, Obligations)
    2. Goal contributions
    3. Typical variable spending
    4. Truly free money = Monthly income - (Committed + Goals + Variable)
    """

    COMMITTED_CATEGORIES = ["rent", "subscription", "utilities", "insurance", "emi", "loan"]

    @classmethod
    def calculate(cls, transactions: List[Dict[str, Any]], month_str: Optional[str] = None) -> Dict[str, Any]:
        if not transactions:
            return {
                "monthly_income": 0.0,
                "committed_amount": 0.0,
                "goal_contributions": 0.0,
                "typical_variable": 0.0,
                "free_money": 0.0,
                "committed_percentage": 0.0,
                "free_money_percentage": 0.0,
                "committed_items": [],
                "evidence_id": None
            }

        df = pd.DataFrame(transactions)
        df["date"] = pd.to_datetime(df["date"])
        df["month"] = df["date"].dt.strftime("%Y-%m")

        target_month = month_str or df["month"].max()
        df_curr = df[df["month"] == target_month].copy()
        
        # Monthly income: credits excluding transfers & refunds
        df_income = df_curr[(df_curr["type"] == "credit") & (~df_curr["is_excluded"]) & (~df_curr["category"].str.lower().str.contains("refund"))]
        monthly_income = float(df_income["amount"].sum())
        if monthly_income == 0:
            # Fallback to historical average monthly income
            df_hist_income = df[(df["type"] == "credit") & (~df["is_excluded"]) & (~df["category"].str.lower().str.contains("refund"))]
            months_count = max(1, df_hist_income["month"].nunique())
            monthly_income = float(df_hist_income["amount"].sum() / months_count)

        # Committed spending
        df_expenses = df_curr[(df_curr["type"] == "debit") & (~df_curr["is_excluded"])].copy()
        
        # Categorize into committed vs variable
        committed_rows = []
        variable_rows = []

        for _, row in df_expenses.iterrows():
            cat_lower = str(row["category"]).lower()
            m_lower = str(row["merchant"]).lower()
            is_comm = any(c in cat_lower for c in cls.COMMITTED_CATEGORIES) or row.get("is_recurring", False)
            if is_comm:
                committed_rows.append(row)
            else:
                variable_rows.append(row)

        df_comm = pd.DataFrame(committed_rows) if committed_rows else pd.DataFrame(columns=df_expenses.columns)
        df_var = pd.DataFrame(variable_rows) if variable_rows else pd.DataFrame(columns=df_expenses.columns)

        committed_amount = float(df_comm["amount"].sum()) if not df_comm.empty else 0.0
        typical_variable = float(df_var["amount"].sum()) if not df_var.empty else 0.0

        # Goal contributions from database
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT SUM(monthly_contribution) as total_goals FROM goals")
        goal_row = cursor.fetchone()
        goal_contributions = float(goal_row["total_goals"] or 0.0) if goal_row else 0.0
        conn.close()

        total_allocated = committed_amount + goal_contributions + typical_variable
        free_money = max(0.0, monthly_income - total_allocated)

        committed_pct = round((committed_amount / monthly_income * 100) if monthly_income > 0 else 0, 1)
        free_pct = round((free_money / monthly_income * 100) if monthly_income > 0 else 0, 1)

        # Group committed items by merchant or category
        committed_items: List[Dict[str, Any]] = []
        if not df_comm.empty:
            for m_name, group in df_comm.groupby("merchant"):
                committed_items.append({
                    "name": str(m_name),
                    "category": group["category"].iloc[0],
                    "amount": round(float(group["amount"].sum()), 2),
                    "type": "committed"
                })

        committed_items.sort(key=lambda x: x["amount"], reverse=True)

        return {
            "monthly_income": round(monthly_income, 2),
            "committed_amount": round(committed_amount, 2),
            "goal_contributions": round(goal_contributions, 2),
            "typical_variable": round(typical_variable, 2),
            "free_money": round(free_money, 2),
            "committed_percentage": committed_pct,
            "free_money_percentage": free_pct,
            "committed_items": committed_items,
            "evidence_id": f"ev_commit_{target_month}"
        }
