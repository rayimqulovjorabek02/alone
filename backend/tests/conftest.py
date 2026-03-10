"""
backend/tests/conftest.py — Pytest konfiguratsiya
"""
import pytest
import os
import sys
import tempfile

# Test uchun alohida DB
TEST_DB = tempfile.mktemp(suffix='.db')
os.environ['DB_PATH']     = TEST_DB
os.environ['JWT_SECRET']  = 'test-secret-key-for-testing-only'
os.environ['GROQ_API_KEY'] = 'test-key'

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))


def pytest_configure(config):
    """Test boshlanishida DB yaratish."""
    try:
        from database import init_db
        init_db()
    except Exception as e:
        print(f"DB init xato: {e}")


def pytest_sessionfinish(session, exitstatus):
    """Test tugagach DB faylini o'chirish."""
    try:
        if os.path.exists(TEST_DB):
            os.remove(TEST_DB)
    except Exception:
        pass