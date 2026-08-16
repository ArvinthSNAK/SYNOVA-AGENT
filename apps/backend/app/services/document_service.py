import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.document_model import Document
from app.repositories.document_repository import DocumentRepository
from app.repositories.extracted_policy_data_repository import ExtractedPolicyDataRepository
from app.services.pdf_extraction_service import extract_text_from_pdf, PdfExtractionError
from app.services.policy_field_parser import PolicyFieldParser

# Files are stored under apps/backend/uploads/, outside version control.
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"


class DocumentServiceError(ValueError):
    pass


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.documents = DocumentRepository(db)
        self.extracted_data = ExtractedPolicyDataRepository(db)
        self.parser = PolicyFieldParser()

    def save_uploaded_file(
        self,
        filename: str,
        content_type: str | None,
        file_bytes: bytes,
        customer_id: int | None = None,
    ) -> Document:
        if not filename.lower().endswith(".pdf"):
            raise DocumentServiceError("Only PDF files are supported")

        if not file_bytes:
            raise DocumentServiceError("Uploaded file is empty")

        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        unique_name = f"{uuid.uuid4().hex}.pdf"
        stored_path = UPLOAD_DIR / unique_name

        with open(stored_path, "wb") as f:
            f.write(file_bytes)

        document = self.documents.create_document(
            original_filename=filename,
            stored_path=str(stored_path),
            content_type=content_type,
            customer_id=customer_id,
        )
        self.db.commit()
        self.db.refresh(document)
        return document

    def analyze_document(self, document_id: int) -> dict:
        document = self.documents.get_by_id(document_id)
        if document is None:
            raise DocumentServiceError(f"Document with id={document_id} not found")

        self.documents.mark_status(document, "analyzing")
        self.db.commit()

        try:
            raw_text = extract_text_from_pdf(document.stored_path)
        except PdfExtractionError as e:
            self.documents.mark_status(document, "failed")
            self.db.commit()
            raise DocumentServiceError(str(e)) from e

        fields = self.parser.parse(raw_text)

        record = self.extracted_data.create(
            document_id=document.id,
            fields=fields,
            raw_text=raw_text,
        )
        self.documents.mark_status(document, "analyzed")
        self.db.commit()
        self.db.refresh(record)

        return {
            "document_id": document.id,
            "extracted_id": record.id,
            "fields": fields,
        }

    def get_extracted_data(self, document_id: int) -> dict:
        document = self.documents.get_by_id(document_id)
        if document is None:
            raise DocumentServiceError(f"Document with id={document_id} not found")

        record = self.extracted_data.get_by_document_id(document_id)
        if record is None:
            raise DocumentServiceError(
                f"Document {document_id} has not been analyzed yet"
            )

        return {
            "document_id": document.id,
            "extracted_id": record.id,
            "status": document.status,
            "fields": {
                "customer_name": record.customer_name,
                "policy_number": record.policy_number,
                "insurer_name": record.insurer_name,
                "policy_type": record.policy_type,
                "vehicle_registration": record.vehicle_registration,
                "vehicle_make": record.vehicle_make,
                "vehicle_model": record.vehicle_model,
                "idv": record.idv,
                "premium": record.premium,
                "ncb": record.ncb,
                "start_date": record.start_date,
                "end_date": record.end_date,
            },
        }