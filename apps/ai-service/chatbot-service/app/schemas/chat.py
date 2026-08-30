"""
app/schemas/chat.py

Request/response contracts. These show up automatically in Swagger
under "Schemas" because FastAPI reads Pydantic models.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    session_id: str = Field(
        ..., description="Unique id for the conversation (per user/device)."
    )
    message: str = Field(..., min_length=1, description="User's message text.")

    model_config = {
        "json_schema_extra": {
            "example": {
                "session_id": "user-123",
                "message": "Hey, what can you help me with?",
            }
        }
    }


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    intent: Optional[str] = None


class HistoryItem(BaseModel):
    role: str
    content: str


class HistoryResponse(BaseModel):
    session_id: str
    history: List[HistoryItem]
