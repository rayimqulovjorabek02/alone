"""security_log.py — security_utils.py ga ko'chirildi"""
from core.security_utils import (  # noqa
    log_failed_login, log_injection_attempt, log_blocked_ip,
    log_limit_exceeded, log_admin_action, log_payment,
)