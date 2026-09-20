import json
from typing import Dict, Any, List, Optional
import pandas as pd
from backend.app.database import get_connection
from backend.app.analytics.monthly_summary import MonthlySummaryEngine
from backend.app.analytics.commit_stack import CommitStackEngine
from backend.app.analytics.cash_radar import CashRadarEngine
from backend.app.analytics.why_lens import WhyLensEngine
from backend.app.analytics.goal_shift import GoalShiftEngine
from backend.app.analytics.recurring import RecurringDetector
from backend.app.analytics.subscriptions import SubscriptionIntelligence
from backend.app.analytics.anomalies import AnomalyDetector
from backend.app.analytics.evidence import ProofTrailRegistry

def _load_all_transactions() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions ORDER BY date ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def tool_get_monthly_summary(period: Optional[str] = None) -> Dict[str, Any]:
    txns = _load_all_transactions()
    summary = MonthlySummaryEngine.calculate_summary(txns, period)
    ev_id = f"ev_summary_{summary.get('period', 'current')}"
    
    # Register evidence
    txns_in_period = [t["id"] for t in txns if t.get("date", "").startswith(summary.get("period", ""))]
    ProofTrailRegistry.register_evidence(
        evidence_id=ev_id,
        insight_key="monthly_summary",
        title=f"Monthly Summary for {summary.get('period')}",
        result_summary=f"Income: ₹{summary['total_income']:,.0f} | Expenses: ₹{summary['total_expenses']:,.0f} | Savings: ₹{summary['net_savings']:,.0f}",
        formula="Net Savings = Total Income - Total Expenses",
        transaction_ids=txns_in_period[:25],
        supporting_data={
            "income": summary["total_income"],
            "expenses": summary["total_expenses"],
            "savings": summary["net_savings"],
            "savings_rate": summary["savings_rate"]
        },
        explanation=f"Calculated across {len(txns_in_period)} recorded transactions for {summary.get('period')}."
    )
    summary["evidence_id"] = ev_id
    return summary

def tool_get_category_breakdown(category: Optional[str] = None, period: Optional[str] = None) -> Dict[str, Any]:
    txns = _load_all_transactions()
    if not txns:
        return {"category": category or "All", "total": 0.0, "transactions_count": 0, "transaction_ids": []}

    df = pd.DataFrame(txns)
    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.strftime("%Y-%m")
    target_period = period or df["month"].max()

    df_filtered = df[(df["month"] == target_period) & (df["type"] == "debit") & (~df["is_excluded"])]
    
    if category and category.lower() != "all":
        df_cat = df_filtered[df_filtered["category"].str.lower() == category.lower()]
        total = float(df_cat["amount"].sum())
        txn_ids = df_cat["id"].tolist()
        
        ev_id = f"ev_cat_{category.lower()}_{target_period}"
        ProofTrailRegistry.register_evidence(
            evidence_id=ev_id,
            insight_key="category_breakdown",
            title=f"{category} Spending for {target_period}",
            result_summary=f"Total: ₹{total:,.0f} across {len(txn_ids)} transactions",
            formula=f"sum(amount where category = '{category}' and month = '{target_period}')",
            transaction_ids=txn_ids,
            supporting_data={"category": category, "period": target_period, "total": total},
            explanation=f"Computed from all debit entries categorized under {category}."
        )

        return {
            "category": category,
            "period": target_period,
            "total": round(total, 2),
            "transactions_count": len(txn_ids),
            "transaction_ids": txn_ids,
            "evidence_id": ev_id
        }
    else:
        cat_totals = df_filtered.groupby("category")["amount"].sum().to_dict()
        return {
            "period": target_period,
            "breakdown": {k: round(float(v), 2) for k, v in cat_totals.items()},
            "total_expenses": round(float(df_filtered["amount"].sum()), 2)
        }

def tool_get_top_spending(limit: int = 5, period: Optional[str] = None) -> Dict[str, Any]:
    txns = _load_all_transactions()
    df = pd.DataFrame(txns)
    if df.empty:
        return {"items": []}
    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.strftime("%Y-%m")
    target_month = period or df["month"].max()

    df_debits = df[(df["month"] == target_month) & (df["type"] == "debit") & (~df["is_excluded"])].sort_values(by="amount", ascending=False).head(limit)
    items = []
    for _, r in df_debits.iterrows():
        items.append({
            "id": r["id"],
            "merchant": r["merchant"],
            "category": r["category"],
            "amount": round(float(r["amount"]), 2),
            "date": r["date"].strftime("%Y-%m-%d")
        })

    ev_id = f"ev_top_spend_{target_month}"
    ProofTrailRegistry.register_evidence(
        evidence_id=ev_id,
        insight_key="top_spending",
        title=f"Top {limit} Expenses in {target_month}",
        result_summary=f"Largest item: {items[0]['merchant']} (₹{items[0]['amount']:,.0f})" if items else "No expenses",
        formula=f"Top {limit} debit transactions sorted by amount descending",
        transaction_ids=[i["id"] for i in items],
        supporting_data={"items": items},
        explanation=f"Ranked single transactions for {target_month} excluding transfers and repayments."
    )

    return {"period": target_month, "items": items, "evidence_id": ev_id}

