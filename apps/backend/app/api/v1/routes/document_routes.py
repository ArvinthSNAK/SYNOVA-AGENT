import pymupdf
import io
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.db.postgres.session import get_db
from app.controllers.document_controller import DocumentController
from app.services.policy_field_parser import PolicyFieldParser
from app.schemas.document_schema import (
    DocumentUploadResponse,
    DocumentAnalyzeResponse,
    ExtractedFieldsResponse,
)

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/analyze-pdf")
async def analyze_pdf_direct(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Direct 1-step extraction endpoint:
    Uploads a Policy PDF or document image, extracts raw text via PyMuPDF/OCR,
    and returns parsed policy fields immediately for instant renewal autofill.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    raw_text = ""
    filename_lower = file.filename.lower()

    try:
        if filename_lower.endswith(".pdf"):
            doc = pymupdf.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                raw_text += page.get_text() + "\n"
            doc.close()
        elif filename_lower.endswith((".png", ".jpg", ".jpeg")):
            # If image, try reading text
            try:
                import easyocr
                reader = easyocr.Reader(["en"], gpu=False)
                ocr_results = reader.readtext(file_bytes, detail=0)
                raw_text = "\n".join(ocr_results)
            except Exception:
                raw_text = ""
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to process document: {str(e)}")

    parser = PolicyFieldParser()
    fields = parser.parse(raw_text)

    return {
        "filename": file.filename,
        "customer_name": fields.get("customer_name") or "",
        "policy_number": fields.get("policy_number") or "",
        "insurer_name": fields.get("insurer_name") or "",
        "vehicle_registration": fields.get("vehicle_registration") or "",
        "vehicle_make": fields.get("vehicle_make") or "",
        "vehicle_model": fields.get("vehicle_model") or "",
        "idv": fields.get("idv") if fields.get("idv") is not None else None,
        "ncb_percent": fields.get("ncb") if fields.get("ncb") is not None else None,
        "previous_premium": fields.get("premium") if fields.get("premium") is not None else None,
        "vehicle_age_years": fields.get("vehicle_age_years") or 2,
        "start_date": fields.get("start_date") or "",
        "end_date": fields.get("end_date") or "",
        "raw_text_length": len(raw_text),
    }


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