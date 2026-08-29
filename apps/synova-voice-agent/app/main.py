import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.advisor import next_turn
from app.config import settings
from app.livekit import create_room_token
from app.models import TokenRequest, TurnRequest, TurnResponse
from app.session_store import store
from app.openai_responder import improve_response

cfg = settings()
app = FastAPI(title="SYNOVA Realtime Voice Advisor", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=cfg.origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health() -> dict[str, str]: return {"status": "ok", "service": "synova-voice-agent", "mode": cfg.app_env}

@app.post("/v1/turns", response_model=TurnResponse)
async def turn(request: TurnRequest) -> TurnResponse:
    session = store.load(request.session_id)
    response = next_turn(session, request.transcript, customer_name=request.customer_name)
    response.reply = await improve_response(response.reply, response.session, request.transcript)
    store.save(response.session)
    return response

@app.get("/v1/sessions/{session_id}")
def session(session_id: str): return store.load(session_id)

@app.post("/v1/livekit/token")
def livekit_token(request: TokenRequest):
    return {"token": create_room_token(request.participant_identity, request.session_id), "url": cfg.livekit_url, "room": request.session_id}

@app.websocket("/v1/realtime/{session_id}")
async def realtime_voice(websocket: WebSocket, session_id: str):
    await websocket.accept()
    await websocket.send_json({"type": "ready", "session_id": session_id, "message": "SYNOVA voice advisor connected"})
    try:
        while True:
            payload = json.loads(await websocket.receive_text())
            if payload.get("type") != "transcript":
                await websocket.send_json({"type": "error", "message": "Expected a transcript event."}); continue
            response = next_turn(store.load(session_id), str(payload.get("text", "")))
            response.reply = await improve_response(response.reply, response.session, str(payload.get("text", "")))
            store.save(response.session)
            await websocket.send_json({"type": "thinking"})
            await websocket.send_json({"type": "advisor_response", "reply": response.reply, "event": response.event, "session": response.session.model_dump(mode="json")})
    except WebSocketDisconnect: return
