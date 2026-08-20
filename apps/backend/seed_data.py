"""
Seed script for the main backend database.
Populates insurers, products, pricing rules, pricing factors, add-ons,
demo user, and customer insurance vault policies across Motor, Health, and Term.

Run: python -m seed_data  (from apps/backend/)
"""
from datetime import datetime, timedelta
from app.db.postgres.session import SessionLocal, engine
from app.db.postgres.base import Base
from app.models.insurer_model import Insurer
from app.models.insurance_product_model import InsuranceProduct
from app.models.pricing_rule_model import PricingRule
from app.models.pricing_factor_model import PricingFactor
from app.models.add_on_model import AddOn
from app.models.user_model import User
from app.models.policy_model import Policy
from app.models.policy_version_model import PolicyVersion
from app.models.application_model import Application
from app.models.notification_model import Notification
from app.models.provider_model import InsurerProvider

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    existing = db.query(Insurer).first()
    if existing:
        print("Database already seeded. Skipping initial seed.")
    else:
        # --- 1. Insurers ---
        insurers = [
            Insurer(name="ICICI Lombard General Insurance", code="insurer_a", description="Comprehensive motor & health specialist with wide cashless network.", active=True),
            Insurer(name="Acko General Insurance", code="insurer_b", description="Digital-first zero commission direct insurance provider.", active=True),
            Insurer(name="TATA AIG Auto Protect", code="insurer_c", description="Premium coverage with claims support and 24/7 roadside assistance.", active=True),
            Insurer(name="HDFC Ergo Motor Shield", code="insurer_d", description="Robust vehicle protection with quick claim settlement.", active=True),
        ]
        db.add_all(insurers)
        db.flush()

        insurer_map = {i.code: i.id for i in insurers}

        # --- Providers ---
        providers = [
            InsurerProvider(code="insurer_a", name="ICICI Lombard", website_url="http://localhost:8001", automation_enabled=True, active=True),
            InsurerProvider(code="insurer_b", name="Acko Drive", website_url="http://localhost:8002", automation_enabled=True, active=True),
            InsurerProvider(code="insurer_c", name="TATA AIG", website_url="http://localhost:8003", automation_enabled=True, active=True),
            InsurerProvider(code="insurer_d", name="HDFC Ergo", website_url="http://localhost:8004", automation_enabled=True, active=True),
        ]
        db.add_all(providers)
        db.flush()

        # --- 2. Insurance Products ---
        products = [
            InsuranceProduct(
                insurer_id=insurer_map["insurer_a"],
                name="ICICI Lombard Comprehensive Motor",
                insurance_type="motor",
                description="3% Base OD rate with full NCB discount and low deductible.",
                base_rate=3.0,
                minimum_premium=4500,
                maximum_premium=250000,
                active=True,
            ),
            InsuranceProduct(
                insurer_id=insurer_map["insurer_b"],
                name="Acko Smart Drive Secure",
                insurance_type="motor",
                description="2.5% Direct-to-consumer base rate with zero paperwork.",
                base_rate=2.5,
                minimum_premium=3800,
                maximum_premium=180000,
                active=True,
            ),
            InsuranceProduct(
                insurer_id=insurer_map["insurer_c"],
                name="TATA AIG Auto Secure Plus",
                insurance_type="motor",
                description="3.2% Premium plan with high IDV cover and roadside protection.",
                base_rate=3.2,
                minimum_premium=5000,
                maximum_premium=280000,
                active=True,
            ),
            InsuranceProduct(
                insurer_id=insurer_map["insurer_d"],
                name="HDFC Ergo Motor Protection",
                insurance_type="motor",
                description="2.8% Base rate with anti-theft discount and engine protection.",
                base_rate=2.8,
                minimum_premium=4200,
                maximum_premium=220000,
                active=True,
            ),
        ]
        db.add_all(products)
        db.flush()

        prod_a, prod_b, prod_c, prod_d = products[0], products[1], products[2], products[3]

        # --- 3. Dynamic Pricing Rules (AST Expressions) ---
        rules = [
            # Insurer A Rules
            PricingRule(product_id=prod_a.id, name="Base OD Premium (3.0% IDV)", rule_type="base",
                        expression={"op": "mul", "args": [{"var": "vehicle.idv"}, {"const": 0.030}]}, priority=10, active=True),
            PricingRule(product_id=prod_a.id, name="Vehicle Age Loading (₹450/year)", rule_type="loading",
                        expression={"op": "mul", "args": [{"var": "vehicle.age_years"}, {"const": 450}]}, priority=20, active=True),
            PricingRule(product_id=prod_a.id, name="NCB Discount", rule_type="discount",
                        expression={"op": "mul", "args": [
                            {"op": "mul", "args": [{"var": "vehicle.idv"}, {"const": 0.030}]},
                            {"op": "div", "args": [{"var": "driver.ncb_percent"}, {"const": 100}]}
                        ]}, priority=30, active=True),

            # Insurer B Rules
            PricingRule(product_id=prod_b.id, name="Base OD Premium (2.5% IDV)", rule_type="base",
                        expression={"op": "mul", "args": [{"var": "vehicle.idv"}, {"const": 0.025}]}, priority=10, active=True),
            PricingRule(product_id=prod_b.id, name="Vehicle Age Loading (₹400/year)", rule_type="loading",
                        expression={"op": "mul", "args": [{"var": "vehicle.age_years"}, {"const": 400}]}, priority=20, active=True),
            PricingRule(product_id=prod_b.id, name="NCB Discount", rule_type="discount",
                        expression={"op": "mul", "args": [
                            {"op": "mul", "args": [{"var": "vehicle.idv"}, {"const": 0.025}]},
                            {"op": "div", "args": [{"var": "driver.ncb_percent"}, {"const": 100}]}
                        ]}, priority=30, active=True),

            # Insurer C Rules
            PricingRule(product_id=prod_c.id, name="Base OD Premium (3.2% IDV)", rule_type="base",
                        expression={"op": "mul", "args": [{"var": "vehicle.idv"}, {"const": 0.032}]}, priority=10, active=True),
            PricingRule(product_id=prod_c.id, name="Vehicle Age Loading (₹500/year)", rule_type="loading",
                        expression={"op": "mul", "args": [{"var": "vehicle.age_years"}, {"const": 500}]}, priority=20, active=True),
            PricingRule(product_id=prod_c.id, name="NCB Discount", rule_type="discount",
                        expression={"op": "mul", "args": [
                            {"op": "mul", "args": [{"var": "vehicle.idv"}, {"const": 0.032}]},
                            {"op": "div", "args": [{"var": "driver.ncb_percent"}, {"const": 100}]}
                        ]}, priority=30, active=True),

            # Insurer D Rules
            PricingRule(product_id=prod_d.id, name="Base OD Premium (2.8% IDV)", rule_type="base",
                        expression={"op": "mul", "args": [{"var": "vehicle.idv"}, {"const": 0.028}]}, priority=10, active=True),
            PricingRule(product_id=prod_d.id, name="Vehicle Age Loading (₹420/year)", rule_type="loading",
                        expression={"op": "mul", "args": [{"var": "vehicle.age_years"}, {"const": 420}]}, priority=20, active=True),
            PricingRule(product_id=prod_d.id, name="NCB Discount", rule_type="discount",
                        expression={"op": "mul", "args": [
                            {"op": "mul", "args": [{"var": "vehicle.idv"}, {"const": 0.028}]},
                            {"op": "div", "args": [{"var": "driver.ncb_percent"}, {"const": 100}]}
                        ]}, priority=30, active=True),
        ]
        db.add_all(rules)

        # --- 4. Pricing Factors ---
        factors = [
            PricingFactor(code="gst_rate", name="GST Rate (%)", value=18.0, active=True),
            PricingFactor(code="tp_base_car", name="Third Party Premium (Car)", value=2094.0, active=True),
            PricingFactor(code="tp_base_bike", name="Third Party Premium (Bike)", value=714.0, active=True),
            PricingFactor(code="ncb_max_percent", name="Maximum NCB Percent", value=50.0, active=True),
        ]
        db.add_all(factors)

        # --- 5. Add-ons ---
        addons = [
            # Insurer A Add-ons
            AddOn(product_id=prod_a.id, name="Zero Depreciation", description="Full coverage without depreciation deduction on parts replacement.", premium_calculation_method="flat", flat_amount=1500.0, active=True),
            AddOn(product_id=prod_a.id, name="Engine Protection", description="Covers engine hydrostatic lock and fluid loss damage.", premium_calculation_method="flat", flat_amount=800.0, active=True),
            AddOn(product_id=prod_a.id, name="Roadside Assistance", description="24/7 towing, battery jumpstart, and flat tyre support.", premium_calculation_method="flat", flat_amount=400.0, active=True),
            AddOn(product_id=prod_a.id, name="Return to Invoice", description="Pays full invoice value including taxes in case of total loss.", premium_calculation_method="flat", flat_amount=1200.0, active=True),

            # Insurer B Add-ons
            AddOn(product_id=prod_b.id, name="Zero Depreciation", description="100% claim on plastic, rubber, and glass parts.", premium_calculation_method="flat", flat_amount=1300.0, active=True),
            AddOn(product_id=prod_b.id, name="Roadside Assistance", description="On-demand emergency breakdown service.", premium_calculation_method="flat", flat_amount=350.0, active=True),
            AddOn(product_id=prod_b.id, name="Key & Lock Protect", description="Reimburses replacement cost for lost vehicle keys.", premium_calculation_method="flat", flat_amount=300.0, active=True),

            # Insurer C Add-ons
            AddOn(product_id=prod_c.id, name="Zero Depreciation", description="Complete zero dep coverage for bumper-to-bumper protection.", premium_calculation_method="flat", flat_amount=1600.0, active=True),
            AddOn(product_id=prod_c.id, name="Engine & Gearbox Cover", description="Shields against internal engine and transmission failure.", premium_calculation_method="flat", flat_amount=900.0, active=True),
            AddOn(product_id=prod_c.id, name="Consumables Cover", description="Covers oils, nuts, bolts, engine oil, and coolant.", premium_calculation_method="flat", flat_amount=600.0, active=True),
            AddOn(product_id=prod_c.id, name="Tyre Protection", description="Replaces damaged tyres due to cuts or bulges.", premium_calculation_method="flat", flat_amount=700.0, active=True),

            # Insurer D Add-ons
            AddOn(product_id=prod_d.id, name="Zero Depreciation", description="Zero dep benefit across all repairs.", premium_calculation_method="flat", flat_amount=1400.0, active=True),
            AddOn(product_id=prod_d.id, name="Engine Protection", description="Water ingress and lubrication leakage shield.", premium_calculation_method="flat", flat_amount=850.0, active=True),
            AddOn(product_id=prod_d.id, name="Roadside Assistance", description="Round-the-clock emergency support.", premium_calculation_method="flat", flat_amount=450.0, active=True),
        ]
        db.add_all(addons)

        # --- 6. Demo User ---
        demo_user = User(
            email="demo@example.com",
            full_name="Arvinth Kumar",
            hashed_password="demo123",
            is_active=True,
            role="customer",
        )
        db.add(demo_user)
        db.flush()

        # --- 7. Customer Insurance Vault (Motor, Health, Term/Life) ---
        now = datetime.now()
        vault_policies = [
            Policy(
                customer_id=demo_user.id,
                insurer_id=insurer_map["insurer_a"],
                product_id=prod_a.id,
                policy_number="MOT-2024-883921",
                insurance_type="motor",
                insurer_name="ICICI Lombard General Insurance",
                product_name="Comprehensive Motor Cover",
                status="active",
                premium=18500.0,
                idv=650000.0,
                coverage_amount=650000.0,
                deductible=2000.0,
                start_date=now - timedelta(days=180),
                end_date=now + timedelta(days=185),
                vehicle_registration="KA-01-MJ-4092",
                vehicle_make="Hyundai",
                vehicle_model="Creta SX",
                ncb_percent=20.0,
                addons="Roadside Assistance",
                notes="Current active motor policy. Does not have Engine Protection or Zero Dep.",
                active=True,
            ),
            Policy(
                customer_id=demo_user.id,
                insurer_id=None,
                product_id=None,
                policy_number="HLT-992014-X",
                insurance_type="health",
                insurer_name="Star Health Insurance",
                product_name="Family Optima Health Shield",
                status="active",
                premium=24500.0,
                idv=0.0,
                coverage_amount=1000000.0,
                deductible=0.0,
                start_date=now - timedelta(days=220),
                end_date=now + timedelta(days=145),
                notes="Floater health plan for self and spouse. ₹10 Lakh sum insured.",
                active=True,
            ),
            Policy(
                customer_id=demo_user.id,
                insurer_id=None,
                product_id=None,
                policy_number="TRM-551029-LIFE",
                insurance_type="term",
                insurer_name="HDFC Life Insurance",
                product_name="Click 2 Protect 3D Life",
                status="active",
                premium=32000.0,
                idv=0.0,
                coverage_amount=10000000.0,
                deductible=0.0,
                start_date=now - timedelta(days=400),
                end_date=now + timedelta(days=10200),
                notes="Term Life insurance policy with ₹1 Crore cover up to age 65.",
                active=True,
            ),
        ]
        db.add_all(vault_policies)
        db.flush()

        # Policy History Version for Motor Policy
        motor_p = vault_policies[0]
        p_version = PolicyVersion(
            policy_id=motor_p.id,
            version=1,
            data={"premium": 18500.0, "idv": 650000.0, "deductible": 2000.0, "reason": "Initial Policy Issuance 2025-2026"},
            effective_from=motor_p.start_date,
            effective_to=motor_p.end_date,
        )
        db.add(p_version)

        db.commit()
        print(f"Database seeded successfully!")
        print(f"- Insurers: {len(insurers)}")
        print(f"- Providers: {len(providers)}")
        print(f"- Products: {len(products)}")
        print(f"- Pricing Rules: {len(rules)}")
        print(f"- Pricing Factors: {len(factors)}")
        print(f"- Add-ons: {len(addons)}")
        print(f"- Customer Vault Policies: {len(vault_policies)} (Motor, Health, Term)")

finally:
    db.close()
