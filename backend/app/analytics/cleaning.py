import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple

class CleaningPipeline:
    """
    Cleans raw imported transactions:
    - Removes exact duplicates
    - Detects probable duplicates
    - Detects and flags own-account transfers (excludes from expenses)
    - Detects and flags credit card payments (prevents double-counting)
    - Generates human-readable audit log
    """

    TRANSFER_KEYWORDS = [
        "self transfer", "transfer to own", "own account", "savings transfer",
        "fund transfer to", "transfer to savings", "sweep in", "sweep out", "internal transfer"
    ]

    CC_PAYMENT_KEYWORDS = [
        "credit card payment", "credit card bill", "cc payment", "autodebit hdfc card",
        "card bill payment", "hdfc credit card", "sbi card", "icici credit card", "amex payment"
    ]

    @classmethod
    def clean_transactions(cls, raw_transactions: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        if not raw_transactions:
            return [], {
                "total_imported": 0,
                "exact_duplicates_removed": 0,
                "probable_duplicates_flagged": 0,
                "transfers_excluded": 0,
                "cc_payments_excluded": 0,
                "clean_count": 0,
                "log_message": "0 transactions imported."
            }

        df = pd.DataFrame(raw_transactions)

        # 1. Normalize dates and sort
        df["date"] = pd.to_datetime(df["date"], errors="coerce").dt.strftime("%Y-%m-%d")
        df["date"] = df["date"].fillna(datetime.now().strftime("%Y-%m-%d"))
        df = df.sort_values(by=["date"]).reset_index(drop=True)

        # 2. Normalize amounts and types
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0.0).abs().round(2)
        df["type"] = df["type"].astype(str).str.lower().apply(lambda t: "credit" if "credit" in t else "debit")
        
        # 3. Clean merchant strings
        df["merchant"] = df["merchant"].fillna("Unknown Merchant").astype(str).str.strip()
        df["description"] = df["description"].fillna("").astype(str).str.strip()

        total_imported = len(df)

        # 4. Remove exact duplicates (same date, merchant, amount, type, description)
        exact_subset = ["date", "merchant", "amount", "type", "description"]
        before_exact = len(df)
        df_exact_dups = df[df.duplicated(subset=exact_subset, keep="first")]
        df = df.drop_duplicates(subset=exact_subset, keep="first").reset_index(drop=True)
        exact_dups_count = before_exact - len(df)

        # 5. Detect probable duplicates (same merchant, same amount, within 2 days)
        df["is_duplicate"] = False
        probable_dups_count = 0
        
        # Compare consecutive rows by merchant & amount
        for i in range(1, len(df)):
            prev = df.iloc[i - 1]
            curr = df.iloc[i]
            if curr["merchant"].lower() == prev["merchant"].lower() and curr["amount"] == prev["amount"] and curr["type"] == prev["type"]:
                try:
                    d1 = datetime.strptime(curr["date"], "%Y-%m-%d")
                    d0 = datetime.strptime(prev["date"], "%Y-%m-%d")
                    if abs((d1 - d0).days) <= 1:
                        df.at[i, "is_duplicate"] = True
                        probable_dups_count += 1
                except Exception:
                    pass

        # 6. Detect own-account transfers
        df["is_transfer"] = False
        for i, row in df.iterrows():
            text = f"{row['merchant']} {row['description']}".lower()
            if any(k in text for k in cls.TRANSFER_KEYWORDS):
                df.at[i, "is_transfer"] = True

        # 7. Detect credit-card payment transactions
        df["is_cc_payment"] = False
        for i, row in df.iterrows():
            text = f"{row['merchant']} {row['description']}".lower()
            if any(k in text for k in cls.CC_PAYMENT_KEYWORDS):
                df.at[i, "is_cc_payment"] = True

        # 8. Prevent double counting (exclude transfers & cc payments from expense totals)
        df["is_excluded"] = df["is_transfer"] | df["is_cc_payment"]

        transfers_count = int(df["is_transfer"].sum())
        cc_payments_count = int(df["is_cc_payment"].sum())
        clean_count = len(df)

        log_message = (
            f"{total_imported} transactions imported. "
            f"{exact_dups_count} exact duplicates removed. "
            f"{probable_dups_count} probable duplicate charges flagged. "
            f"{transfers_count} internal transfers excluded. "
            f"{cc_payments_count} credit-card payments excluded from expense totals to prevent double-counting."
        )

        cleaned_records = df.to_dict(orient="records")

        stats = {
            "total_imported": total_imported,
            "exact_duplicates_removed": exact_dups_count,
            "probable_duplicates_flagged": probable_dups_count,
            "transfers_excluded": transfers_count,
            "cc_payments_excluded": cc_payments_count,
            "clean_count": clean_count,
            "log_message": log_message
        }

        return cleaned_records, stats
