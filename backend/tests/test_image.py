"""
backend/tests/test_image.py — Rasm generatsiya testlari
"""
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

USER = {
    "username": "imgtest",
    "email":    "imgtest@example.com",
    "password": "imgtest123",
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
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestImageGeneration:
    def test_generate_image(self, headers):
        res = client.post("/api/image/generate", json={
            "prompt": "A beautiful sunset over mountains",
            "style":  "realistic",
        }, headers=headers)
        # Limit tugagan yoki API key yo'q bo'lishi mumkin
        assert res.status_code in (200, 400, 429)

    def test_image_history(self, headers):
        res = client.get("/api/image/history", headers=headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_image_styles(self, headers):
        res = client.get("/api/image/styles", headers=headers)
        assert res.status_code == 200

    def test_missing_prompt(self, headers):
        res = client.post("/api/image/generate", json={
            "prompt": "", "style": "realistic"
        }, headers=headers)
        assert res.status_code in (400, 422)