from fastapi import APIRouter, Request, Form, Depends
from fastapi.responses import HTMLResponse
from jinja2 import Environment, FileSystemLoader
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from pathlib import Path

from app.db import get_db
from app.models import Product, AddOn
from app.pricing_engine import calculate_quote, PricingEngineError

router = APIRouter()

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"

_jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=True,
    cache_size=0,
)
templates = Jinja2Templates(env=_jinja_env)


@router.get("/quote", response_class=HTMLResponse)
def show_quote_form(request: Request, db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.active == True).all()
    return templates.TemplateResponse(
        request=request,
        name="quote_form.html",
        context={"products": products},
    )


@router.post("/quote", response_class=HTMLResponse)
def submit_quote(
    request: Request,
    product_id: int = Form(...),
    customer_name: str = Form(...),
    vehicle_registration: str = Form(...),
    idv: float = Form(...),
    vehicle_age_years: int = Form(0),
    ncb_percent: float = Form(0),
    engine_capacity_cc: int = Form(1200),
    addon_ids: list[int] = Form(default=[]),
    db: Session = Depends(get_db),
):
    context = {
        "idv": idv,
        "vehicle_age_years": vehicle_age_years,
        "ncb_percent": ncb_percent,
        "engine_capacity_cc": engine_capacity_cc,
    }

    try:
        result = calculate_quote(db, product_id=product_id, context=context, selected_addon_ids=addon_ids)
    except PricingEngineError as e:
        return templates.TemplateResponse(
            request=request,
            name="quote_form.html",
            context={
                "products": db.query(Product).filter(Product.active == True).all(),
                "error": str(e),
            },
        )

    return templates.TemplateResponse(
        request=request,
        name="quote_result.html",
        context={
            "customer_name": customer_name,
            "vehicle_registration": vehicle_registration,
            "result": result,
        },
    )
