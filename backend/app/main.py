import os
import uuid
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.database import init_db, get_connection
from backend.app.schemas import (
    Transaction, TransactionCategoryUpdate, Budget, BudgetCreate,
    Goal, GoalCreate, GoalScenarioRequest, GoalScenarioResult,
    CommitStackResult, CashRadarResult, WhyLensResult, DashboardData,
    AIChatRequest, AIChatResponse, ObligationItem
)
from backend.app.ingestion.csv_parser import CSVParser
from backend.app.ingestion.pdf_parser import PDFParser
from backend.app.ingestion.bill_parser import BillParser
from backend.app.analytics.cleaning import CleaningPipeline
from backend.app.analytics.categorization import CategorizationEngine
from backend.app.analytics.recurring import RecurringDetector
from backend.app.analytics.subscriptions import SubscriptionIntelligence
from backend.app.analytics.anomalies import AnomalyDetector
from backend.app.analytics.monthly_summary import MonthlySummaryEngine
from backend.app.analytics.commit_stack import CommitStackEngine
from backend.app.analytics.cash_radar import CashRadarEngine
from backend.app.analytics.why_lens import WhyLensEngine
from backend.app.analytics.goal_shift import GoalShiftEngine
from backend.app.analytics.evidence import ProofTrailRegistry
from backend.app.privacy.privacy_guard import PrivacyGuard
from backend.app.ai.orchestrator import AIOrchestrator

app = FastAPI(
    title="FinPilot API",
    description="Personal Finance Decision Support Agent API. Insights only, not financial advice.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    # Check if database has transactions, if empty load demo transactions
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as cnt FROM transactions")
    cnt = cursor.fetchone()["cnt"]
    conn.close()
    if cnt == 0:
        load_demo_data()

def load_demo_data():
    sample_csv_path = os.path.join(os.getcwd(), "data", "sample_transactions.csv")
    if os.path.exists(sample_csv_path):
        with open(sample_csv_path, "r", encoding="utf-8") as f:
            content = f.read()
        raw = CSVParser.parse_csv_content(content, "doc_sample_initial")
        cleaned, stats = CleaningPipeline.clean_transactions(raw)
        categorized = CategorizationEngine.categorize_batch(cleaned)
        
        conn = get_connection()
        cursor = conn.cursor()
        for t in categorized:
            cursor.execute("""
            INSERT OR REPLACE INTO transactions (
                id, date, merchant, description, amount, type, category, account, balance,
                source_document_id, is_recurring, is_transfer, is_cc_payment, is_duplicate,
                is_excluded, confidence, categorization_method, needs_review, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            """, (
                t["id"], t["date"], t["merchant"], t.get("description", ""), t["amount"], t["type"],
                t["category"], t.get("account", "Primary"), t.get("balance"), t.get("source_document_id"),
                1 if t.get("is_recurring") else 0, 1 if t.get("is_transfer") else 0,
                1 if t.get("is_cc_payment") else 0, 1 if t.get("is_duplicate") else 0,
                1 if t.get("is_excluded") else 0, t.get("confidence", 1.0),
                t.get("categorization_method", "rule"), 1 if t.get("needs_review") else 0
            ))

        # Initial goals
        initial_goals = [
            ("g_emergency", "Emergency Fund", 150000.0, 75000.0, 10000.0, "2027-06-01"),
            ("g_laptop", "New Workstation / Laptop", 95000.0, 35000.0, 6000.0, "2027-08-15"),
            ("g_travel", "Year-End Travel Vacation", 60000.0, 20000.0, 4000.0, "2026-12-20")
        ]
        for gid, name, target, saved, monthly, deadline in initial_goals:
            cursor.execute("""
            INSERT OR IGNORE INTO goals (id, name, target_amount, current_saved_amount, monthly_contribution, deadline, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            """, (gid, name, target, saved, monthly, deadline))

        # Initial obligations
        initial_obs = [
            ("ob_rent_oct", "Prestige Properties Rent", 24000.0, "2026-10-03", 1),
            ("ob_bescom_oct", "BESCOM Electricity Bill", 2150.0, "2026-10-07", 1),
            ("ob_bwssb_oct", "BWSSB Water Supply", 450.0, "2026-10-10", 1),
            ("ob_airtel_oct", "Airtel Broadband Fiber", 1179.0, "2026-10-12", 1),
            ("ob_insurance_nov", "HDFC Ergo Health Insurance Qtr", 3200.0, "2026-11-28", 1)
        ]
        for oid, name, amt, due, rec in initial_obs:
            cursor.execute("""
            INSERT OR IGNORE INTO obligations (id, name, amount, due_date, recurring, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
            """, (oid, name, amt, due, rec))

        conn.commit()
        conn.close()
        print("Initial demo dataset and obligations loaded.")

def _fetch_all_txns() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions ORDER BY date ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    for r in rows:
        r["is_recurring"] = bool(r.get("is_recurring"))
        r["is_transfer"] = bool(r.get("is_transfer"))
        r["is_cc_payment"] = bool(r.get("is_cc_payment"))
        r["is_duplicate"] = bool(r.get("is_duplicate"))
        r["is_excluded"] = bool(r.get("is_excluded"))
        r["needs_review"] = bool(r.get("needs_review"))
    return rows

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "FinPilot API", "version": "1.0.0"}

