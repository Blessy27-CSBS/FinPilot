import json
from typing import List, Dict, Any, Optional
from backend.app.database import get_connection

class ProofTrailRegistry:
    """
    Maintains verifiable evidence records linking every numeric insight
    to exact raw transaction IDs, mathematical formulas, and supporting data.
    """

    @classmethod
    def register_evidence(
        cls,
        evidence_id: str,
        insight_key: str,
        title: str,
        result_summary: str,
        formula: str,
        transaction_ids: List[str],
        supporting_data: Dict[str, Any],
        explanation: str
    ):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO evidence_links (id, insight_key, formula, transaction_ids_json, supporting_data_json, explanation, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
            formula = excluded.formula,
            transaction_ids_json = excluded.transaction_ids_json,
            supporting_data_json = excluded.supporting_data_json,
            explanation = excluded.explanation;
        """, (
            evidence_id,
            insight_key,
            formula,
            json.dumps(transaction_ids),
            json.dumps(supporting_data),
            explanation
        ))
        conn.commit()
        conn.close()

    @classmethod
    def get_evidence(cls, evidence_id: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM evidence_links WHERE id = ?", (evidence_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None

        txn_ids = json.loads(row["transaction_ids_json"] or "[]")
        supporting_data = json.loads(row["supporting_data_json"] or "{}")

        # Fetch matching transactions
        txns: List[Dict[str, Any]] = []
        if txn_ids:
            placeholders = ",".join("?" * len(txn_ids))
            cursor.execute(f"SELECT * FROM transactions WHERE id IN ({placeholders}) ORDER BY date DESC", txn_ids)
            for r in cursor.fetchall():
                txns.append(dict(r))

        conn.close()

        return {
            "id": row["id"],
            "insight_key": row["insight_key"],
            "formula": row["formula"],
            "supporting_data": supporting_data,
            "explanation": row["explanation"],
            "transaction_ids": txn_ids,
            "transactions": txns
        }
