"""
Backend API entrypoint — structure only.
FastAPI app instantiation and router registration will be wired here.
No business/auth/DB logic implemented yet.
"""
from fastapi import FastAPI
from app.api.v1 import router as api_v1_router

app = FastAPI(title="AI Insurance Agent - Backend API")

app.include_router(api_v1_router.router, prefix="/api/v1")

