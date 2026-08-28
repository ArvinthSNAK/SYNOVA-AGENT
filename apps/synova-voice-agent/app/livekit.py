from datetime import datetime, timedelta, timezone
import jwt
from fastapi import HTTPException
from app.config import settings

def create_room_token(identity: str, room: str) -> str:
    cfg = settings()
    if not cfg.livekit_api_key or not cfg.livekit_api_secret:
        raise HTTPException(503, "LiveKit is not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET.")
    now = datetime.now(timezone.utc)
    return jwt.encode({"iss": cfg.livekit_api_key, "sub": identity, "nbf": now, "exp": now + timedelta(hours=1), "video": {"roomJoin": True, "room": room, "canPublish": True, "canSubscribe": True}}, cfg.livekit_api_secret, algorithm="HS256")
