"""
app/conversation/memory.py

Keeps short-term chat history per session so OpenAI has context.

NOTE: this is an in-process dict, which is fine for local dev/testing
but is wiped on restart and won't work across multiple server workers.
For production, swap this class's internals for Redis / Postgres and
nothing else in the app needs to change (same method signatures).
"""

from collections import defaultdict
from typing import Dict, List

MAX_TURNS = 10  # how many past messages to keep per session


class ConversationMemory:
    def __init__(self) -> None:
        self._store: Dict[str, List[dict]] = defaultdict(list)

    def get_history(self, session_id: str) -> List[dict]:
        return self._store[session_id]

    def add_message(self, session_id: str, role: str, content: str) -> None:
        history = self._store[session_id]
        history.append({"role": role, "content": content})
        # keep only the most recent N turns to control token usage
        if len(history) > MAX_TURNS * 2:
            self._store[session_id] = history[-MAX_TURNS * 2 :]

    def clear(self, session_id: str) -> None:
        self._store.pop(session_id, None)


# single shared instance used across the app (simple singleton)
conversation_memory = ConversationMemory()
