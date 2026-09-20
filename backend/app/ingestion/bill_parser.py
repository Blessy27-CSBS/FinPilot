import re
import uuid
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class BillParser:
    """
    Parses utility bills, invoices, subscription notices, and bill receipts
    into upcoming obligation records.
    """

    @classmethod
    def parse_bill_text(cls, text: str, source_doc_id: Optional[str] = None) -> Dict[str, Any]:
        text_lower = text.lower()

        # 1. Identify provider / merchant
        provider = "Upcoming Obligation"
        bill_type = "utility"
        recurring = True

        if "electricity" in text_lower or "bescom" in text_lower:
            provider = "BESCOM Electricity"
            bill_type = "electricity"
        elif "water" in text_lower or "bwssb" in text_lower:
            provider = "BWSSB Water Supply"
            bill_type = "water"
        elif "airtel" in text_lower or "broadband" in text_lower:
            provider = "Airtel Broadband"
            bill_type = "internet"
        elif "jio" in text_lower:
            provider = "Jio Fiber/Mobile"
            bill_type = "telecom"
        elif "rent" in text_lower:
            provider = "Apartment Rent"
            bill_type = "rent"
        elif "insurance" in text_lower or "policy" in text_lower:
            provider = "Health Insurance Premium"
            bill_type = "insurance"

        # 2. Extract amount
        amt_match = re.search(r'(?:total\s+amount|due\s+amount|amount\s+due|net\s+payable|total|pay)\s*[:=]?\s*(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{2})?)', text, re.IGNORECASE)
        amount = 1500.0
        if amt_match:
            try:
                amount = float(amt_match.group(1).replace(",", ""))
            except ValueError:
                pass
        else:
            # General amount search
            any_amt = re.findall(r'(?:₹|Rs\.?)\s*([0-9,]+(?:\.[0-9]{2})?)', text)
            if any_amt:
                try:
                    amount = float(any_amt[0].replace(",", ""))
                except ValueError:
                    pass

        # 3. Extract due date
        date_match = re.search(r'(?:due\s+date|pay\s+before|by\s+date|payment\s+due)\s*[:=]?\s*(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})', text, re.IGNORECASE)
        if date_match:
            raw_date = date_match.group(1)
            # Parse date
            try:
                for fmt in ["%d-%m-%Y", "%d/%m/%Y", "%Y-%m-%d"]:
                    try:
                        due_date = datetime.strptime(raw_date, fmt).strftime("%Y-%m-%d")
                        break
                    except ValueError:
                        continue
                else:
                    due_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
            except Exception:
                due_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        else:
            due_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")

        return {
            "id": f"ob_{uuid.uuid4().hex[:8]}",
            "name": provider,
            "amount": round(amount, 2),
            "due_date": due_date,
            "recurring": recurring,
            "bill_type": bill_type,
            "source_document_id": source_doc_id,
            "status": "pending"
        }
