# SYNOVA Voice Agent

This is a new, independent voice gateway; it does not reuse `voice-agent-service`.

It manages a shared advisor session, exposes a WebSocket for streaming transcript/events,
and issues a LiveKit room token when LiveKit credentials are configured. In local development
it uses an in-memory session store, so it remains runnable without cloud credentials.

```powershell
uv run --with-requirements requirements.txt uvicorn app.main:app --reload --port 8011
```

Copy `.env.example` to `.env` before configuring OpenAI Realtime and LiveKit.