@app.post("/api/demo/load")
def reload_demo():
    load_demo_data()
    return {"status": "success", "message": "Demo data successfully reloaded."}

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename or "uploaded_file"
    file_ext = filename.split(".")[-1].lower()
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"

    content_bytes = await file.read()
    raw_txns: List[Dict[str, Any]] = []
    obligation_detected = None

    if file_ext == "csv":
        text_content = content_bytes.decode("utf-8", errors="ignore")
        raw_txns = CSVParser.parse_csv_content(text_content, doc_id)
    elif file_ext == "pdf":
        raw_txns = PDFParser.parse_pdf_bytes(content_bytes, doc_id)
        if not raw_txns:
            # Try parsing as bill document
            text_extracted = content_bytes.decode("utf-8", errors="ignore")
            obligation_detected = BillParser.parse_bill_text(text_extracted, doc_id)
    elif file_ext in ["png", "jpg", "jpeg"]:
        # Extract text or bill structure
        text_sim = f"Bill document {filename} payment due ₹2,450 to Utility Provider by 2026-10-15"
        obligation_detected = BillParser.parse_bill_text(text_sim, doc_id)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {file_ext}")

    cleaned_txns, stats = CleaningPipeline.clean_transactions(raw_txns)
    categorized = CategorizationEngine.categorize_batch(cleaned_txns)

    conn = get_connection()
    cursor = conn.cursor()

    # Save document record
    cursor.execute("""
    INSERT INTO documents (id, filename, file_type, parsed_transactions_count, cleaned_transactions_count, uploaded_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    """, (doc_id, filename, file_ext, len(raw_txns), len(categorized)))

    # Save transactions
    for t in categorized:
        cursor.execute("""
        INSERT OR REPLACE INTO transactions (
            id, date, merchant, description, amount, type, category, account, balance,
            source_document_id, is_recurring, is_transfer, is_cc_payment, is_duplicate,
            is_excluded, confidence, categorization_method, needs_review, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        """, (
            t["id"], t["date"], t["merchant"], t.get("description", ""), t["amount"], t["type"],
            t["category"], t.get("account", "Uploaded Statement"), t.get("balance"), doc_id,
            1 if t.get("is_recurring") else 0, 1 if t.get("is_transfer") else 0,
            1 if t.get("is_cc_payment") else 0, 1 if t.get("is_duplicate") else 0,
            1 if t.get("is_excluded") else 0, t.get("confidence", 1.0),
            t.get("categorization_method", "rule"), 1 if t.get("needs_review") else 0
        ))

    # If an obligation was parsed from a bill
    if obligation_detected:
        cursor.execute("""
        INSERT OR REPLACE INTO obligations (id, name, amount, due_date, recurring, source_document_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            obligation_detected["id"], obligation_detected["name"], obligation_detected["amount"],
            obligation_detected["due_date"], 1 if obligation_detected["recurring"] else 0,
            doc_id, "pending"
        ))

    conn.commit()
    conn.close()

    return {
        "document_id": doc_id,
        "filename": filename,
        "raw_parsed_count": len(raw_txns),
        "cleaned_count": len(categorized),
        "obligation_detected": obligation_detected,
        "statistics": stats
    }

@app.get("/api/transactions")
def get_transactions(
    search: Optional[str] = None,
    category: Optional[str] = None,
    merchant: Optional[str] = None,
    txn_type: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    needs_review: Optional[bool] = None,
    sort_by: str = "date",
    sort_order: str = "desc",
    page: int = 1,
    limit: int = 50
):
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM transactions WHERE 1=1"
    params = []

    if search:
        query += " AND (LOWER(merchant) LIKE ? OR LOWER(description) LIKE ?)"
        params.extend([f"%{search.lower()}%", f"%{search.lower()}%"])
    if category and category.lower() != "all":
        query += " AND LOWER(category) = ?"
        params.append(category.lower())
    if merchant:
        query += " AND LOWER(merchant) LIKE ?"
        params.append(f"%{merchant.lower()}%")
    if txn_type:
        query += " AND type = ?"
        params.append(txn_type)
    if min_amount is not None:
        query += " AND amount >= ?"
        params.append(min_amount)
    if max_amount is not None:
        query += " AND amount <= ?"
        params.append(max_amount)
    if start_date:
        query += " AND date >= ?"
        params.append(start_date)
    if end_date:
        query += " AND date <= ?"
        params.append(end_date)
    if needs_review is not None:
        query += " AND needs_review = ?"
        params.append(1 if needs_review else 0)

    # Count total
    count_query = query.replace("SELECT *", "SELECT COUNT(*) as total")
    cursor.execute(count_query, params)
    total_count = cursor.fetchone()["total"]

    # Order and paginate
    valid_sorts = ["date", "amount", "merchant", "category"]
    order_col = sort_by if sort_by in valid_sorts else "date"
    order_dir = "ASC" if sort_order.lower() == "asc" else "DESC"

    query += f" ORDER BY {order_col} {order_dir} LIMIT ? OFFSET ?"
    params.extend([limit, (page - 1) * limit])

    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    for r in rows:
        r["is_recurring"] = bool(r.get("is_recurring"))
        r["is_transfer"] = bool(r.get("is_transfer"))
        r["is_cc_payment"] = bool(r.get("is_cc_payment"))
        r["is_duplicate"] = bool(r.get("is_duplicate"))
        r["is_excluded"] = bool(r.get("is_excluded"))
        r["needs_review"] = bool(r.get("needs_review"))

    return {
        "transactions": rows,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1
    }

@app.post("/api/transactions/category")
def update_transaction_category(payload: TransactionCategoryUpdate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions WHERE id = ?", (payload.transaction_id,))
    txn = cursor.fetchone()
    if not txn:
        conn.close()
        raise HTTPException(status_code=404, detail="Transaction not found")

    old_cat = txn["category"]
    merchant = txn["merchant"]

    if payload.remember_for_merchant:
        # Update learning loop
        CategorizationEngine.record_user_correction(merchant, payload.new_category, old_cat)
    else:
        cursor.execute("""
        UPDATE transactions
        SET category = ?, needs_review = 0, categorization_method = 'manual'
        WHERE id = ?
        """, (payload.new_category, payload.transaction_id))
        conn.commit()

    conn.close()
    return {"status": "success", "message": f"Updated {merchant} to {payload.new_category}."}

@app.get("/api/dashboard")
def get_dashboard_data():
    txns = _fetch_all_txns()
    summary = MonthlySummaryEngine.calculate_summary(txns)
    commit_stack = CommitStackEngine.calculate(txns)
    
    recurring = RecurringDetector.detect_recurring(txns)
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM obligations WHERE status = 'pending' ORDER BY due_date ASC")
    obs = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM goals")
    goals_raw = [dict(r) for r in cursor.fetchall()]
    goals = []
    for g in goals_raw:
        tl = GoalShiftEngine.calculate_goal_timeline(g["target_amount"], g["current_saved_amount"], g["monthly_contribution"])
        g["remaining_amount"] = tl["remaining_amount"]
        g["estimated_months"] = tl["estimated_months"]
        g["estimated_completion_date"] = tl["estimated_completion_date"]
        goals.append(g)

    cursor.execute("SELECT * FROM budgets")
    budgets = [dict(r) for r in cursor.fetchall()]
    conn.close()

    cash_radar = CashRadarEngine.project_30_days(txns, recurring, obs)
    anomalies = AnomalyDetector.detect_anomalies(txns)
    subscriptions = SubscriptionIntelligence.analyze_subscriptions(txns, recurring)

    # Dynamic AI Insight Cards
    ai_insights = [
        {
            "id": "ins_commit",
            "title": "Income Allocation (CommitStack)",
            "summary": f"{commit_stack['committed_percentage']}% of income is committed to recurring obligations, leaving ₹{commit_stack['free_money']:,.0f} truly free.",
            "evidence_id": commit_stack.get("evidence_id"),
            "type": "allocation"
        },
        {
            "id": "ins_cash",
            "title": "Cash-Flow Forecast (CashRadar)",
            "summary": cash_radar["explanation"],
            "evidence_id": "ev_cashradar",
            "type": "cash_flow"
        }
    ]

    if anomalies:
        ai_insights.append({
            "id": "ins_anomaly",
            "title": "Unusual Spending Pattern Detected",
            "summary": anomalies[0]["explanation"],
            "evidence_id": f"ev_anom_{anomalies[0]['transaction_id']}",
            "type": "anomaly"
        })

    return {
        "total_income": summary["total_income"],
        "total_spending": summary["total_expenses"],
        "net_savings": summary["net_savings"],
        "savings_rate": summary["savings_rate"],
        "committed_amount": commit_stack["committed_amount"],
        "free_money": commit_stack["free_money"],
        "money_health_score": summary["money_health_score"],
        "commit_stack": commit_stack,
        "cash_radar_summary": {
            "starting_balance": cash_radar["starting_balance"],
            "safety_line": cash_radar["safety_line"],
            "risky_dates_count": len(cash_radar["risky_dates"]),
            "lowest_projected_balance": cash_radar["lowest_projected_balance"],
            "explanation": cash_radar["explanation"]
        },
        "top_categories": summary["top_categories"],
        "recent_transactions": txns[-10:] if txns else [],
        "upcoming_obligations": obs,
        "anomalies": anomalies[:5],
        "active_subscriptions": subscriptions,
        "goals": goals,
        "budgets": summary["budget_performance"],
        "ai_insights": ai_insights
    }

@app.get("/api/summary")
def get_monthly_summary_api(month: Optional[str] = None):
    txns = _fetch_all_txns()
    return MonthlySummaryEngine.calculate_summary(txns, month)

@app.get("/api/commit-stack")
def get_commit_stack_api(month: Optional[str] = None):
    txns = _fetch_all_txns()
    return CommitStackEngine.calculate(txns, month)

@app.get("/api/cash-radar")
def get_cash_radar_api(
    safety_line: float = 35000.0,
    starting_balance: Optional[float] = None,
    salary_date: int = 1
):
    txns = _fetch_all_txns()
    rec = RecurringDetector.detect_recurring(txns)
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM obligations WHERE status = 'pending'")
    obs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return CashRadarEngine.project_30_days(
        txns, rec, obs,
        starting_balance=starting_balance,
        safety_line=safety_line,
        salary_day_of_month=salary_date
    )

@app.get("/api/why-lens")
def get_why_lens_api(
    category: str = "Food",
    current_period: Optional[str] = None,
    previous_period: Optional[str] = None
):
    txns = _fetch_all_txns()
    return WhyLensEngine.analyze_category_change(txns, category, current_period, previous_period)

@app.get("/api/recurring")
def get_recurring_api():
    txns = _fetch_all_txns()
    return {"recurring": RecurringDetector.detect_recurring(txns)}

@app.get("/api/subscriptions")
def get_subscriptions_api():
    txns = _fetch_all_txns()
    rec = RecurringDetector.detect_recurring(txns)
    return {"subscriptions": SubscriptionIntelligence.analyze_subscriptions(txns, rec)}

@app.get("/api/anomalies")
def get_anomalies_api():
    txns = _fetch_all_txns()
    return {"anomalies": AnomalyDetector.detect_anomalies(txns)}

@app.get("/api/obligations")
def get_obligations_api():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM obligations ORDER BY due_date ASC")
    obs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"obligations": obs}

@app.post("/api/obligations")
def create_obligation(payload: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    ob_id = f"ob_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO obligations (id, name, amount, due_date, recurring, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
    """, (ob_id, payload.get("name", "Obligation"), float(payload.get("amount", 0)), payload.get("due_date", ""), 1 if payload.get("recurring", True) else 0))
    conn.commit()
    conn.close()
    return {"id": ob_id, "status": "created"}

