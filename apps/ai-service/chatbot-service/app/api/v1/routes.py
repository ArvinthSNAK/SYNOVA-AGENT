"""
app/api/v1/routes.py

All HTTP endpoints for v1. `dependencies=[Depends(get_api_key)]` on the
router means EVERY route below requires a valid X-API-Key header —
you don't have to repeat the check per-endpoint.
"""

from fastapi import APIRouter, Depends

from app.api.controllers import chat_controller
from app.core.security import get_api_key
from app.schemas.chat import ChatRequest, ChatResponse, HistoryResponse

router = APIRouter(
    prefix="/api/v1",
    tags=["Chat"],
    dependencies=[Depends(get_api_key)],
)


@router.post("/chat", response_model=ChatResponse, summary="Send a message to the bot")
def chat(payload: ChatRequest) -> ChatResponse:
    return chat_controller.process_chat(payload)


@router.get(
    "/chat/{session_id}/history",
    response_model=HistoryResponse,
    summary="Get conversation history for a session",
)
def history(session_id: str) -> HistoryResponse:
    return chat_controller.get_history(session_id)


@router.delete(
    "/chat/{session_id}",
    summary="Clear conversation history for a session",
)
def reset(session_id: str) -> dict:
    return chat_controller.reset_history(session_id)
