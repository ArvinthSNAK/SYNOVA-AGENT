from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.postgres.session import get_db
from app.controllers.quote_controller import QuoteController
from app.schemas.quote_schema import QuoteCalculateRequest, QuoteCalculateResponse

router = APIRouter(prefix="/quotes", tags=["quotes"])


@router.post("/calculate", response_model=QuoteCalculateResponse)
def calculate_quote(payload: QuoteCalculateRequest, db: Session = Depends(get_db)):
    controller = QuoteController(db)
    return controller.calculate(payload)