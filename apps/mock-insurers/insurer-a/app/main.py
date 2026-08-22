from fastapi import FastAPI
from app.db import Base, engine
from app.routes import router

# Creates insurer_a.db and all tables on startup if they don't exist yet.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mock Insurer A")
app.include_router(router)