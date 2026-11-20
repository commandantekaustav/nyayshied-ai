import hashlib
import re
from typing import Any, Dict
from cryptography.fernet import Fernet
from backend.core.config import settings

# Initialize Fernet cipher
_fernet_instance: Fernet | None = None


def get_fernet() -> Fernet:
    global _fernet_instance
    if _fernet_instance is None:
        key = settings.FERNET_KEY.encode()
        _fernet_instance = Fernet(key)
    return _fernet_instance


def encrypt_text(text: str) -> str:
    """
    Encrypt sensitive plaintext using AES-128-CBC + HMAC (Fernet specification).
    Lifts security pattern from _ref_clause_n_effect/src/utils/security.py.
    """
    if not text:
        return text
    try:
        f = get_fernet()
        return f.encrypt(text.encode("utf-8")).decode("utf-8")
    except Exception as e:
        return f"[ENCRYPTION_ERROR: {str(e)}]"


def decrypt_text(token: str) -> str:
    """Decrypt a Fernet cipher token back to plaintext."""
    if not token or token.startswith("[ENCRYPTION_ERROR"):
        return token
    try:
        f = get_fernet()
        return f.decrypt(token.encode("utf-8")).decode("utf-8")
    except Exception:
        return "[DECRYPTION_ERROR: Invalid token or key mismatch]"


def scrub_pii(text: str) -> str:
    """
    Scrub identifiable PII from customer claims before sending to LLM or public storage.
    Lifts and strengthens regex masking patterns from _ref_clause_n_effect/src/utils/pii_scrubber.py.
    """
    if not text:
        return text

    # Email
    text = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[EMAIL]', text)
    # Phone Numbers (Indian 10-12 digits with optional +91 or 0 prefix)
    text = re.sub(r'(?:\+91[\-\s]?)?[6-9]\d{9}', '[PHONE]', text)
    text = re.sub(r'\+?\d{10,12}', '[PHONE]', text)
    # URLs
    text = re.sub(r'https?://\S+|www\.\S+', '[URL]', text)
    # Aadhaar number (4 4 4 digits)
    text = re.sub(r'\b\d{4}\s\d{4}\s\d{4}\b', '[AADHAAR]', text)
    # PAN Card number
    text = re.sub(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b', '[PAN]', text)
    # Indian PIN Codes (6 digits)
    text = re.sub(r'\b[1-9][0-9]{5}\b', '[PINCODE]', text)

    return text


def compute_sha256(data: bytes) -> str:
    """Compute cryptographic SHA-256 hash of frame/file bytes for legal evidence lock."""
    return hashlib.sha256(data).hexdigest()