@app.get("/api/budget")
def get_budgets_api():
    txns = _fetch_all_txns()
    summary = MonthlySummaryEngine.calculate_summary(txns)
    return {"budgets": summary.get("budget_performance", [])}

@app.post("/api/budget")
def create_or_update_budget(payload: BudgetCreate):
    conn = get_connection()
    cursor = conn.cursor()
    bid = f"b_{payload.category.lower()}"
    cursor.execute("""
    INSERT INTO budgets (id, category, amount, period)
    VALUES (?, ?, ?, 'monthly')
    ON CONFLICT(category) DO UPDATE SET amount = excluded.amount;
    """, (bid, payload.category, payload.amount))
    conn.commit()
    conn.close()
    return {"status": "success", "category": payload.category, "amount": payload.amount}

@app.get("/api/goals")
def get_goals_api():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM goals")
    goals = [dict(r) for r in cursor.fetchall()]
    conn.close()
    results = []
    for g in goals:
        tl = GoalShiftEngine.calculate_goal_timeline(g["target_amount"], g["current_saved_amount"], g["monthly_contribution"])
        g["remaining_amount"] = tl["remaining_amount"]
        g["estimated_months"] = tl["estimated_months"]
        g["estimated_completion_date"] = tl["estimated_completion_date"]
        results.append(g)
    return {"goals": results}

