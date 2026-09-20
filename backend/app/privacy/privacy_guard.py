import re
from typing import Tuple, Dict, List, Any

class PrivacyGuard:
    """
    PrivacyGuard protects sensitive personal and financial identifiers
    before sending text to Gemini.
    Detects and masks:
    - Person names (e.g. 'Paid to Rahul Kumar')
    - Bank account numbers
    - Phone numbers
    - UPI IDs
    - Card numbers
    - Email addresses
    
    A local token map is maintained and NEVER transmitted to the LLM.
    """

    # Regex patterns for Indian and generic financial formats
    UPI_REGEX = re.compile(r'\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b')
    CARD_REGEX = re.compile(r'\b(?:\d{4}[ -]?){3}\d{4}\b')
    ACCOUNT_REGEX = re.compile(r'(?:A/C|a/c|Account|Acct|acct|Acc\.?|account no\.?|A/C No\.?)[\s:]*([0-9Xx]{8,18})\b', re.IGNORECASE)
    PHONE_REGEX = re.compile(r'(?:\+91[\s\-]?)?[6789]\d{9}\b')
    EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')
    PERSON_TRANSFER_REGEX = re.compile(r'(?:paid to|transfer to|sent to|received from|to|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b', re.IGNORECASE)

    @classmethod
    def mask(cls, text: str) -> Tuple[str, Dict[str, str], int, List[str]]:
        """
        Masks sensitive data in `text`.
        Returns: (masked_text, local_token_map, total_masked_count, list_of_masked_types)
        """
        token_map: Dict[str, str] = {}
        masked_types: List[str] = []
        masked_text = text
        count = 0

        # 1. Mask Card numbers
        cards = cls.CARD_REGEX.findall(masked_text)
        for i, card in enumerate(cards, start=1):
            token = f"[CARD_{i}]"
            token_map[token] = card
            masked_text = masked_text.replace(card, token)
            masked_types.append("card_number")
            count += 1

        # 2. Mask Bank Account numbers
        accounts = cls.ACCOUNT_REGEX.findall(masked_text)
        for i, acc in enumerate(accounts, start=1):
            token = f"[ACCOUNT_{i}]"
            token_map[token] = acc
            masked_text = masked_text.replace(acc, token)
            masked_types.append("bank_account")
            count += 1

        # 3. Mask UPI IDs
        upis = cls.UPI_REGEX.findall(masked_text)
        for i, upi in enumerate(upis, start=1):
            if "@" in upi and not upi.endswith(('.com', '.org', '.net', '.edu', '.io')):
                token = f"[UPI_{i}]"
                token_map[token] = upi
                masked_text = masked_text.replace(upi, token)
                masked_types.append("upi_id")
                count += 1

        # 4. Mask Phone numbers
        phones = cls.PHONE_REGEX.findall(masked_text)
        for i, phone in enumerate(phones, start=1):
            token = f"[PHONE_{i}]"
            token_map[token] = phone
            masked_text = masked_text.replace(phone, token)
            masked_types.append("phone_number")
            count += 1

        # 5. Mask Email addresses
        emails = cls.EMAIL_REGEX.findall(masked_text)
        for i, email in enumerate(emails, start=1):
            token = f"[EMAIL_{i}]"
            token_map[token] = email
            masked_text = masked_text.replace(email, token)
            masked_types.append("email_address")
            count += 1

        # 6. Mask Person Names in transfer contexts
        person_matches = cls.PERSON_TRANSFER_REGEX.findall(masked_text)
        for i, name in enumerate(person_matches, start=1):
            # Ignore common merchants
            if name.lower() in ["tech corp", "prestige properties", "uber", "ola", "zomato", "swiggy", "amazon", "netflix", "spotify", "bescom", "airtel"]:
                continue
            token = f"[PERSON_{i}]"
            token_map[token] = name
            masked_text = masked_text.replace(name, token)
            masked_types.append("person_name")
            count += 1

        return masked_text, token_map, count, list(set(masked_types))

    @classmethod
    def unmask(cls, text: str, token_map: Dict[str, str]) -> str:
        """
        Restores tokens back to original values locally.
        """
        restored = text
        for token, original in token_map.items():
            restored = restored.replace(token, original)
        return restored
