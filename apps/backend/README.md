# Backend API — AI Insurance Agent Platform

Python + FastAPI backend for the SYNOVA Insurance Agent / Aggregation Platform.

## Architecture

```
Backend API (port 8000)
├── Auth Service         POST /api/v1/auth/register, /login
├── Applications         POST /api/v1/applications/new, /renewal
├── Documents/PDF        POST /api/v1/documents/upload, /{id}/analyze
├── Quotes               POST /api/v1/quotes/calculate, /multi-quote, /multi-quote/recommend
├── Policies             GET  /api/v1/policies
├── Insurance Vault      GET  /api/v1/customers/{id}/insurance-vault
├── Notifications        GET  /api/v1/notifications/{id}
├── Renewals             POST /api/v1/renewals/initiate
└── Admin                POST /api/v1/admin/insurers, /products, /pricing-rules

Automation Service (port 8001)
├── Playwright adapters for 4 mock insurers
└── POST /automation/run

Mock Insurers (ports 9001-9004)
├── Insurer A — Comprehensive Motor Cover (3% base, NCB discount)
├── Insurer B — SecureDrive Motor Plan (2.5% base, high age loading, no NCB)
├── Insurer C — TrustShield Comprehensive (3.5% base + TP, generous NCB)
└── Insurer D — SafeGuard Premium Motor (2.8% base, engine-capacity loading, anti-theft discount)
```

## Key Design Principles

- **Nothing hardcoded** — all pricing, products, coverages, add-ons, and rules are database-driven
- **Expression-based pricing engine** — JSON expression trees evaluated at runtime
- **Configurable IDV** — depreciation table driven
- **Configurable NCB** — slab-based, resetable on claims
- **Transparent recommendations** — weighted scoring with explanations

## Quick Start

```bash
# Install dependencies
cd apps/backend && pip install -r requirements.txt
cd apps/automation-service && pip install -r requirements.txt
cd apps/mock-insurers/insurer-a && pip install -r requirements.txt
# (same for insurer-b, insurer-c, insurer-d)

# Install Playwright browsers
playwright install chromium

# Seed databases
cd apps/mock-insurers/insurer-a && python -m seed_data
cd apps/mock-insurers/insurer-b && python -m seed_data
cd apps/mock-insurers/insurer-c && python -m seed_data
cd apps/mock-insurers/insurer-d && python -m seed_data
cd apps/backend && python -m seed_data

# Run everything (or use the script)
bash apps/run_platform.sh
```

## API Flow — Get Quotes from All Insurers

```
POST /api/v1/quotes/multi-quote/recommend
{
  "customer_name": "John Doe",
  "vehicle_registration": "KA01AB1234",
  "idv": 700000,
  "vehicle_age_years": 3,
  "ncb_percent": 25,
  "engine_capacity_cc": 1497,
  "has_anti_theft": 1
}
```

Returns ranked quotes with:
- Per-insurer premium breakdown
- Normalized scores (price, coverage, IDV, deductible, add-ons)
- Recommended policy with explanation
- Coverage gaps
- Why other policies ranked lower

## Services

| Service | Purpose |
|---------|---------|
| Pricing Engine | Evaluates JSON expression rules per product |
| IDV Calculator | Depreciation-based IDV computation |
| NCB Calculator | Claim-history-based NCB slab lookup |
| Comparison Engine | Normalizes and scores quotes across dimensions |
| Recommendation Engine | Generates human-readable policy recommendation |
| PDF Extraction | PyMuPDF + EasyOCR for policy document parsing |
| Notification Service | Alerts customers when beneficial new products are added |
| Wallet/Vault | Centralized view of all customer policies by type |

## Tech Stack

- **FastAPI** — async REST API
- **SQLAlchemy** — ORM (SQLite for dev, PostgreSQL for prod)
- **Playwright** — browser automation for mock insurer form filling
- **PyMuPDF + EasyOCR** — PDF text extraction and OCR
- **Pydantic** — request/response validation

## Environment Variables

```
DATABASE_URL=sqlite:///./dev.db
AUTOMATION_SERVICE_URL=http://localhost:8001
SECRET_KEY=your-secret-key
```
