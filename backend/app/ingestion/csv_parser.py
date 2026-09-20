import csv
import io
import re
import uuid
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional

class CSVParser:
    DATE_COLS = ["date", "transaction_date", "txn_date", "value_date", "post_date", "trans_date"]
    DESC_COLS = ["description", "narration", "particulars", "details", "remarks", "transaction_details", "memo"]
    MERCHANT_COLS = ["merchant", "payee", "beneficiary", "merchant_name", "party"]
    AMOUNT_COLS = ["amount", "transaction_amount", "value", "txn_amt", "net_amount"]
    DEBIT_COLS = ["debit", "withdrawal", "expense", "dr", "debit_amount", "paid_out"]
    CREDIT_COLS = ["credit", "deposit", "income", "cr", "credit_amount", "paid_in"]
    BALANCE_COLS = ["balance", "closing_balance", "running_balance", "available_balance"]
    CATEGORY_COLS = ["category", "tag", "expense_category"]

    @classmethod
    def _find_col(cls, headers: List[str], target_list: List[str]) -> Optional[str]:
        for h in headers:
            clean_h = h.strip().lower().replace(" ", "_").replace("-", "_")
            for t in target_list:
                if clean_h == t or t in clean_h:
                    return h
        return None

    @classmethod
    def parse_csv_content(cls, content: str, source_doc_id: Optional[str] = None) -> List[Dict[str, Any]]:
        # Handle delimiter detection
        sample = content[:2048]
        delimiter = ','
        if '\t' in sample and sample.count('\t') > sample.count(','):
            delimiter = '\t'
        elif ';' in sample and sample.count(';') > sample.count(','):
            delimiter = ';'

        reader = csv.DictReader(io.StringIO(content), delimiter=delimiter)
        if not reader.fieldnames:
            return []

        headers = list(reader.fieldnames)
        date_col = cls._find_col(headers, cls.DATE_COLS)
        desc_col = cls._find_col(headers, cls.DESC_COLS)
        merchant_col = cls._find_col(headers, cls.MERCHANT_COLS)
        amount_col = cls._find_col(headers, cls.AMOUNT_COLS)
        debit_col = cls._find_col(headers, cls.DEBIT_COLS)
        credit_col = cls._find_col(headers, cls.CREDIT_COLS)
        balance_col = cls._find_col(headers, cls.BALANCE_COLS)
        category_col = cls._find_col(headers, cls.CATEGORY_COLS)

        transactions: List[Dict[str, Any]] = []

        for row in reader:
            raw_date = row.get(date_col, "") if date_col else ""
            raw_desc = row.get(desc_col, "") if desc_col else ""
            raw_merchant = row.get(merchant_col, "") if merchant_col else ""
            raw_cat = row.get(category_col, "") if category_col else ""
            raw_balance = row.get(balance_col, "") if balance_col else ""

            # Determine Amount and Type
            amount = 0.0
            txn_type = "debit"

            if debit_col and row.get(debit_col) and row[debit_col].strip():
                try:
                    val = cls._clean_number(row[debit_col])
                    if val > 0:
                        amount = val
                        txn_type = "debit"
                except Exception:
                    pass

            if credit_col and row.get(credit_col) and row[credit_col].strip():
                try:
                    val = cls._clean_number(row[credit_col])
                    if val > 0:
                        amount = val
                        txn_type = "credit"
                except Exception:
                    pass

            if amount == 0.0 and amount_col and row.get(amount_col):
                val = cls._clean_number(row[amount_col])
                if val < 0:
                    amount = abs(val)
                    txn_type = "debit"
                else:
                    amount = val
                    # Check if description suggests credit or debit
                    if any(k in raw_desc.lower() for k in ["salary", "deposit", "refund", "credit", "interest", "reversal"]):
                        txn_type = "credit"
                    else:
                        txn_type = "debit"

            if amount <= 0:
                continue

            normalized_date = cls._normalize_date(raw_date)
            merchant_name = cls._extract_merchant(raw_merchant or raw_desc)
            balance_val = cls._clean_number(raw_balance) if raw_balance else None

            transactions.append({
                "id": f"txn_{uuid.uuid4().hex[:10]}",
                "date": normalized_date,
                "merchant": merchant_name,
                "description": raw_desc or raw_merchant or merchant_name,
                "amount": round(amount, 2),
                "type": txn_type,
                "category": raw_cat.strip().capitalize() if raw_cat else "Uncategorized",
                "account": "Primary Account",
                "balance": balance_val,
                "source_document_id": source_doc_id
            })

        return transactions

    @staticmethod
    def _clean_number(val: Any) -> float:
        if not val:
            return 0.0
        cleaned = re.sub(r"[^\d.-]", "", str(val).strip())
        try:
            return float(cleaned)
        except ValueError:
            return 0.0

    @staticmethod
    def _normalize_date(date_str: str) -> str:
        if not date_str:
            return datetime.now().strftime("%Y-%m-%d")
        clean_str = date_str.strip().split(" ")[0].split("T")[0]
        
        # Try standard formats
        for fmt in ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y", "%d-%b-%Y", "%d-%b-%y", "%Y/%m/%d"]:
            try:
                dt = datetime.strptime(clean_str, fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue
        return clean_str

    @staticmethod
    def _extract_merchant(desc: str) -> str:
        if not desc:
            return "Unknown Merchant"
        desc_lower = desc.lower()

        # Known merchant signatures
        signatures = [
            ("swiggy", "Swiggy"),
            ("zomato", "Zomato"),
            ("blinkit", "Blinkit"),
            ("instamart", "Instamart"),
            ("zepto", "Zepto"),
            ("uber", "Uber"),
            ("ola", "Ola"),
            ("netflix", "Netflix"),
            ("spotify", "Spotify"),
            ("amazon prime", "Amazon Prime"),
            ("amazon", "Amazon"),
            ("flipkart", "Flipkart"),
            ("myntra", "Myntra"),
            ("croma", "Croma Electronics"),
            ("google one", "Google One"),
            ("apple", "Apple"),
            ("airtel", "Airtel"),
            ("jio", "Jio"),
            ("bescom", "BESCOM"),
            ("bwssb", "BWSSB"),
            ("hp petrol", "HP Petrol Pump"),
            ("indian oil", "Indian Oil"),
            ("prestige", "Prestige Properties"),
            ("apollo pharmacy", "Apollo Pharmacy"),
            ("tech corp", "Tech Corp Solutions"),
            ("salary", "Salary"),
            ("chai point", "Chai Point"),
            ("truffles", "Truffles Cafe"),
            ("third wave", "Third Wave Coffee"),
            ("starbucks", "Starbucks"),
            ("hdfc ergo", "HDFC Ergo"),
            ("hdfc credit card", "HDFC Card Services"),
            ("self transfer", "Self Transfer"),
            ("nature's basket", "Nature's Basket"),
            ("natures basket", "Nature's Basket")
        ]

        for sig, clean_name in signatures:
            if sig in desc_lower:
                return clean_name

        # Fallback: take clean alphabetic words
        clean_words = re.sub(r'[^a-zA-Z0-9\s]', ' ', desc).split()
        if clean_words:
            # Skip noise words like UPI, TXN, REF, IMPS, NEFT, PAID, TO
            filtered = [w for w in clean_words if w.upper() not in ["UPI", "TXN", "REF", "IMPS", "NEFT", "RTGS", "PAID", "TO", "FROM", "A/C", "AC", "PAYMENT", "ORDER"]]
            if filtered:
                return " ".join(filtered[:3]).title()
        return desc.strip()[:30]