def tool_get_recurring_payments() -> Dict[str, Any]:
    txns = _load_all_transactions()
    recurring = RecurringDetector.detect_recurring(txns)
    total_monthly_est = sum(
        r["amount"] * (4 if r["frequency"] == "weekly" else (1 if r["frequency"] == "monthly" else 0.33))
        for r in recurring
    )
    return {
        "count": len(recurring),
        "total_estimated_monthly": round(total_monthly_est, 2),
        "recurring_payments": recurring
    }

def tool_get_subscriptions() -> Dict[str, Any]:
    txns = _load_all_transactions()
    rec = RecurringDetector.detect_recurring(txns)
    subs = SubscriptionIntelligence.analyze_subscriptions(txns, rec)
    total_annual = sum(s["annualized_cost"] for s in subs)
    return {
        "count": len(subs),
        "total_annualized_cost": round(total_annual, 2),
        "subscriptions": subs
    }

def tool_get_budget_status() -> Dict[str, Any]:
    txns = _load_all_transactions()
    summary = MonthlySummaryEngine.calculate_summary(txns)
    return {
        "period": summary.get("period"),
        "budget_performance": summary.get("budget_performance", [])
    }

def tool_get_goal_status() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM goals")
    goals = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    results = []
    for g in goals:
        tl = GoalShiftEngine.calculate_goal_timeline(g["target_amount"], g["current_saved_amount"], g["monthly_contribution"])
        results.append({
            "id": g["id"],
            "name": g["name"],
            "target_amount": g["target_amount"],
            "current_saved_amount": g["current_saved_amount"],
            "monthly_contribution": g["monthly_contribution"],
            "remaining_amount": tl["remaining_amount"],
            "estimated_months": tl["estimated_months"],
            "estimated_completion_date": tl["estimated_completion_date"]
        })
    return {"goals": results}

def tool_get_commit_stack() -> Dict[str, Any]:
    txns = _load_all_transactions()
    return CommitStackEngine.calculate(txns)

def tool_get_cash_radar() -> Dict[str, Any]:
    txns = _load_all_transactions()
    rec = RecurringDetector.detect_recurring(txns)
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM obligations WHERE status = 'pending'")
    obligations = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return CashRadarEngine.project_30_days(txns, rec, obligations)

def tool_analyze_spending_change(category: str = "Food") -> Dict[str, Any]:
    txns = _load_all_transactions()
    return WhyLensEngine.analyze_category_change(txns, category)

def tool_detect_anomalies() -> Dict[str, Any]:
    txns = _load_all_transactions()
    anomalies = AnomalyDetector.detect_anomalies(txns)
    return {"anomalies_count": len(anomalies), "anomalies": anomalies}

def tool_get_upcoming_obligations() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM obligations ORDER BY due_date ASC")
    obligations = [dict(r) for r in cursor.fetchall()]
    conn.close()
    total_due = sum(o["amount"] for o in obligations if o.get("status") == "pending")
    return {"count": len(obligations), "total_pending_amount": round(total_due, 2), "obligations": obligations}

def tool_run_goal_scenario(scenario_text: str, goal_id: Optional[str] = None) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    if goal_id:
        cursor.execute("SELECT * FROM goals WHERE id = ?", (goal_id,))
        goal = cursor.fetchone()
    else:
        cursor.execute("SELECT * FROM goals ORDER BY target_amount DESC LIMIT 1")
        goal = cursor.fetchone()
    conn.close()

    if not goal:
        # Create a default goal for simulation if none exists
        default_goal = {
            "id": "g_default",
            "name": "Emergency Fund & Gadget Goal",
            "target_amount": 100000.0,
            "current_saved_amount": 35000.0,
            "monthly_contribution": 5000.0
        }
        return GoalShiftEngine.simulate_scenario(default_goal, scenario_text)

    return GoalShiftEngine.simulate_scenario(dict(goal), scenario_text)

def tool_get_transaction_evidence(evidence_id: str) -> Dict[str, Any]:
    ev = ProofTrailRegistry.get_evidence(evidence_id)
    if not ev:
        return {"error": "Evidence link not found"}
    return ev
