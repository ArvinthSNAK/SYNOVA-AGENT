"""
app/integrations/openai_client.py

The ONLY file in the project that talks to the OpenAI SDK.
Everything else calls `get_chat_completion(...)`. This isolation means:
  - if you switch providers (Anthropic, Azure OpenAI, etc.) later,
    you only touch this one file.
  - your OPENAI_API_KEY is never imported anywhere else.
"""

from typing import List, Dict

from openai import OpenAI, OpenAIError
from fastapi import HTTPException, status

from app.core.config import get_settings

settings = get_settings()
_client = OpenAI(api_key=settings.OPENAI_API_KEY)


def get_chat_completion(messages: List[Dict[str, str]]) -> str:
    """
    messages: list of {"role": "user"|"assistant"|"system", "content": str}
    returns: assistant's reply text
    """
    try:
        response = _client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS,
        )
        return response.choices[0].message.content.strip()

    except OpenAIError as exc:
        # Never leak raw provider errors (could contain the key) to the client
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Upstream AI provider error: {type(exc).__name__}",
        )
