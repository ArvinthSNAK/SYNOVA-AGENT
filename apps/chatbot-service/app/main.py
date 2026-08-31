"""
Synova AI Chatbot Service — RAG-powered Insurance Copilot using OpenAI.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.api.chat import router as chat_router

app = FastAPI(title="Synova Euler AI Chatbot Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "service": "euler-chatbot"}
