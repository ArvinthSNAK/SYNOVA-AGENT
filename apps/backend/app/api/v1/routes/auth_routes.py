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


from app.auth.dependencies import get_current_user
from app.models.user_model import User


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
    }
