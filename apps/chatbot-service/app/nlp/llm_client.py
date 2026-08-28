from typing import List
import os
import httpx

OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings"


async def generate_chat_response(messages: List[dict], model: str = "gpt-3.5-turbo", temperature: float = 0.7, max_tokens: int = 512) -> str:
	"""Call the OpenAI Chat Completions API and return the assistant text.

	messages should be a list of dicts like: [{"role": "system", "content": "..."}, ...]
	"""
	# Support either OPENAI_API_KEY or AI_PROVIDER_API_KEY (backwards compatibility)
	api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("AI_PROVIDER_API_KEY")
	if not api_key:
		raise RuntimeError("OPENAI_API_KEY or AI_PROVIDER_API_KEY environment variable is not set")

	payload = {
		"model": model,
		"messages": messages,
		"temperature": temperature,
		"max_tokens": max_tokens,
	}

	headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

	async with httpx.AsyncClient(timeout=30.0) as client:
		resp = await client.post(OPENAI_API_URL, json=payload, headers=headers)
		resp.raise_for_status()
		data = resp.json()

	choices = data.get("choices") or []
	if not choices:
		return ""

	message = choices[0].get("message", {})
	return message.get("content", "").strip()


async def get_embeddings(texts: List[str], model: str = "text-embedding-3-small") -> List[List[float]]:
	"""Get embeddings for a list of texts from OpenAI Embeddings API."""
	api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("AI_PROVIDER_API_KEY")
	if not api_key:
		raise RuntimeError("OPENAI_API_KEY or AI_PROVIDER_API_KEY environment variable is not set")

	payload = {"input": texts, "model": model}
	headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

	async with httpx.AsyncClient(timeout=30.0) as client:
		resp = await client.post(EMBEDDINGS_URL, json=payload, headers=headers)
		resp.raise_for_status()
		data = resp.json()

	embeddings = []
	for item in data.get("data", []):
		embeddings.append(item.get("embedding", []))
	return embeddings

