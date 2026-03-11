"""security.py — security_utils.py ga ko'chirildi"""
from core.security_utils import (  # noqa
    pwd_context, hash_password, verify_password, is_strong_password,
    is_valid_email, sanitize_input, check_sql_injection, check_xss,
    generate_token, generate_code, hash_token,
)
hash   = hash_password
verify = verify_password