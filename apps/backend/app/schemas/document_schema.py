from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime


class DocumentUploadResponse(BaseModel):
    document_id: int
    original_filename: str
    status: str

    class Config:
        from_attributes = True


class DocumentAnalyzeResponse(BaseModel):
    document_id: int
    extracted_id: int
    fields: Dict[str, Any]


class ExtractedFieldsResponse(BaseModel):
    document_id: int
    extracted_id: int
    status: str
    fields: Dict[str, Any]