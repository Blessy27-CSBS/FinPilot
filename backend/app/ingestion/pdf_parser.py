import io
import re
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pypdf import PdfReader
from backend.app.ingestion.csv_parser import CSVParser

class PDFParser:
    """
    Parses bank statements and financial summaries from text-based PDFs.
    """

    DATE_PATTERN = re.compile(r'(\d{2}[-/\.]\d{2}[-/\.]\d{2,4}|\d{4}[-/\.]\d{2}[-/\.]\d{2})')
    AMOUNT_PATTERN = re.compile(r'(?:₹|Rs\.?|INR)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?)')

    @classmethod
    def parse_pdf_bytes(cls, pdf_bytes: bytes, source_doc_id: Optional[str] = None) -> List[Dict[str, Any]]:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted_text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                extracted_text += t + "\n"

        lines = extracted_text.splitlines()
        transactions: List[Dict[str, Any]] = []

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            date_match = cls.DATE_PATTERN.search(line_str)
            if not date_match:
                continue

            date_raw = date_match.group(1)
            normalized_date = CSVParser._normalize_date(date_raw)

            # Find amounts
            amounts = cls.AMOUNT_PATTERN.findall(line_str)
            if not amounts:
                continue

            # Remove empty strings
            amounts = [a for a in amounts if a.strip()]
            if not amounts:
                continue

            # Try to grab transaction amount
            raw_amt_str = amounts[0].replace(",", "")
            try:
                amt = float(raw_amt_str)
            except ValueError:
                continue

            if amt <= 0:
                continue

            # Check if line contains Dr / Cr or withdrawal/deposit
            line_lower = line_str.lower()
            txn_type = "debit"
            if any(k in line_lower for k in ["cr", "credit", "deposit", "salary", "refund", "interest"]):
                txn_type = "credit"

            # Remove date and amount from line to get description
            desc_part = cls.DATE_PATTERN.sub("", line_str)
            desc_part = cls.AMOUNT_PATTERN.sub("", desc_part).strip()
            merchant = CSVParser._extract_merchant(desc_part or "PDF Statement Transaction")

            transactions.append({
                "id": f"txn_{uuid.uuid4().hex[:10]}",
                "date": normalized_date,
                "merchant": merchant,
                "description": desc_part or merchant,
                "amount": round(amt, 2),
                "type": txn_type,
                "category": "Uncategorized",
                "account": "Bank Statement",
                "balance": None,
                "source_document_id": source_doc_id
            })

        return transactions
