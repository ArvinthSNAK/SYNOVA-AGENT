# AI Insurance Agent — Monorepo

Production-grade, modular architecture for an AI-assisted insurance platform.
This repository currently contains **structure only** — no business, API,
database, AI, authentication, or automation logic has been implemented yet.

## Services

| Service | Path | Tech | Purpose |
|---|---|---|---|
| Frontend | `apps/frontend` | React, JS, Vite, Bun | User-facing web app (chat, voice, wallet) |
| Backend API | `apps/backend` | Python, FastAPI | Main REST API, auth, wallet, policies, DB access |
| Chatbot Service | `apps/chatbot-service` | Python, FastAPI | Conversational agent, intent & context handling |
| Voice Agent Service | `apps/voice-agent-service` | Python, FastAPI | STT/TTS/realtime voice session architecture |
| Automation Service | `apps/automation-service` | Python, Playwright | Isolated, controlled third-party form automation |
| Shared Packages | `packages/` | TS types, Python contracts | Cross-service API contracts, no duplicated logic |

## Communication Flow

```
Frontend
   ↓ REST
Backend API (FastAPI)
   ↓
Service Layer → Repository Layer → PostgreSQL (Neon) / NoSQL / Object Storage
   ↓
Internal clients → Chatbot Service / Voice Agent Service / Automation Service
```

The frontend never talks to the database directly. The AI agent never
controls the browser directly — automation runs through the isolated
Automation Service behind explicit user confirmation.

## Getting Started

Each service owns its own environment configuration (`.env.example`) and
dependency manifest. See `docs/ENVIRONMENT.md` and each service's README.

## Documentation

- `docs/ARCHITECTURE.md` — system architecture and module boundaries
- `docs/API_CONTRACTS.md` — REST API versioning and contract conventions
- `docs/ENVIRONMENT.md` — environment variable conventions per service
- `docs/SECURITY.md` — authN/authZ, data access, and automation safety rules
