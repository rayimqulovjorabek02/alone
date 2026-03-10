"""
backend/tests/test_chat.py — Chat testlari
"""
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

USER = {
    "username": "chattest",
    "email":    "chattest@example.com",
    "password": "chattest123",
    "avatar":   "bot",
}

@pytest.fixture(scope="module")
def auth_token():
    client.post("/api/auth/register", json=USER)
    res = client.post("/api/auth/login", json={
        "email": USER["email"], "password": USER["password"]
    })
    if res.status_code != 200:
        pytest.skip("Login failed")
    return res.json()["access_token"]


@pytest.fixture(scope="module")
def headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


class TestSessions:
    def test_create_session(self, headers):
        res = client.post("/api/chat/sessions", headers=headers)
        assert res.status_code == 200
        assert "id" in res.json()

    def test_list_sessions(self, headers):
        res = client.get("/api/chat/sessions", headers=headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_get_session_messages(self, headers):
        # Sessiya yaratib, xabarlarini olamiz
        sess = client.post("/api/chat/sessions", headers=headers)
        sid  = sess.json()["id"]
        res  = client.get(f"/api/chat/sessions/{sid}/messages", headers=headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_delete_session(self, headers):
        sess = client.post("/api/chat/sessions", headers=headers)
        sid  = sess.json()["id"]
        res  = client.delete(f"/api/chat/sessions/{sid}", headers=headers)
        assert res.status_code == 200


class TestUsageStats:
    def test_usage_limits(self, headers):
        res = client.get("/api/dashboard/stats", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "messages_today" in data
        assert "messages_limit"  in data
        assert "plan"            in data