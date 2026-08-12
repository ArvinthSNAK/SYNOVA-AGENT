# API Contracts

All REST APIs are versioned under `/api/v1/`.

## Conventions
- Requests/responses defined via Pydantic schemas in each service's `schemas/` folder.
- Shared cross-service contracts live in `packages/shared-python/api_contracts/`
  and `packages/shared-types/` (frontend-facing).
- Internal service-to-service calls go through `integrations/*_client` modules —
  never direct DB access across service boundaries.

## Planned Endpoint Groups (to be implemented)
- `/api/v1/auth/*`
- `/api/v1/users/*`
- `/api/v1/wallet/*`
- `/api/v1/policies/*`
- `/api/v1/renewals/*`
- `/api/v1/claims/*`
- `/api/v1/applications/*`
- `/api/v1/chat/*` (chatbot-service)
- `/api/v1/voice-sessions/*` (voice-agent-service)
- `/api/v1/automation-jobs/*` (automation-service)
