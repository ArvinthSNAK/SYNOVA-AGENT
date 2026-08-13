"""
Voice agent service entrypoint — structure only.
No STT/TTS/realtime logic implemented yet.
"""
from fastapi import FastAPI

app = FastAPI(title="AI Insurance Agent - Voice Agent Service")
