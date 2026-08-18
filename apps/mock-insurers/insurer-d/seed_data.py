from app.db import SessionLocal, Base, engine
from app.models import Product, PricingRule, AddOn

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    existing = db.query(Product).filter(Product.name == "SafeGuard Premium Motor").first()
    if existing:
        print("Product already seeded, skipping.")
    else:
        product = Product(
            name="SafeGuard Premium Motor",
            insurance_type="motor",
            base_rate_percent=2.8,
            active=True,
        )
        db.add(product)
        db.flush()

        rules = [
            PricingRule(
                product_id=product.id,
                name="Base OD Premium (2.8% of IDV)",
                rule_type="base",
                expression={"op": "mul", "args": [{"var": "idv"}, {"const": 0.028}]},
                priority=10,
                active=True,
            ),
            PricingRule(
                product_id=product.id,
                name="Engine Capacity Loading (₹0.80 per cc)",
                rule_type="loading",
                expression={"op": "mul", "args": [{"var": "engine_capacity_cc"}, {"const": 0.80}]},
                priority=15,
                active=True,
            ),
            PricingRule(
                product_id=product.id,
                name="Vehicle Age Loading (₹700 per year)",
                rule_type="loading",
                expression={"op": "mul", "args": [{"var": "vehicle_age_years"}, {"const": 700}]},
                priority=20,
                active=True,
            ),
            PricingRule(
                product_id=product.id,
                name="NCB Discount",
                rule_type="discount",
                expression={
                    "op": "mul",
                    "args": [
                        {"op": "mul", "args": [{"var": "idv"}, {"const": 0.028}]},
                        {"op": "div", "args": [{"var": "ncb_percent"}, {"const": 100}]},
                    ],
                },
                priority=30,
                active=True,
            ),
            PricingRule(
                product_id=product.id,
                name="Anti-Theft Discount (₹500 if installed)",
                rule_type="discount",
                expression={"op": "mul", "args": [{"var": "has_anti_theft"}, {"const": 500}]},
                priority=35,
                active=True,
            ),
            PricingRule(
                product_id=product.id,
                name="GST @ 18%",
                rule_type="tax",
                expression={
                    "op": "mul",
                    "args": [
                        {"op": "add", "args": [
                            {"op": "mul", "args": [{"var": "idv"}, {"const": 0.028}]},
                            {"op": "mul", "args": [{"var": "engine_capacity_cc"}, {"const": 0.80}]},
                            {"op": "mul", "args": [{"var": "vehicle_age_years"}, {"const": 700}]},
                        ]},
                        {"const": 0.18},
                    ],
                },
                priority=40,
                active=True,
            ),
        ]
        db.add_all(rules)

        addons = [
            AddOn(product_id=product.id, name="Zero Depreciation", premium_flat_amount=1650.0, active=True),
            AddOn(product_id=product.id, name="Engine Protection", premium_flat_amount=1100.0, active=True),
            AddOn(product_id=product.id, name="Key Replacement", premium_flat_amount=350.0, active=True),
            AddOn(product_id=product.id, name="Tyre Protection", premium_flat_amount=500.0, active=True),
            AddOn(product_id=product.id, name="Consumables Cover", premium_flat_amount=400.0, active=True),
        ]
        db.add_all(addons)

        db.commit()
        print(f"Seeded product '{product.name}' (id={product.id}) with {len(rules)} pricing rules and {len(addons)} add-ons.")

finally:
    db.close()
