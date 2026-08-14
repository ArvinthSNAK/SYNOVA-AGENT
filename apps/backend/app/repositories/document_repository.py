from sqlalchemy.orm import Session
from app.models.document_model import Document


class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_document(
        self,
        original_filename: str,
        stored_path: str,
        content_type: str | None = None,
        customer_id: int | None = None,
        document_type: str = "policy_pdf",
    ) -> Document:
        document = Document(
            original_filename=original_filename,
            stored_path=stored_path,
            content_type=content_type,
            customer_id=customer_id,
            document_type=document_type,
            status="uploaded",
        )
        self.db.add(document)
        self.db.flush()
        return document

    def get_by_id(self, document_id: int) -> Document | None:
        return self.db.query(Document).filter(Document.id == document_id).first()

    def mark_status(self, document: Document, status: str) -> Document:
        document.status = status
        self.db.flush()
        return document