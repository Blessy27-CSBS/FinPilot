import sqlite3
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.getenv("DATABASE_PATH", "finpilot.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        created_at TEXT
    );
    """)

    # 2. transactions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT DEFAULT 'default_user',
        date TEXT NOT NULL,
        merchant TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        type TEXT NOT NULL, -- 'debit' or 'credit'
        category TEXT NOT NULL,
        account TEXT,
        balance REAL,
        source_document_id TEXT,
        is_recurring INTEGER DEFAULT 0,
        is_transfer INTEGER DEFAULT 0,
        is_cc_payment INTEGER DEFAULT 0,
        is_duplicate INTEGER DEFAULT 0,
        is_excluded INTEGER DEFAULT 0,
        confidence REAL DEFAULT 1.0,
        categorization_method TEXT DEFAULT 'rule',
        needs_review INTEGER DEFAULT 0,
        created_at TEXT
    );
    """)

    # 3. categories
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        icon TEXT,
        color TEXT,
        monthly_budget REAL DEFAULT 0
    );
    """)

    # 4. merchant_rules (Learning Loop & rules)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS merchant_rules (
        merchant_pattern TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        confidence REAL DEFAULT 1.0,
        source TEXT DEFAULT 'system' -- 'system' or 'user_correction'
    );
    """)

    # 5. recurring_payments
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recurring_payments (
        id TEXT PRIMARY KEY,
        merchant TEXT NOT NULL,
        amount REAL NOT NULL,
        frequency TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly', 'yearly'
        category TEXT,
        last_payment TEXT,
        next_expected_payment TEXT,
        confidence REAL DEFAULT 0.9,
        is_active INTEGER DEFAULT 1
    );
    """)

    # 6. subscriptions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        service TEXT NOT NULL,
        current_price REAL NOT NULL,
        previous_price REAL,
        frequency TEXT DEFAULT 'monthly',
        annualized_cost REAL NOT NULL,
        next_renewal TEXT,
        price_creep REAL DEFAULT 0,
        category TEXT DEFAULT 'Subscription',
        potential_overlap TEXT
    );
    """)

    # 7. obligations (extracted from bills / upcoming obligations)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS obligations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        due_date TEXT NOT NULL,
        recurring INTEGER DEFAULT 1,
        source_document_id TEXT,
        status TEXT DEFAULT 'pending' -- 'pending', 'paid', 'dismissed'
    );
    """)

    # 8. budgets
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        category TEXT UNIQUE NOT NULL,
        amount REAL NOT NULL,
        period TEXT DEFAULT 'monthly'
    );
    """)

    # 9. goals
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_saved_amount REAL NOT NULL,
        deadline TEXT,
        monthly_contribution REAL NOT NULL,
        created_at TEXT
    );
    """)

    # 10. goal_scenarios
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS goal_scenarios (
        id TEXT PRIMARY KEY,
        goal_id TEXT,
        scenario_description TEXT,
        modified_monthly_contribution REAL,
        before_months REAL,
        after_months REAL,
        created_at TEXT
    );
    """)

    # 11. analysis_results
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analysis_results (
        id TEXT PRIMARY KEY,
        analysis_type TEXT NOT NULL,
        period TEXT,
        payload_json TEXT NOT NULL,
        created_at TEXT
    );
    """)

    # 12. evidence_links
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evidence_links (
        id TEXT PRIMARY KEY,
        insight_key TEXT NOT NULL,
        formula TEXT,
        transaction_ids_json TEXT,
        supporting_data_json TEXT,
        explanation TEXT,
        created_at TEXT
    );
    """)

    # 13. documents (uploaded statements/bills)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        parsed_transactions_count INTEGER DEFAULT 0,
        cleaned_transactions_count INTEGER DEFAULT 0,
        uploaded_at TEXT
    );
    """)

    # 14. user_corrections
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_corrections (
        id TEXT PRIMARY KEY,
        merchant TEXT NOT NULL,
        old_category TEXT,
        new_category TEXT NOT NULL,
        corrected_at TEXT
    );
    """)

    # Pre-populate default merchant rules
    default_rules = [
        ("swiggy", "Food", 0.98, "system"),
        ("zomato", "Food", 0.98, "system"),
        ("truffles", "Food", 0.95, "system"),
        ("chai point", "Food", 0.95, "system"),
        ("tea stall", "Food", 0.90, "system"),
        ("starbucks", "Food", 0.95, "system"),
        ("mcdonalds", "Food", 0.95, "system"),
        ("burger king", "Food", 0.95, "system"),
        ("nature's basket", "Groceries", 0.98, "system"),
        ("blinkit", "Groceries", 0.98, "system"),
        ("instamart", "Groceries", 0.98, "system"),
        ("zepto", "Groceries", 0.98, "system"),
        ("bigbasket", "Groceries", 0.98, "system"),
        ("uber", "Transportation", 0.98, "system"),
        ("ola", "Transportation", 0.98, "system"),
        ("petrol", "Transportation", 0.95, "system"),
        ("hp petrol", "Transportation", 0.98, "system"),
        ("indian oil", "Transportation", 0.98, "system"),
        ("metro", "Transportation", 0.90, "system"),
        ("netflix", "Subscription", 0.99, "system"),
        ("spotify", "Subscription", 0.99, "system"),
        ("amazon prime", "Subscription", 0.99, "system"),
        ("google one", "Subscription", 0.99, "system"),
        ("hotstar", "Subscription", 0.99, "system"),
        ("youtube premium", "Subscription", 0.99, "system"),
        ("apple.com/bill", "Subscription", 0.95, "system"),
        ("bescom", "Utilities", 0.99, "system"),
        ("bwssb", "Utilities", 0.99, "system"),
        ("airtel", "Utilities", 0.98, "system"),
        ("jio", "Utilities", 0.98, "system"),
        ("electricity", "Utilities", 0.95, "system"),
        ("water", "Utilities", 0.90, "system"),
        ("prestige properties", "Rent", 0.99, "system"),
        ("rent", "Rent", 0.95, "system"),
        ("landlord", "Rent", 0.95, "system"),
        ("amazon", "Shopping", 0.90, "system"),
        ("flipkart", "Shopping", 0.95, "system"),
        ("myntra", "Shopping", 0.98, "system"),
        ("croma", "Shopping", 0.95, "system"),
        ("zara", "Shopping", 0.95, "system"),
        ("hdfc ergo", "Insurance", 0.98, "system"),
        ("lic", "Insurance", 0.98, "system"),
        ("star health", "Insurance", 0.98, "system"),
        ("apollo pharmacy", "Healthcare", 0.98, "system"),
        ("medplus", "Healthcare", 0.98, "system"),
        ("1mg", "Healthcare", 0.98, "system"),
        ("tech corp", "Income", 0.99, "system"),
        ("salary", "Income", 0.98, "system"),
        ("interest credit", "Income", 0.95, "system"),
        ("hdfc credit card", "Credit Card Payment", 0.99, "system"),
        ("credit card payment", "Credit Card Payment", 0.99, "system"),
        ("self transfer", "Transfer", 0.99, "system"),
        ("own savings", "Transfer", 0.99, "system"),
    ]

    for pattern, cat, conf, src in default_rules:
        cursor.execute("""
        INSERT OR IGNORE INTO merchant_rules (merchant_pattern, category, confidence, source)
        VALUES (?, ?, ?, ?);
        """, (pattern, cat, conf, src))

    # Default budgets
    default_budgets = [
        ("Food", 12000),
        ("Groceries", 15000),
        ("Transportation", 6000),
        ("Shopping", 8000),
        ("Utilities", 6000),
        ("Subscription", 2000),
        ("Healthcare", 3000),
    ]
    for cat, amt in default_budgets:
        cursor.execute("""
        INSERT OR IGNORE INTO budgets (id, category, amount, period)
        VALUES (?, ?, ?, 'monthly');
        """, (f"b_{cat.lower()}", cat, amt))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
