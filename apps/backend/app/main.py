"""
Backend API entrypoint — structure only.
FastAPI app instantiation and router registration will be wired here.
No business/auth/DB logic implemented yet.
"""
from fastapi import FastAPI

app = FastAPI(title="AI Insurance Agent - Backend API")

# app.include_router(...)  # to be wired to app/api/v1/router.py
