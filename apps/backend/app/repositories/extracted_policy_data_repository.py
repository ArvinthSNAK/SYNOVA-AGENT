from sqlalchemy.orm import Session
from app.models.extracted_policy_data_model import ExtractedPolicyData


class ExtractedPolicyDataRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, document_id: int, fields: dict, raw_text: str) -> ExtractedPolicyData:
        json_safe_fields = {
            key: (value.isoformat() if hasattr(value, "isoformat") else value)
            for key, value in fields.items()
        }

        record = ExtractedPolicyData(
            document_id=document_id,
            customer_name=fields.get("customer_name"),
            policy_number=fields.get("policy_number"),
            insurer_name=fields.get("insurer_name"),
            policy_type=fields.get("policy_type"),
            vehicle_registration=fields.get("vehicle_registration"),
            vehicle_make=fields.get("vehicle_make"),
            vehicle_model=fields.get("vehicle_model"),
            idv=fields.get("idv"),
            start_date=fields.get("start_date"),
            end_date=fields.get("end_date"),
            premium=fields.get("premium"),
            ncb=fields.get("ncb"),
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