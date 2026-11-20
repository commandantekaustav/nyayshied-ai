import os
import logging
from typing import Optional
from backend.core.config import settings

logger = logging.getLogger("nyayshield.vertex")

_genai_client = None


def get_genai_client():
    """
    Returns a unified google-genai Client configured for Vertex AI.
    Adheres strictly to the Google Startup Buildathon India 2026 Credit-Safe Rule:
    - Serverless pay-per-token Vertex AI calls only.
    - Never provisions dedicated GPU endpoints.
    """
    global _genai_client
    if _genai_client is not None:
        return _genai_client

    try:
        from google import genai
        from google.genai import types

        project_id = settings.GCP_PROJECT_ID or os.getenv("GCP_PROJECT_ID")
        location = settings.GCP_LOCATION or os.getenv("GCP_LOCATION", "us-central1")

        # 5 second timeout for fail-fast resilience in demo/offline environments
        http_opts = types.HttpOptions(timeout=5000)

        if project_id:
            logger.info(f"Initializing google-genai Vertex AI client (Project: {project_id}, Region: {location})")
            _genai_client = genai.Client(
                vertexai=True,
                project=project_id,
                location=location,
                http_options=http_opts,
            )
            return _genai_client
        elif settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY"):
            logger.info("Initializing google-genai client via Developer API Key fallback")
            _genai_client = genai.Client(
                api_key=settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY"),
                http_options=http_opts,
            )
            return _genai_client
        else:
            logger.warning("No GCP_PROJECT_ID or GEMINI_API_KEY provided; live Vertex AI calls will fall back to golden cases.")
            return None
    except Exception as e:
        logger.error(f"Failed to initialize google-genai client: {e}")
        return None
