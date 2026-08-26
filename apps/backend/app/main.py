from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models
from app.db.postgres.session import engine
from app.db.postgres.base import Base
from app.api.v1.router import router as api_v1_router
from app.api.v1.routes.document_routes import router as document_router

# Ensure all database tables exist on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SYNOVA AI Insurance Agent - Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")
app.include_router(document_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "SYNOVA Backend API Running", "docs": "/docs", "version": "2.0.3"}

