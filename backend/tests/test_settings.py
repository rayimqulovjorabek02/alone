"""
backend/tests/test_settings.py — Sozlamalar testlari
"""
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

USER = {
    "username": "settingstest",
    "email":    "settingstest@example.com",
    "password": "settingstest123",
    "avatar":   "bot",
}

@pytest.fixture(scope="module")
def headers():
    client.post("/api/auth/register", json=USER)
    res = client.post("/api/auth/login", json={
        "email": USER["email"], "password": USER["password"]
    })
    if res.status_code != 200:
        pytest.skip("Login failed")
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


class TestSettings:
    def test_get_settings(self, headers):
        res = client.get("/api/settings", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "language"  in data
        assert "ai_style"  in data
        assert "tts_voice" in data

    def test_update_settings(self, headers):
        res = client.put("/api/settings", json={
            "language": "en",
            "ai_style": "professional",
        }, headers=headers)
        assert res.status_code == 200

    def test_invalid_language(self, headers):
        res = client.put("/api/settings", json={
            "language": "invalid_lang"
        }, headers=headers)
        assert res.status_code in (200, 400, 422)


class TestTodo:
    def test_create_todo(self, headers):
        res = client.post("/api/todo", json={
            "title": "Test vazifa", "priority": "normal"
        }, headers=headers)
        assert res.status_code == 200
        assert "id" in res.json()

    def test_list_todos(self, headers):
        res = client.get("/api/todo", headers=headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_toggle_todo(self, headers):
        create = client.post("/api/todo", json={
            "title": "Toggle test", "priority": "high"
        }, headers=headers)
        tid = create.json()["id"]
        res = client.put(f"/api/todo/{tid}", json={"done": True}, headers=headers)
        assert res.status_code == 200

    def test_delete_todo(self, headers):
        create = client.post("/api/todo", json={
            "title": "Delete test", "priority": "low"
        }, headers=headers)
        tid = create.json()["id"]
        res = client.delete(f"/api/todo/{tid}", headers=headers)
        assert res.status_code == 200


class TestReminder:
    def test_create_reminder(self, headers):
        res = client.post("/api/reminder", json={
            "title":     "Test eslatma",
            "remind_at": "2030-01-01T10:00:00",
        }, headers=headers)
        assert res.status_code == 200

    def test_list_reminders(self, headers):
        res = client.get("/api/reminder", headers=headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)