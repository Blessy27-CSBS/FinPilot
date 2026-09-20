from typing import List, Dict, Any, Tuple, Optional
from rapidfuzz import process, fuzz
from backend.app.database import get_connection

class CategorizationEngine:
    """
    Multi-stage categorization system:
    Stage 1: Merchant rules (exact / substring)
    Stage 2: Fuzzy matching with RapidFuzz
    Stage 3: Rule/Keyword fallback
    Low confidence (<0.75) transactions are routed to the Review Queue.
    """

    CONFIDENCE_THRESHOLD = 0.75

    @classmethod
    def get_merchant_rules(cls) -> Dict[str, Tuple[str, float]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT merchant_pattern, category, confidence FROM merchant_rules")
        rows = cursor.fetchall()
        conn.close()
        return {r["merchant_pattern"].lower(): (r["category"], float(r["confidence"])) for r in rows}

    @classmethod
    def categorize_transaction(cls, merchant: str, description: str, rules_cache: Optional[Dict[str, Tuple[str, float]]] = None) -> Dict[str, Any]:
        if rules_cache is None:
            rules_cache = cls.get_merchant_rules()

        m_clean = merchant.strip().lower()
        d_clean = description.strip().lower()
        full_text = f"{m_clean} {d_clean}"

        # Stage 1: Exact or Substring rule matching
        # Check user-corrected or specific patterns first
        for pattern, (cat, conf) in rules_cache.items():
            if pattern in m_clean or pattern in d_clean:
                return {
                    "category": cat,
                    "confidence": conf,
                    "method": "merchant_rule",
                    "needs_review": conf < cls.CONFIDENCE_THRESHOLD
                }

        # Stage 2: RapidFuzz matching across merchant patterns
        patterns = list(rules_cache.keys())
        if patterns:
            best_match = process.extractOne(m_clean, patterns, scorer=fuzz.partial_ratio)
            if best_match and best_match[1] >= 80:
                pattern = best_match[0]
                cat, base_conf = rules_cache[pattern]
                fuzzy_conf = round(float(best_match[1]) / 100.0 * base_conf, 2)
                return {
                    "category": cat,
                    "confidence": fuzzy_conf,
                    "method": "fuzzy_match",
                    "needs_review": fuzzy_conf < cls.CONFIDENCE_THRESHOLD
                }

        # Stage 3: General Keyword heuristics
        if any(w in full_text for w in ["supermarket", "grocer", "vegetable", "milk", "kirana", "mart", "provisions"]):
            return {"category": "Groceries", "confidence": 0.80, "method": "keyword_heuristic", "needs_review": False}
        if any(w in full_text for w in ["cafe", "restaurant", "food", "dine", "kitchen", "bakery", "pizza", "coffee"]):
            return {"category": "Food", "confidence": 0.80, "method": "keyword_heuristic", "needs_review": False}
        if any(w in full_text for w in ["cab", "auto", "toll", "metro", "fuel", "petrol", "diesel", "parking"]):
            return {"category": "Transportation", "confidence": 0.80, "method": "keyword_heuristic", "needs_review": False}
        if any(w in full_text for w in ["doctor", "clinic", "hospital", "pharma", "lab", "dental"]):
            return {"category": "Healthcare", "confidence": 0.85, "method": "keyword_heuristic", "needs_review": False}
        if any(w in full_text for w in ["movie", "cinema", "theatre", "game", "entertainment"]):
            return {"category": "Entertainment", "confidence": 0.80, "method": "keyword_heuristic", "needs_review": False}

        # Low confidence fallback -> Review Queue
        return {
            "category": "Miscellaneous",
            "confidence": 0.45,
            "method": "low_confidence_fallback",
            "needs_review": True
        }

    @classmethod
    def categorize_batch(cls, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        rules = cls.get_merchant_rules()
        for txn in transactions:
            # If already categorized with a non-default category and not Uncategorized
            if txn.get("category") and txn.get("category") not in ["Uncategorized", ""]:
                # Still check if merchant rule overrides (e.g. user corrections)
                m_clean = txn.get("merchant", "").lower()
                if m_clean in rules:
                    cat, conf = rules[m_clean]
                    txn["category"] = cat
                    txn["confidence"] = conf
                    txn["categorization_method"] = "merchant_rule"
                    txn["needs_review"] = False
                continue

            res = cls.categorize_transaction(txn.get("merchant", ""), txn.get("description", ""), rules)
            txn["category"] = res["category"]
            txn["confidence"] = res["confidence"]
            txn["categorization_method"] = res["method"]
            txn["needs_review"] = res["needs_review"]

        return transactions

    @classmethod
    def record_user_correction(cls, merchant: str, new_category: str, old_category: Optional[str] = None):
        """
        Learning loop: remember user's category correction for future transactions.
        """
        conn = get_connection()
        cursor = conn.cursor()
        m_pattern = merchant.strip().lower()
        
        # 1. Update/insert rule with 1.0 confidence
        cursor.execute("""
        INSERT INTO merchant_rules (merchant_pattern, category, confidence, source)
        VALUES (?, ?, 1.0, 'user_correction')
        ON CONFLICT(merchant_pattern) DO UPDATE SET
            category = excluded.category,
            confidence = 1.0,
            source = 'user_correction';
        """, (m_pattern, new_category))

        # 2. Record audit correction
        import uuid
        from datetime import datetime
        cursor.execute("""
        INSERT INTO user_corrections (id, merchant, old_category, new_category, corrected_at)
        VALUES (?, ?, ?, ?, ?);
        """, (f"corr_{uuid.uuid4().hex[:8]}", merchant, old_category or "Uncategorized", new_category, datetime.now().isoformat()))

        # 3. Update existing transactions with this merchant
        cursor.execute("""
        UPDATE transactions
        SET category = ?, confidence = 1.0, categorization_method = 'user_correction', needs_review = 0
        WHERE LOWER(merchant) = ? OR LOWER(merchant) LIKE ?;
        """, (new_category, m_pattern, f"%{m_pattern}%"))

        conn.commit()
        conn.close()
