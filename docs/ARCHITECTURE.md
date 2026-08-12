# Architecture Overview

## Principles
- Clean separation of concerns across API / controller / service / repository layers.
- Each major capability (auth, wallet, chatbot, voice agent, automation) is an
  independently deployable service with its own environment configuration.
- The frontend communicates only through the Backend API's versioned REST
  endpoints (`/api/v1/...`). It never accesses the database or third-party
  sites directly.
- The Automation Service is isolated from the Chatbot/Voice Agent services.
  AI components produce structured, validated data; the Automation Service
  is the only component allowed to drive a browser, and only after explicit
  user confirmation.
- PostgreSQL (Neon) is the source of truth for relational insurance data.
  NoSQL stores document metadata, agent state, and other flexible data —
  never a duplicate of core relational business data.
- Large binary files (PDF, images, audio, video) are referenced via
  metadata/pointers, not stored inside the NoSQL layer.

## Module Boundaries
- apps/backend        — core REST API, auth, wallet, policy/renewal/claims domain
- apps/chatbot-service — conversational agent, intent recognition, context
- apps/voice-agent-service — STT/TTS/realtime session architecture (Deepgram-ready)
- apps/automation-service — controlled Playwright automation, job lifecycle
- packages/           — shared type/contract definitions used across services

## Security Boundaries (structural, enforced later)
- Phone-number-based lookups must always be paired with authentication,
  verification, and consent — never a bare lookup.
- No component bypasses CAPTCHA, MFA, anti-bot protections, or rate limits.
- Automation jobs require explicit user review and confirmation before
  final submission on any third-party site.
