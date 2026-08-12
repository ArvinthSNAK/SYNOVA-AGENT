# Security Notes (structural placeholders)

- JWT-based authentication with access + refresh tokens (apps/backend/app/auth).
- Role-based authorization enforced via `auth/dependencies.py` and `auth/roles.py`.
- Wallet phone-number verification must be combined with authenticated identity
  and explicit consent — never a standalone lookup key.
- Automation Service never receives unrestricted control from AI components;
  all jobs pass through validation and require user confirmation before any
  final submission to a third-party site.
- No component is designed to bypass CAPTCHA, MFA, anti-bot protections, or
  rate limiting on third-party sites.
