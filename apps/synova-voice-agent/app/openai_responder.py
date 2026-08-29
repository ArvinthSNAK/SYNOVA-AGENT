import httpx
from app.config import settings
from app.models import AdvisorSession

SYSTEM_PROMPT = """You are SYNOVA, a practical personal insurance advisor in India. Rewrite the supplied advisor response into the most useful concise answer. Keep any predefined question exactly as supplied. Use plain language, mention concrete next steps, never invent policy facts, and do not claim to have accessed a document or live quote unless the context says so. Return only the answer text, no markdown headings."""

async def improve_response(reply: str, session: AdvisorSession, transcript: str) -> str:
    cfg = settings()
    if not cfg.openai_api_key or session.stage.startswith("COLLECT_") or session.stage in ("ASK_RENEWAL_PDF", "RECOMMEND"):
        return reply.replace('*', '').strip()
    payload = {
        "model": cfg.openai_text_model,
        "temperature": 0.3,
        "max_tokens": 180,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"User said: {transcript}\nAdvisor workflow state: {session.intent}, {session.workflow}, {session.stage}\nDraft response: {reply}"},
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post("https://api.openai.com/v1/chat/completions", headers={"Authorization": f"Bearer {cfg.openai_api_key}"}, json=payload)
            response.raise_for_status()
            content = response.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return (content or reply).replace('*', '').strip()
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError):
        return reply.replace('*', '').strip()