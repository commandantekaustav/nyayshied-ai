import os
import base64
import secrets
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Base backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = BACKEND_DIR.parent

# Load .env safely from backend/.env first, then root .env as fallback
try:
    if (BACKEND_DIR / ".env").exists():
        load_dotenv(BACKEND_DIR / ".env", encoding="utf-8")
except Exception:
    pass

try:
    if (WORKSPACE_DIR / ".env").exists():
        load_dotenv(WORKSPACE_DIR / ".env", encoding="utf-8")
except Exception:
    pass


def ensure_fernet_key(existing_key: str | None) -> str:
    """Ensure a valid 32-byte urlsafe-base64 Fernet key exists."""
    if existing_key and len(existing_key.strip()) >= 32:
        try:
            # Validate base64 decoding
            decoded = base64.urlsafe_b64decode(existing_key.strip().encode())
            if len(decoded) == 32:
                return existing_key.strip()
        except Exception:
            pass
    # Auto-generate if missing or invalid
    generated = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode()
    return generated


class Settings:
    # GCP Vertex AI Config ($5 serverless pay-per-token credit safe)
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "")
    GCP_LOCATION: str = os.getenv("GCP_LOCATION", "us-central1")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Security & Encryption
    FERNET_KEY: str = ensure_fernet_key(os.getenv("FERNET_KEY"))

    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
        ).split(",")
        if origin.strip()
    ]

    # Models
    VERTEX_MODEL_ID: str = os.getenv("VERTEX_MODEL_ID", "gemini-2.5-pro")
    CRITIC_MODEL_ID: str = os.getenv("CRITIC_MODEL_ID", "gemma-3")

    # Storage paths
    METRICS_LOG_PATH: Path = BACKEND_DIR / os.getenv("METRICS_LOG_PATH", "metrics.jsonl")


settings = Settings()
