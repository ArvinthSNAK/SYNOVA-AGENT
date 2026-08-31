from fastapi import APIRouter, Request, Form, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader
from sqlalchemy.orm import Session
from pathlib import Path
from typing import Optional
import seed_data

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


@router.get("/")
def root_redirect():
    return RedirectResponse(url="/quote")


@router.get("/health")
def health_check():
    return {"status": "ok", "insurer": "ACKO General", "gateway": "insurer_b"}


@router.get("/quote", response_class=HTMLResponse)
def show_quote_form(request: Request, db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.active == True).all()
    if not products:
        try:
            seed_data.seed_data()
            products = db.query(Product).filter(Product.active == True).all()
        except Exception:
            pass
    return templates.TemplateResponse(
        request=request,
        name="quote_form.html",
        context={"products": products},
    )


@router.get("/quote/{product_id}/addons", response_class=HTMLResponse)
def get_addons_for_product(product_id: int, request: Request, db: Session = Depends(get_db)):
    addons = db.query(AddOn).filter(AddOn.product_id == product_id, AddOn.active == True).all()
    return templates.TemplateResponse(
        request=request,
        name="addon_options.html",
        context={"addons": addons},
    )


@router.post("/quote", response_class=HTMLResponse)
def submit_quote(
    request: Request,
    product_id: Optional[int] = Form(None),
    customer_name: str = Form("Hariharan Murugesan"),
    vehicle_registration: str = Form("KA-01-MJ-4092"),
    idv: float = Form(650000.0),
    vehicle_age_years: int = Form(0),
    ncb_percent: float = Form(0.0),
    addon_ids: list[int] = Form(default=[]),
    db: Session = Depends(get_db),
):
    if not product_id:
        prod = db.query(Product).filter(Product.active == True).first()
        if not prod:
            try:
                seed_data.seed_data()
                prod = db.query(Product).filter(Product.active == True).first()
            except Exception:
                pass
        product_id = prod.id if prod else 1

    context = {
        "idv": float(idv or 650000.0),
        "vehicle_age_years": int(vehicle_age_years or 0),
        "ncb_percent": float(ncb_percent or 0.0),
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



import urllib.request
import json
from datetime import datetime, timezone
from pathlib import Path

SHARED_NOTIF_FILE = Path(__file__).resolve().parent.parent.parent.parent / "shared_notifications.json"

def notify_synova_platform(title: str, message: str, insurer_name: str, product_name: str):
    now_iso = datetime.now(timezone.utc).isoformat()
    item = {
        "id": int(datetime.now(timezone.utc).timestamp() * 1000),
        "title": title,
        "subject": title,
        "message": message,
        "insurer_name": insurer_name,
        "product_name": product_name,
        "notification_type": "NEW_POLICY_LAUNCH",
        "status": "unread",
        "created_at": now_iso
    }
    existing = []
    if SHARED_NOTIF_FILE.exists():
        try:
            with open(SHARED_NOTIF_FILE, "r", encoding="utf-8") as f:
                existing = json.load(f)
        except Exception:
            existing = []
    existing = [item] + existing
    try:
        with open(SHARED_NOTIF_FILE, "w", encoding="utf-8") as f:
            json.dump(existing[:50], f, indent=2)
    except Exception as e:
        print(f"[Broadcast Shared Notification Sync] {e}")


@router.get("/admin", response_class=HTMLResponse)
def show_admin_products(request: Request, db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return templates.TemplateResponse(
        request=request,
        name="admin_products.html",
        context={"products": products},
    )


@router.post("/admin/products", response_class=HTMLResponse)
def create_admin_product(
    request: Request,
    name: str = Form(...),
    insurance_type: str = Form("motor"),
    description: str = Form(""),
    base_rate_percent: float = Form(2.5),
    min_premium: float = Form(14200.0),
    db: Session = Depends(get_db)
):
    prod = Product(
        name=name,
        insurance_type=insurance_type,
        base_rate_percent=base_rate_percent,
        active=True
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    
    notify_synova_platform(
        title=f"New Policy Alert: {name}",
        message=f"ACKO General Insurance has launched '{name}' (Base Rate: {base_rate_percent}%, Starting from ₹{int(min_premium):,}) with Engine Protector benefits.",
        insurer_name="ACKO General Insurance",
        product_name=name
    )

    products = db.query(Product).all()
    return templates.TemplateResponse(
        request=request,
        name="admin_products.html",
        context={"products": products, "success_message": f"Successfully published {name} & broadcasted to Synova!"},
    )


@router.post("/admin/products/{product_id}/toggle", response_class=HTMLResponse)
def toggle_admin_product(product_id: int, request: Request, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if prod:
        prod.active = not prod.active
        db.commit()
    products = db.query(Product).all()
    return templates.TemplateResponse(
        request=request,
        name="admin_products.html",
        context={"products": products, "success_message": f"Policy status updated!"},
    )


@router.get("/api/notifications")
def get_mock_notifications(db: Session = Depends(get_db)):
    results = []
    seen_products = set()
    
    if SHARED_NOTIF_FILE.exists():
        try:
            with open(SHARED_NOTIF_FILE, "r", encoding="utf-8") as f:
                shared = json.load(f)
                if isinstance(shared, list):
                    for n in shared:
                        if n.get("insurer_name") == "ACKO General Insurance":
                            results.append(n)
                            if n.get("product_name"):
                                seen_products.add(n.get("product_name"))
        except Exception:
            pass

    products = db.query(Product).order_by(Product.id.desc()).all()
    now_iso = datetime.now(timezone.utc).isoformat()
    for p in products:
        if p.name not in seen_products:
            results.append({
                "id": f"ins-b-{p.id}",
                "title": f"New Policy Alert: {p.name}",
                "message": f"ACKO General Insurance has launched '{p.name}' (Category: {p.insurance_type.upper()}, Base Rate: {p.base_rate_percent}%) with Engine Protector benefits.",
                "insurer_name": "ACKO General Insurance",
                "product_name": p.name,
                "status": "unread" if p.active else "read",
                "created_at": now_iso,
            })
            seen_products.add(p.name)
    return results


@router.post("/admin/products/{product_id}/delete", response_class=HTMLResponse)
def delete_admin_product(product_id: int, request: Request, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if prod:
        prod_name = prod.name
        db.delete(prod)
        db.commit()
        notify_synova_platform(
            title=f"Policy Notice: {prod_name}",
            message=f"ACKO General Insurance has retired policy '{prod_name}' from the live catalog.",
            insurer_name="ACKO General Insurance",
            product_name=prod_name
        )
    products = db.query(Product).all()
    return templates.TemplateResponse(
        request=request,
        name="admin_products.html",
        context={"products": products, "success_message": f"Policy successfully removed!"},
    )
