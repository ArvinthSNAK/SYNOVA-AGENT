from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from app.db.postgres.session import get_db
from app.controllers.document_controller import DocumentController
from app.schemas.document_schema import (
    DocumentUploadResponse,
    DocumentAnalyzeResponse,
    ExtractedFieldsResponse,
)

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    customer_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    controller = DocumentController(db)
    file_bytes = await file.read()
    result = controller.upload(
        filename=file.filename,
        content_type=file.content_type,
        file_bytes=file_bytes,
        customer_id=customer_id,
    )
    return DocumentUploadResponse(**result)


@router.post("/{document_id}/analyze", response_model=DocumentAnalyzeResponse)
def analyze_document(document_id: int, db: Session = Depends(get_db)):
    controller = DocumentController(db)
    result = controller.analyze(document_id)
    return DocumentAnalyzeResponse(**result)


@router.get("/{document_id}/extracted-data", response_model=ExtractedFieldsResponse)
def get_extracted_data(document_id: int, db: Session = Depends(get_db)):
    controller = DocumentController(db)
    result = controller.get_extracted_data(document_id)
    return ExtractedFieldsResponse(**result)