"""Qdrant client, collections and the embedding model.

All Wasila data lives in one Qdrant instance, split into collections.
Only `procedures` is read by the chatbot; it must never hold member data.
"""

import os
import uuid
from functools import lru_cache

from dotenv import load_dotenv
from fastembed import TextEmbedding
from qdrant_client import QdrantClient, models

load_dotenv()

PROCEDURES = "procedures"
MEMBERS = "members"
DOCUMENTS = "documents"
APPOINTMENTS = "appointments"
APPLICATIONS = "applications"
AUDIT_LOG = "audit_log"

DEFAULT_EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"


@lru_cache(maxsize=1)
def get_client() -> QdrantClient:
    """Qdrant server if QDRANT_URL is set, else embedded Qdrant on disk."""
    url = os.getenv("QDRANT_URL", "").strip()
    if url:
        return QdrantClient(url=url, api_key=os.getenv("QDRANT_API_KEY") or None)
    return QdrantClient(path=os.getenv("QDRANT_PATH", "data/qdrant"))


@lru_cache(maxsize=1)
def get_embedder() -> TextEmbedding:
    return TextEmbedding(os.getenv("EMBEDDING_MODEL") or DEFAULT_EMBEDDING_MODEL)


def embed(texts: list[str]) -> list[list[float]]:
    return [vector.tolist() for vector in get_embedder().embed(texts)]


def vector_size() -> int:
    return len(embed(["size probe"])[0])


def ensure_collection(name: str, client: QdrantClient | None = None) -> None:
    client = client or get_client()
    if not client.collection_exists(name):
        client.create_collection(
            collection_name=name,
            vectors_config=models.VectorParams(size=vector_size(), distance=models.Distance.COSINE),
        )


def point_id(key: str) -> str:
    """Stable point id from a readable key, so re-ingesting replaces instead of duplicating."""
    return str(uuid.uuid5(uuid.NAMESPACE_URL, key))
