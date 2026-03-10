"""
backend/app/core/security_log.py — Xavfsizlik hodisalarini qayd etish
"""
import logging
from datetime import datetime

sec_logger = logging.getLogger('alone-ai.security')


def log_failed_login(email: str, ip: str = "unknown"):
    sec_logger.warning(f"FAILED_LOGIN | email={email} | ip={ip} | time={datetime.utcnow()}")


def log_injection_attempt(user_id: int, message: str):
    sec_logger.warning(f"INJECTION_ATTEMPT | user={user_id} | msg={message[:100]}")


def log_limit_exceeded(user_id: int, resource: str):
    sec_logger.info(f"LIMIT_EXCEEDED | user={user_id} | resource={resource}")


def log_admin_action(admin_id: int, action: str, target_id: int = 0):
    sec_logger.info(f"ADMIN_ACTION | admin={admin_id} | action={action} | target={target_id}")


def log_payment(user_id: int, plan: str, status: str):
    sec_logger.info(f"PAYMENT | user={user_id} | plan={plan} | status={status}")