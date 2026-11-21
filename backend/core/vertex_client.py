import os
import logging
from typing import Optional
from backend.core.config import settings

logger = logging.getLogger("nyayshield.vertex")

_genai_client = None


def get_genai_client():
    """
    Returns a unified google-genai Client configured for Google GenAI / Vertex AI.
    Adheres strictly to the Google Startup Buildathon India 2026 Credit-Safe Rule:
    - Serverless pay-per-token calls only.
    - Never provisions dedicated GPU endpoints.
    - Seamless fallback between Developer API Key and Vertex AI Project.
    """
    global _genai_client
    if _genai_client is not None:
        return _genai_client

    try:
        from google import genai
        from google.genai import types

        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        project_id = settings.GCP_PROJECT_ID or os.getenv("GCP_PROJECT_ID")
        location = settings.GCP_LOCATION or os.getenv("GCP_LOCATION", "us-central1")

        http_opts = types.HttpOptions(timeout=35000)

        # Route via Vertex AI when USE_VERTEXAI=true (supports both Project/Location and Vertex AI Express API keys AQ.*)
        if settings.USE_VERTEXAI:
            if project_id and project_id.strip():
                logger.info(f"Initializing google-genai Vertex AI client (Project: {project_id}, Region: {location})")
                _genai_client = genai.Client(
                    vertexai=True,
                    project=project_id.strip(),
                    location=location,
                    http_options=http_opts,
                )
                return _genai_client
            elif api_key and len(api_key.strip()) > 10:
                logger.info("Initializing google-genai Vertex AI Express client (vertexai=True, api_key)")
                _genai_client = genai.Client(
                    vertexai=True,
                    api_key=api_key.strip(),
                    http_options=http_opts,
                )
                return _genai_client

        # Fallback to Developer API (vertexai=False) when USE_VERTEXAI=false
        if api_key and len(api_key.strip()) > 10:
            logger.info("Initializing google-genai Developer API client (vertexai=False, api_key)")
            _genai_client = genai.Client(
                vertexai=False,
                api_key=api_key.strip(),
                http_options=http_opts,
            )
            return _genai_client
        elif project_id and project_id.strip():
            logger.info(f"Initializing google-genai Vertex AI client (Project: {project_id}, Region: {location})")
            _genai_client = genai.Client(
                vertexai=True,
                project=project_id.strip(),
                location=location,
                http_options=http_opts,
            )
            return _genai_client
        else:
            logger.warning("No GEMINI_API_KEY or GCP_PROJECT_ID provided; falling back to dynamic failsafe engine.")
            return None
    except Exception as e:
        logger.error(f"Failed to initialize google-genai client: {e}")
        return None
