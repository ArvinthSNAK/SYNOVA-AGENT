"""
app/core/security.py

Protects every endpoint with a simple API-key header.
Clients must send:  X-API-Key: <key>

Using fastapi.security.APIKeyHeader (not a plain Header(...)) is what makes
Swagger UI render the padlock icon + "Authorize" button automatically.
"""

import secrets

from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader

from app.core.config import get_settings

settings = get_settings()

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def get_api_key(api_key: str = Security(_api_key_header)) -> str:
    """
    Dependency to be added to any route/router that must be protected.
    Compares the incoming key against the configured list using a
    constant-time comparison to avoid timing attacks.
    """
    if api_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API key. Send it in the 'X-API-Key' header.",
        )

    for valid_key in settings.api_keys_list:
        if secrets.compare_digest(api_key, valid_key):
            return api_key

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Invalid API key.",
    )
