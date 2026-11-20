import os
from typing import List
from google.cloud import discoveryengine_v1beta
from backend.core.config import settings
import logging

logger = logging.getLogger(__name__)

def _init_client():
    """Initialize a DiscoveryEngine SearchService client.
    Uses environment variables defined in Settings.
    """
    try:
        client = discoveryengine_v1beta.SearchServiceClient()
        return client
    except Exception as e:
        logger.error(f"Failed to create DiscoveryEngine client: {e}")
        raise

def retrieve_documents(query: str, max_results: int = 5) -> List[str]:
    """Retrieve relevant legal documents from Vertex AI Search.

    Args:
        query: User's natural‑language query.
        max_results: Number of document snippets to return.

    Returns:
        List of document text snippets.
    """
    client = _init_client()
    # Build the full resource name for the data store.
    data_store = f"projects/{settings.GCP_PROJECT_ID}/locations/{settings.VERTEX_SEARCH_LOCATION}/collections/default_collection/dataStores/{settings.VERTEX_SEARCH_DATA_STORE_ID}"
    serving_config = f"projects/{settings.GCP_PROJECT_ID}/locations/{settings.VERTEX_SEARCH_LOCATION}/collections/default_collection/dataStores/{settings.VERTEX_SEARCH_DATA_STORE_ID}/servingConfigs/{settings.VERTEX_SEARCH_SERVING_CONFIG}"
    request = discoveryengine_v1beta.SearchRequest(
        serving_config=serving_config,
        query=query,
        page_size=max_results,
    )
    try:
        response = client.search(request=request)
        docs = []
        for result in response:
            # result.document.title and result.document.content may be optional.
            snippet = result.document.content if result.document.content else result.document.title
            if snippet:
                docs.append(snippet)
        logger.info(f"Retrieved {len(docs)} documents for query '{query}'.")
        return docs
    except Exception as e:
        logger.exception(f"Error during Vertex AI Search: {e}")
        return []