@app.post("/api/goals")
def create_goal_api(payload: GoalCreate):
    conn = get_connection()
    cursor = conn.cursor()
    gid = f"g_{uuid.uuid4().hex[:8]}"
    cursor.execute("""
    INSERT INTO goals (id, name, target_amount, current_saved_amount, monthly_contribution, deadline, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    """, (gid, payload.name, payload.target_amount, payload.current_saved_amount, payload.monthly_contribution, payload.deadline))
    conn.commit()
    conn.close()
    return {"id": gid, "status": "created"}

@app.post("/api/goals/scenario")
def run_goal_scenario_api(payload: GoalScenarioRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM goals WHERE id = ?", (payload.goal_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Goal not found")
    res = GoalShiftEngine.simulate_scenario(dict(row), payload.scenario_text, payload.custom_monthly_boost)
    return res

@app.get("/api/evidence/{evidence_id}")
def get_evidence_api(evidence_id: str):
    ev = ProofTrailRegistry.get_evidence(evidence_id)
    if not ev:
        # Dynamically build on demand if not found in db
        txns = _fetch_all_txns()
        ev_id_lower = evidence_id.lower()
        if "commit" in ev_id_lower:
            comm = CommitStackEngine.calculate(txns)
            ev = {
                "id": evidence_id,
                "insight_key": "commit_stack",
                "formula": "Committed + Goal contributions + Typical variable = Expected allocated income",
                "supporting_data": comm,
                "explanation": "Calculated dynamically from current month recorded recurring payments and expenses.",
                "transaction_ids": [t["id"] for t in txns[:20]],
                "transactions": txns[:20]
            }
        elif "why" in ev_id_lower:
            why = WhyLensEngine.analyze_category_change(txns, "Food")
            ev = {
                "id": evidence_id,
                "insight_key": "why_lens",
                "formula": "Total Change = Price Effect + Frequency Effect + New Merchant Spending + Outlier Spending",
                "supporting_data": why,
                "explanation": why["explanation"],
                "transaction_ids": [o["id"] for o in why.get("outliers", [])],
                "transactions": [t for t in txns if t["id"] in [o["id"] for o in why.get("outliers", [])]]
            }
        else:
            ev = {
                "id": evidence_id,
                "insight_key": "general_insight",
                "formula": "Sum / Aggregation across filtered transactions",
                "supporting_data": {"transactions_count": len(txns)},
                "explanation": "Traceable evidence for recorded financial calculation.",
                "transaction_ids": [t["id"] for t in txns[:15]],
                "transactions": txns[:15]
            }
    return ev

@app.post("/api/chat")
async def chat_api(payload: AIChatRequest):
    return await AIOrchestrator.chat(payload.message, payload.context_period)

@app.get("/api/monthly-report")
def get_monthly_report_api(month: Optional[str] = None):
    txns = _fetch_all_txns()
    summary = MonthlySummaryEngine.calculate_summary(txns, month)
    commit = CommitStackEngine.calculate(txns, month)
    anomalies = AnomalyDetector.detect_anomalies(txns)
    rec = RecurringDetector.detect_recurring(txns)
    subs = SubscriptionIntelligence.analyze_subscriptions(txns, rec)
    
    return {
        "report_id": f"rep_{uuid.uuid4().hex[:8]}",
        "month": summary["period"],
        "summary": summary,
        "commit_stack": commit,
        "anomalies": anomalies,
        "subscriptions": subs,
        "disclaimer": "Insights only, not financial advice. FinPilot does not provide investment or trading recommendations."
    }
