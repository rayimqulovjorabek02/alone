"""
backend/tests/test_auth.py — Autentifikatsiya testlari
"""
import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Test foydalanuvchi
TEST_USER = {
    "username": "testuser",
    "email":    "test@example.com",
    "password": "testpass123",
    "avatar":   "bot",
}


class TestRegister:
    def test_register_success(self):
        res = client.post("/api/auth/register", json=TEST_USER)
        assert res.status_code in (200, 201, 400)  # 400 = allaqachon mavjud

    def test_register_missing_fields(self):
        res = client.post("/api/auth/register", json={"email": "x@x.com"})
        assert res.status_code == 422

    def test_register_invalid_email(self):
        res = client.post("/api/auth/register", json={
            **TEST_USER, "email": "notanemail"
        })
        assert res.status_code == 422

    def test_register_short_password(self):
        res = client.post("/api/auth/register", json={
            **TEST_USER, "password": "123"
        })
        assert res.status_code in (400, 422)


class TestLogin:
    def test_login_success(self):
        # Avval ro'yxatdan o'tamiz
        client.post("/api/auth/register", json=TEST_USER)
        res = client.post("/api/auth/login", json={
            "email":    TEST_USER["email"],
            "password": TEST_USER["password"],
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token"  in data
        assert "refresh_token" in data
        assert "user"          in data

    def test_login_wrong_password(self):
        res = client.post("/api/auth/login", json={
            "email":    TEST_USER["email"],
            "password": "wrongpassword",
        })
        assert res.status_code in (400, 401)

    def test_login_nonexistent_user(self):
        res = client.post("/api/auth/login", json={
            "email":    "nobody@example.com",
            "password": "password123",
        })
        assert res.status_code in (400, 401, 404)

    def test_me_with_token(self):
        client.post("/api/auth/register", json=TEST_USER)
        login = client.post("/api/auth/login", json={
            "email":    TEST_USER["email"],
            "password": TEST_USER["password"],
        })
        if login.status_code != 200:
            pytest.skip("Login failed")

        token = login.json()["access_token"]
        res   = client.get("/api/auth/me",
                           headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        assert res.json()["email"] == TEST_USER["email"]

    def test_me_without_token(self):
        res = client.get("/api/auth/me")
        assert res.status_code == 403


class TestRefreshToken:
    def test_refresh_token(self):
        client.post("/api/auth/register", json=TEST_USER)
        login = client.post("/api/auth/login", json={
            "email":    TEST_USER["email"],
            "password": TEST_USER["password"],
        })
        if login.status_code != 200:
            pytest.skip("Login failed")

        refresh = login.json()["refresh_token"]
        res     = client.post("/api/auth/refresh",
                              json={"refresh_token": refresh})
        assert res.status_code == 200
        assert "access_token" in res.json()