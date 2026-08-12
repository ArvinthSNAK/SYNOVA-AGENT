# Environment Configuration

Each service owns its own `.env.example`. Real `.env` files are never committed.

| Service | Key variables (examples, not implemented yet) |
|---|---|
| frontend | `VITE_API_BASE_URL` |
| backend | `DATABASE_URL` (Neon Postgres), `NOSQL_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` |
| chatbot-service | `AI_PROVIDER_API_KEY`, `BACKEND_API_URL` |
| voice-agent-service | `DEEPGRAM_API_KEY`, `BACKEND_API_URL`, `CHATBOT_API_URL` |
| automation-service | `BACKEND_API_URL`, `PLAYWRIGHT_HEADLESS`, `AUTOMATION_ARTIFACTS_PATH` |

No sensitive backend secrets, DB credentials, or private API keys are ever
placed in frontend environment variables.
