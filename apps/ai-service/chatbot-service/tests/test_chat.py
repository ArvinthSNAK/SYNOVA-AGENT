"""
tests/test_chat.py

Run with:  pytest -v

These tests don't hit real OpenAI — they check auth behavior and
input validation, which don't require network access. If you want to
test the actual /chat reply, mock app.integrations.openai_client.get_chat_completion.
"""

import os

os.environ.setdefault("OPENAI_API_KEY", "sk-test-dummy")
os.environ.setdefault("API_KEYS", "test-key-123")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_no_auth_needed():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_chat_without_api_key_is_rejected():
    resp = client.post("/api/v1/chat", json={"session_id": "s1", "message": "hi"})
    assert resp.status_code == 401


def test_chat_with_wrong_api_key_is_rejected():
    resp = client.post(
        "/api/v1/chat",
        json={"session_id": "s1", "message": "hi"},
        headers={"X-API-Key": "wrong-key"},
    )
    assert resp.status_code == 403


def test_chat_with_empty_message_is_rejected():
    resp = client.post(
        "/api/v1/chat",
        json={"session_id": "s1", "message": ""},
        headers={"X-API-Key": "test-key-123"},
    )
    assert resp.status_code in (400, 422)
