from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.postgres.session import get_db
from app.services.auth_service import AuthService, AuthServiceError
from app.schemas.auth_schema import RegisterRequest, LoginRequest


def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    svc = AuthService(db)
    try:
        return svc.register(email=payload.email, password=payload.password, full_name=payload.full_name)
    except AuthServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))


def login(payload: LoginRequest, db: Session = Depends(get_db)):
    svc = AuthService(db)
    try:
        return svc.login(email=payload.email, password=payload.password)
    except AuthServiceError as e:
        raise HTTPException(status_code=401, detail=str(e))


def get_me_user(db: Session = Depends(get_db), current_user=Depends(lambda: None)):
    from app.auth.dependencies import get_current_user
    # Handled via dependency injection directly
    return get_current_user