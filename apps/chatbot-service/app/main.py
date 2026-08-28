"""Chatbot service entrypoint with a simple `/chat` endpoint that uses OpenAI."""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

from .nlp import llm_client, prompt_templates
from .nlp import rag
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="AI Insurance Agent - Chatbot Service")

# CORS - allow frontend during development. Configure via FRONTEND_ORIGINS env var (comma-separated)
frontend_origins = os.environ.get("FRONTEND_ORIGINS") or "http://localhost:5173,http://127.0.0.1:5173"
origins = [o.strip() for o in frontend_origins.split(",") if o.strip()]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins or ["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


class ChatRequest(BaseModel):
	message: str
	history: Optional[List[dict]] = None
	use_rag: Optional[bool] = False
	top_k: Optional[int] = 3


class ChatResponse(BaseModel):
	response: str


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
	"""Receive a user message and return an LLM-generated reply."""
	try:
		messages = [{"role": "system", "content": prompt_templates.SYSTEM_PROMPT}]

		if req.history:
			# Expect history as a list of {role: 'user'|'assistant', content: '...'}
			for h in req.history:
				if isinstance(h, dict) and "role" in h and "content" in h:
					messages.append(h)

		if req.use_rag:
			# retrieve relevant docs and add as system context
			retrieved = await rag.retrieve(req.message, top_k=req.top_k or 3)
			if retrieved:
				context_texts = "\n---\n".join([f"Source: {d.get('id')}\n{d.get('text')}" for d in retrieved])
				messages.append({"role": "system", "content": f"Relevant information to consider:\n{context_texts}"})

		messages.append({"role": "user", "content": req.message})

		reply = await llm_client.generate_chat_response(messages, model=prompt_templates.DEFAULT_MODEL)
		return ChatResponse(response=reply)
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))


@app.post("/rag/documents")
async def add_rag_documents(items: List[dict]):
	"""Add documents to the RAG store. Body: [{text, id?, metadata?}, ...]"""
	try:
		await rag.add_documents(items)
		return {"status": "ok", "added": len(items)}
	except Exception as exc:
		raise HTTPException(status_code=500, detail=str(exc))

