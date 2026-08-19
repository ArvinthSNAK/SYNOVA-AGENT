from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.postgres.session import get_db
from app.controllers import auth_controller
from app.schemas.auth_schema import RegisterRequest, LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    return auth_controller.register(payload, db)


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return auth_controller.login(payload, db)