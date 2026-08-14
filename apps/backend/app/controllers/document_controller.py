from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.services.document_service import DocumentService, DocumentServiceError


class DocumentController:
    def __init__(self, db: Session):
        self.service = DocumentService(db)

    def upload(
        self,
        filename: str,
        content_type: str | None,
        file_bytes: bytes,
        customer_id: int | None = None,
    ) -> dict:
        try:
            document = self.service.save_uploaded_file(
                filename=filename,
                content_type=content_type,
                file_bytes=file_bytes,
                customer_id=customer_id,
            )
        except DocumentServiceError as e:
            raise HTTPException(status_code=400, detail=str(e))

        return {
            "document_id": document.id,
            "original_filename": document.original_filename,
            "status": document.status,
        }

    def analyze(self, document_id: int) -> dict:
        try:
            result = self.service.analyze_document(document_id)
        except DocumentServiceError as e:
            raise HTTPException(status_code=400, detail=str(e))

        return result

    def get_extracted_data(self, document_id: int) -> dict:
        try:
            result = self.service.get_extracted_data(document_id)
        except DocumentServiceError as e:
            raise HTTPException(status_code=404, detail=str(e))

        return result