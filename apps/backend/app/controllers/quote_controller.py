from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.schemas.quote_schema import QuoteCalculateRequest, QuoteCalculateResponse
from app.services.quote_service import QuoteService, QuoteServiceError


class QuoteController:
    def __init__(self, db: Session):
        self.service = QuoteService(db)

    def calculate(self, payload: QuoteCalculateRequest) -> QuoteCalculateResponse:
        try:
            result = self.service.calculate_quote(
                product_id=payload.product_id,
                vehicle=payload.vehicle,
                customer=payload.customer,
                driver=payload.driver,
                application_id=payload.application_id,
                customer_id=payload.customer_id,
                save=payload.save,
            )
        except QuoteServiceError as e:
            raise HTTPException(status_code=400, detail=str(e))

        return QuoteCalculateResponse(**result)