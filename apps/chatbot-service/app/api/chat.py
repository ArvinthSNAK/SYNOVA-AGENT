"""
Chat API endpoint — RAG-powered OpenAI chatbot for Synova Euler AI.
"""
import os
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from openai import OpenAI, OpenAIError
from app.knowledge_base import get_system_prompt

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize OpenAI client lazily to avoid startup errors when key not set
def get_client():
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key.startswith("sk-your-"):
        return None
    return OpenAI(api_key=api_key)


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str
    success: bool = True


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    RAG-powered chat endpoint. Injects the Synova insurance knowledge base as
    system context and returns an OpenAI GPT-4o-mini generated response.
    """
    client = get_client()
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key not configured. Please set OPENAI_API_KEY in .env file."
        )

    # Build messages: system prompt (RAG context) + recent history + new message
    messages = [
        {"role": "system", "content": get_system_prompt()}
    ]

    # Include last 10 messages of history to stay within context limits
    if request.history:
        for msg in request.history[-10:]:
            if msg.role in ("user", "assistant"):
                messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": request.message})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=600,
            temperature=0.7,
        )
        reply = response.choices[0].message.content.strip()
        return ChatResponse(reply=reply, success=True)

    except OpenAIError as e:
        logger.error(f"OpenAI API error: {e}")
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected chat error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
