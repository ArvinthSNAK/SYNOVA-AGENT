import re
from datetime import datetime
from typing import Optional, Dict, Any


class PolicyFieldParser:
    """
    Advanced multi-pattern parser that extracts structured policy fields
    from raw OCR/PDF text from any insurer format (ICICI Lombard, Digit, Acko,
    Tata AIG, HDFC Ergo, Bajaj Allianz, Star Health, National Insurance, etc.).
    """

    DATE_FORMATS = ["%d-%b-%Y", "%d-%m-%Y", "%d/%m/%Y", "%d %b %Y", "%Y-%m-%d", "%d.%m.%Y"]

    def parse(self, text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            return self._empty_fields()

        clean_text = text.replace("\r", "")

        # 1. Customer Name
        customer_name = self._match_first(
            clean_text,
            [
                r"Insured\s*(?:\([^\)]+\))?",
                r"Insured\s*Name",
                r"Customer\s*Name",
                r"Policy\s*Holder",
                r"Name\s*of\s*(?:the\s*)?Insured",
                r"Proposer\s*Name",
                r"Owner\s*Name",
            ]
        )
        if not customer_name:
            for line in clean_text.split("\n")[:15]:
                line_str = line.strip()
                if re.match(r"^[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?$", line_str) and not any(w in line_str.lower() for w in ["insurance", "limited", "policy", "motor", "certificate", "schedule"]):
                    customer_name = line_str
                    break

        # 2. Policy Number
        policy_number = self._match_first(
            clean_text,
            [
                r"Policy\s*No\.?",
                r"Policy\s*Number",
                r"Certificate\s*No\.?",
                r"Cover\s*Note\s*No\.?",
                r"Schedule\s*No\.?",
            ]
        )
        if not policy_number:
            match_pol = re.search(r"\b([A-Z0-9]{3,6}[\-\/][A-Z0-9\-\/]{6,20})\b", clean_text)
            if match_pol:
                policy_number = match_pol.group(1)

        # 3. Insurer Name
        insurer_name = self._match_insurer_name(clean_text)

        # 4. Vehicle Registration Number
        vehicle_reg = self._match_registration_number(clean_text)

        # 5. Vehicle Make & Model
        vehicle_make = self._match_first(clean_text, [r"Vehicle\s*Make", r"Make(?:\s*and\s*Model)?", r"Manufacturer"])
        vehicle_model = self._match_first(clean_text, [r"Vehicle\s*Model", r"Model(?:\s*Variant)?", r"Variant", r"Make\s*and\s*Model"])

        if not vehicle_make or not vehicle_model:
            combined = self._match_make_model_fallback(clean_text)
            if combined:
                if not vehicle_make:
                    vehicle_make = combined.get("make")
                if not vehicle_model:
                    vehicle_model = combined.get("model")

        # 6. IDV (Insured Declared Value)
        idv = self._match_idv_contextual(clean_text)

        # 7. Premium
        premium = self._match_amount(
            clean_text,
            [
                r"TOTAL\s*ANNUAL\s*PREMIUM(?:\s*PAID)?",
                r"Total\s*(?:Annual\s*)?Premium",
                r"Net\s*Premium\s*Payable",
                r"Gross\s*Premium",
                r"Final\s*Premium",
                r"Total\s*Amount\s*Payable",
            ]
        )
        if not premium:
            m_prem = re.search(r"(?:Total\s*Annual\s*Premium|Total\s*Premium|Amount\s*Paid)[^\d\n\r]*[:\-–]?\s*(?:Rs\.?|INR)?\s*([\d,]+(?:\.\d+)?)", clean_text, re.IGNORECASE)
            if m_prem:
                try:
                    premium = float(m_prem.group(1).replace(",", ""))
                except ValueError:
                    pass

        # 8. NCB (No Claim Bonus)
        ncb = self._match_ncb(clean_text)

        # 9. Dates
        start_date, end_date = self._match_period_dates(clean_text)

        return {
            "customer_name": customer_name or "",
            "policy_number": policy_number or "",
            "insurer_name": insurer_name or "",
            "policy_type": "Comprehensive Motor Cover",
            "vehicle_registration": vehicle_reg or "",
            "vehicle_make": vehicle_make or "",
            "vehicle_model": vehicle_model or "",
            "idv": idv if idv is not None else None,
            "premium": premium if premium is not None else None,
            "ncb": ncb if ncb is not None else None,
            "vehicle_age_years": 2,
            "start_date": start_date.strftime("%Y-%m-%d") if start_date else None,
            "end_date": end_date.strftime("%Y-%m-%d") if end_date else None,
            "raw_text_snippet": clean_text[:300],
        }

    def _empty_fields(self) -> dict:
        return {
            "customer_name": "",
            "policy_number": "",
            "insurer_name": "",
            "policy_type": "",
            "vehicle_registration": "",
            "vehicle_make": "",
            "vehicle_model": "",
            "idv": None,
            "premium": None,
            "ncb": None,
            "vehicle_age_years": 2,
            "start_date": None,
            "end_date": None,
        }

    def _match_first(self, text: str, patterns: list[str]) -> Optional[str]:
        for pat in patterns:
            m = re.search(pat + r"\s*[:\-–]\s*([^\n\r]+)", text, re.IGNORECASE)
            if m:
                val = m.group(1).strip()
                if len(val) > 1 and not val.lower().startswith("table"):
                    return val

            m_next = re.search(pat + r"\s*\n\s*([^\n\r]+)", text, re.IGNORECASE)
            if m_next:
                val = m_next.group(1).strip()
                if len(val) > 1:
                    return val
        return None

    def _match_registration_number(self, text: str) -> Optional[str]:
        m = re.search(r"\b([A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4})\b", text)
        if m:
            clean = m.group(1).upper().replace(" ", "-")
            return clean
        return self._match_first(text, [r"Registration\s*(?:No\.?|Number)", r"Reg\s*No\.?", r"Vehicle\s*No\.?"])

    def _match_idv_contextual(self, text: str) -> Optional[float]:
        # 1. Direct and multi-line patterns using wildcard span
        m = re.search(
            r"(?:IDV|Insured\s*Declared\s*Value|Sum\s*Insured|Vehicle\s*Valuation)[\s\S]{0,60}?([1-9][0-9,]{4,10}(?:\.\d{1,2})?)",
            text,
            re.IGNORECASE,
        )
        if m:
            try:
                val = float(m.group(1).replace(",", ""))
                if 10000 <= val <= 100000000:
                    return val
            except ValueError:
                pass

        # 2. Contextual line scanner fallback
        lines = text.split("\n")
        for i, line in enumerate(lines):
            if any(kw in line.lower() for kw in ["idv", "insured declared value", "sum insured", "declared value"]):
                window = " ".join(lines[i : i + 6])
                nums = re.findall(r"([1-9][0-9,]{4,10}(?:\.\d{1,2})?)", window)
                for n in nums:
                    try:
                        v = float(n.replace(",", ""))
                        if 10000 <= v <= 100000000:
                            return v
                    except ValueError:
                        pass
        return None

    def _match_amount(self, text: str, label_patterns: list[str]) -> Optional[float]:
        raw = self._match_first(text, label_patterns)
        if not raw:
            return None
        m = re.search(r"[\d,]+(?:\.\d+)?", raw)
        if m:
            clean = m.group(0).replace(",", "")
            try:
                val = float(clean)
                if val > 50:
                    return val
            except ValueError:
                pass
        return None

    def _match_ncb(self, text: str) -> Optional[float]:
        m = re.search(r"(?:No\s*Claim\s*Bonus(?:\s*\([A-Za-z0-9]+\))?|NCB)\s*[:\-–]?\s*([0-9]{1,2})\s*%", text, re.IGNORECASE)
        if m:
            return float(m.group(1))
        m2 = re.search(r"(?:No\s*Claim\s*Bonus(?:\s*\([A-Za-z0-9]+\))?|NCB)\s*[:\-–]?\s*([0-9]{1,2})", text, re.IGNORECASE)
        if m2:
            return float(m2.group(1))
        return None

    def _match_insurer_name(self, text: str) -> Optional[str]:
        known_insurers = [
            ("ICICI Lombard", "ICICI Lombard General Insurance"),
            ("Acko", "Acko General Insurance"),
            ("Tata AIG", "TATA AIG Auto Protect"),
            ("HDFC Ergo", "HDFC Ergo Motor Shield"),
            ("Bajaj Allianz", "Bajaj Allianz General Insurance"),
            ("Digit", "Go Digit General Insurance"),
            ("Star Health", "Star Health Insurance"),
            ("New India Assurance", "The New India Assurance Co."),
            ("National Insurance", "National Insurance Company"),
            ("United India", "United India Insurance"),
        ]
        text_lower = text.lower()
        for key, full_name in known_insurers:
            if key.lower() in text_lower:
                return full_name

        return self._match_first(text, [r"Insurer", r"Insurance\s*Company", r"Issued\s*by"])

    def _match_make_model_fallback(self, text: str) -> Optional[dict]:
        known_makes = ["Hyundai", "Maruti", "Suzuki", "Tata", "Honda", "Toyota", "Kia", "Mahindra", "Volkswagen", "Skoda", "BMW", "Mercedes"]
        text_lower = text.lower()
        for make in known_makes:
            if make.lower() in text_lower:
                for line in text.split("\n"):
                    if make.lower() in line.lower():
                        parts = line.strip().split()
                        make_idx = [p.lower() for p in parts].index(make.lower())
                        model_parts = parts[make_idx + 1:make_idx + 3]
                        model_name = " ".join(model_parts) if model_parts else "Standard Variant"
                        return {"make": make, "model": model_name}
        return None

    def _match_period_dates(self, text: str) -> tuple[Optional[datetime], Optional[datetime]]:
        m = re.search(
            r"(?:Period\s*of\s*Insurance\s*From|Policy\s*Period)\s*[:\-–]?\s*([0-9A-Za-z\-\/\.\s]+)\s*to\s*([0-9A-Za-z\-\/\.\s]+)",
            text,
            re.IGNORECASE,
        )
        if m:
            start_dt = self._parse_date_string(m.group(1).strip())
            end_dt = self._parse_date_string(m.group(2).strip())
            return start_dt, end_dt

        start_raw = self._match_first(text, [r"Policy\s*Start\s*Date", r"Start\s*Date", r"Period\s*of\s*Insurance\s*From"])
        end_raw = self._match_first(text, [r"Policy\s*End\s*Date", r"Policy\s*Expiry\s*Date", r"Expiry\s*Date"])
        return (
            self._parse_date_string(start_raw) if start_raw else None,
            self._parse_date_string(end_raw) if end_raw else None,
        )

    def _parse_date_string(self, raw: str) -> Optional[datetime]:
        cleaned = re.sub(r"[^\w\/\-\.]", " ", raw.strip()).strip()
        for fmt in self.DATE_FORMATS:
            try:
                return datetime.strptime(cleaned, fmt)
            except ValueError:
                continue
        return None