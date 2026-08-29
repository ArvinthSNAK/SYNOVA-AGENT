from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, Field

Intent = Literal["NEW_INSURANCE", "RENEW_INSURANCE", "CLAIM_ASSISTANCE", "POLICY_QUERY", "POLICY_COMPARISON", "INSURANCE_HEALTH_SCORE", "UNKNOWN"]

class AdvisorSession(BaseModel):
    session_id: str
    intent: Intent = "UNKNOWN"
    workflow: str | None = None
    stage: str = "IDENTIFY_INTENT"
    collected_data: dict[str, str] = Field(default_factory=dict)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TurnRequest(BaseModel):
    session_id: str
    transcript: str = Field(min_length=1, max_length=4000)
    source: Literal["voice", "text"] = "voice"
    customer_name: str | None = None

class TurnResponse(BaseModel):
    reply: str
    session: AdvisorSession
    event: Literal["question", "recommendation", "handoff", "autofill_ready_new", "autofill_ready_renew", "ask_renewal_pdf"] = "question"
    autofill_data: dict[str, str] | None = None
    target_url: str | None = None

class TokenRequest(BaseModel):
    session_id: str
    participant_identity: str = Field(min_length=1, max_length=128)
