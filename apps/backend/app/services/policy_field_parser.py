import re
from datetime import datetime


class PolicyFieldParser:
    """
    Regex/rule-based parser that extracts structured policy fields
    from raw OCR/PDF text. Supports two common label styles:
      1. "Label: value"      (same line)
      2. "Label\nvalue"      (label and value on separate lines)
    Every field is best-effort: if no pattern matches, the field is
    left as None rather than guessed.
    """

    DATE_FORMATS = ["%d-%m-%Y", "%d/%m/%Y", "%d %b %Y", "%d-%b-%Y", "%Y-%m-%d"]

    def parse(self, text: str) -> dict:
        return {
            "customer_name": self._match_first(
                text, ["Insured Name", "Customer Name", "Policy Holder"]
            ),
            "policy_number": self._match_first(
                text, ["Policy No\\.?", "Policy Number"]
            ),
            "insurer_name": self._match_insurer_name(text),
            "policy_type": self._match_first(
                text, ["Policy Type", "Product Name", "Plan"]
            ),
            "vehicle_registration": self._match_first(
                text, ["Registration No\\.?", "Reg\\.?\\s*No\\.?", "Vehicle No\\.?", "Registration Number"]
            ),
            "vehicle_make": self._match_first(text, ["Vehicle Make", "Make"]),
            "vehicle_model": self._match_first(text, ["Vehicle Model", "Model"]),
            "idv": self._match_amount(
                text, ["Coverage \\(IDV\\)", "IDV", "Insured Declared Value"]
            ),
            "premium": self._match_amount(
                text, ["Total Annual Premium", "Total Premium", "Net Premium", "Premium Amount"]
            ),
            "ncb": self._match_first(
                text, ["No Claim Bonus \\(NCB\\)", "NCB", "No Claim Bonus"]
            ),
            "start_date": self._match_period_date(text, which="start"),
            "end_date": self._match_period_date(text, which="end"),
        }

    def _match_first(self, text: str, label_variants: list[str]) -> str | None:
        for label in label_variants:
            # Style 1: "Label: value" or "Label - value" on the same line
            same_line = re.search(rf"{label}\s*[:\-]\s*(.+)", text, re.IGNORECASE)
            if same_line:
                value = same_line.group(1).strip().split("\n")[0].strip()
                if value:
                    return value

            # Style 2: "Label" on its own line, value on the next line
            next_line = re.search(rf"{label}\s*\n\s*(.+)", text, re.IGNORECASE)
            if next_line:
                value = next_line.group(1).strip()
                if value:
                    return value
        return None

    def _match_amount(self, text: str, label_variants: list[str]) -> float | None:
        raw = self._match_first(text, label_variants)
        if raw is None:
            return None
        # Extract just the numeric portion (digits, commas, one decimal point),
        # ignoring currency symbols/words like "Rs." or "₹" entirely.
        number_match = re.search(r"\d[\d,]*(?:\.\d+)?", raw)
        if not number_match:
            return None
        cleaned = number_match.group(0).replace(",", "")
        try:
            return float(cleaned)
        except ValueError:
            return None

    def _match_insurer_name(self, text: str) -> str | None:
        # Explicit label first
        labeled = self._match_first(text, ["Insurer", "Insurance Company"])
        if labeled:
            return labeled
        # Fallback: many policy schedules put the insurer name as the
        # very first line of the document (unlabeled).
        first_line = text.strip().split("\n")[0].strip()
        if "insurance" in first_line.lower():
            return first_line
        return None

    def _match_period_date(self, text: str, which: str) -> datetime | None:
        # Handles "Policy Period\n14-Sep-2025 to 13-Sep-2026"
        match = re.search(
            r"Policy Period\s*\n\s*([\d\-A-Za-z]+)\s*to\s*([\d\-A-Za-z]+)",
            text,
            re.IGNORECASE,
        )
        if match:
            raw = match.group(1) if which == "start" else match.group(2)
            return self._parse_date_string(raw.strip())

        # Fall back to explicit labels
        labels = (
            ["Policy Start Date", "Period of Insurance From", "Start Date"]
            if which == "start"
            else ["Policy End Date", "Policy Expiry Date", "Period of Insurance To", "Expiry Date"]
        )
        raw = self._match_first(text, labels)
        if raw:
            return self._parse_date_string(raw)
        return None

    def _parse_date_string(self, raw: str) -> datetime | None:
        raw = raw.strip()
        for fmt in self.DATE_FORMATS:
            try:
                return datetime.strptime(raw, fmt)
            except ValueError:
                continue
        return None