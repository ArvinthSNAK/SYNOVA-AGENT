"""
app/services/chat_service.py

Business logic layer: orchestrates NLP cleanup -> intent detection ->
conversation memory -> OpenAI call. Controllers call this; this never
touches FastAPI's Request/Response objects directly, so it's easy to
unit test in isolation.
"""

from app.conversation.memory import conversation_memory
from app.integrations.openai_client import get_chat_completion
from app.intents.detector import detect_intent
from app.nlp.preprocess import clean_text
from app.schemas.chat import ChatResponse

SYSTEM_PROMPT = (
    "You are a helpful, concise customer support assistant. "
    "Keep answers short and friendly."
)


def handle_chat_message(session_id: str, raw_message: str) -> ChatResponse:
    message = clean_text(raw_message)
    intent = detect_intent(message)

    # 1. store user turn
    conversation_memory.add_message(session_id, "user", message)

    # 2. build the message list OpenAI expects: system + history
    history = conversation_memory.get_history(session_id)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}, *history]

    # 3. call OpenAI
    reply = get_chat_completion(messages)

    # 4. store assistant turn
    conversation_memory.add_message(session_id, "assistant", reply)

    return ChatResponse(session_id=session_id, reply=reply, intent=intent)


def get_conversation_history(session_id: str):
    return conversation_memory.get_history(session_id)


def clear_conversation(session_id: str) -> None:
    conversation_memory.clear(session_id)
