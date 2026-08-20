"""
app/api/controllers/chat_controller.py

Controllers translate HTTP concerns (status codes, validation errors)
into calls on the service layer. Routes stay skinny; this stays skinny;
all real logic lives in app/services/chat_service.py.
"""

from fastapi import HTTPException, status

from app.schemas.chat import ChatRequest, ChatResponse, HistoryResponse
from app.services import chat_service


def process_chat(payload: ChatRequest) -> ChatResponse:
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty.",
        )
    return chat_service.handle_chat_message(payload.session_id, payload.message)


def get_history(session_id: str) -> HistoryResponse:
    history = chat_service.get_conversation_history(session_id)
    return HistoryResponse(session_id=session_id, history=history)


def reset_history(session_id: str) -> dict:
    chat_service.clear_conversation(session_id)
    return {"session_id": session_id, "status": "cleared"}
