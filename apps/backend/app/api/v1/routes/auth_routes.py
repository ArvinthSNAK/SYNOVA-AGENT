from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.postgres.session import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    from app.models.user_model import User
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, full_name=payload.full_name, hashed_password=payload.password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email, "full_name": user.full_name}


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    from app.models.user_model import User
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or user.hashed_password != payload.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"id": user.id, "email": user.email, "message": "Login successful"}
