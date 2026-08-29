from app.models import AdvisorSession

class SessionStore:
    """Swap this implementation with Redis in production without changing the agent."""
    def __init__(self) -> None: self._sessions: dict[str, AdvisorSession] = {}
    def load(self, session_id: str) -> AdvisorSession: return self._sessions.get(session_id, AdvisorSession(session_id=session_id))
    def save(self, session: AdvisorSession) -> AdvisorSession:
        self._sessions[session.session_id] = session
        return session

store = SessionStore()
