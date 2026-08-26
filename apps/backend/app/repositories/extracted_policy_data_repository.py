from sqlalchemy.orm import Session
from datetime import datetime
from app.models.extracted_policy_data_model import ExtractedPolicyData


def _to_datetime(val):
    if isinstance(val, datetime):
        return val
    if isinstance(val, str):
        for fmt in ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%d %b %Y", "%d-%b-%Y"]:
            try:
                return datetime.strptime(val.strip(), fmt)
            except ValueError:
                pass
    return None


class ExtractedPolicyDataRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, document_id: int, fields: dict, raw_text: str) -> ExtractedPolicyData:
        json_safe_fields = {
            key: (value.isoformat() if hasattr(value, "isoformat") else value)
            for key, value in fields.items()
        }

        start_dt = _to_datetime(fields.get("start_date"))
        end_dt = _to_datetime(fields.get("end_date"))

        # Convert ncb to float or clean string
        ncb_val = fields.get("ncb")
        if isinstance(ncb_val, str):
            try:
                ncb_val = float(ncb_val.replace("%", "").strip())
            except ValueError:
                ncb_val = 20.0

        record = ExtractedPolicyData(
            document_id=document_id,
            customer_name=fields.get("customer_name"),
            policy_number=fields.get("policy_number"),
            insurer_name=fields.get("insurer_name"),
            policy_type=fields.get("policy_type"),
            vehicle_registration=fields.get("vehicle_registration"),
            vehicle_make=fields.get("vehicle_make"),
            vehicle_model=fields.get("vehicle_model"),
            idv=float(fields.get("idv")) if fields.get("idv") is not None else None,
            start_date=start_dt,
            end_date=end_dt,
            premium=float(fields.get("premium")) if fields.get("premium") is not None else None,
            ncb=ncb_val,
            raw_text=raw_text,
            raw=json_safe_fields,
        )
        self.db.add(record)
        self.db.flush()
        return record

    def get_by_document_id(self, document_id: int) -> ExtractedPolicyData | None:
        return (
            self.db.query(ExtractedPolicyData)
            .filter(ExtractedPolicyData.document_id == document_id)
            .order_by(ExtractedPolicyData.id.desc())
            .first()
        )

    def get_by_id(self, extracted_id: int) -> ExtractedPolicyData | None:
        return (
            self.db.query(ExtractedPolicyData)
            .filter(ExtractedPolicyData.id == extracted_id)
            .first()
        )