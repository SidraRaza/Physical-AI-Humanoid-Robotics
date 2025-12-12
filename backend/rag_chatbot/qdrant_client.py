# Qdrant Vector Database Client
# Handles connection and operations with Qdrant for vector storage

from typing import List, Dict, Any, Optional
import os

# Try to import qdrant_client
try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import (
        Distance,
        VectorParams,
        PointStruct,
        Filter,
        FieldCondition,
        MatchValue,
    )
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    QdrantClient = None


class QdrantManager:
    """
    Manager for Qdrant vector database operations.

    Provides a clean interface for:
    - Collection management
    - Vector indexing (upsert)
    - Vector search
    - Metadata filtering
    """

    def __init__(
        self,
        host: Optional[str] = None,
        api_key: Optional[str] = None,
        collection_name: str = "ai_textbook",
    ):
        """
        Initialize the Qdrant manager.

        Args:
            host: Qdrant server host URL (or from QDRANT_HOST env)
            api_key: Qdrant API key (or from QDRANT_API_KEY env)
            collection_name: Name of the collection to use
        """
        if not QDRANT_AVAILABLE:
            raise RuntimeError(
                "qdrant-client package not installed. "
                "Install with: pip install qdrant-client"
            )

        self.host = host or os.getenv("QDRANT_HOST", "localhost")
        self.api_key = api_key or os.getenv("QDRANT_API_KEY")
        self.collection_name = collection_name

        # Initialize client
        if self.api_key:
            # Cloud Qdrant
            self.client = QdrantClient(url=self.host, api_key=self.api_key)
        else:
            # Local Qdrant
            self.client = QdrantClient(host=self.host, port=6333)

    def ensure_collection(
        self,
        vector_size: int = 768,
        distance: str = "cosine",
        recreate: bool = False,
    ) -> bool:
        """
        Ensure the collection exists with proper configuration.

        Args:
            vector_size: Dimension of vectors to store
            distance: Distance metric ('cosine', 'dot', 'euclidean')
            recreate: Whether to recreate if exists

        Returns:
            True if collection was created, False if it already existed
        """
        distance_map = {
            "cosine": Distance.COSINE,
            "dot": Distance.DOT,
            "euclidean": Distance.EUCLID,
        }

        # Check if collection exists
        collections = self.client.get_collections().collections
        exists = any(c.name == self.collection_name for c in collections)

        if exists:
            if recreate:
                self.client.delete_collection(self.collection_name)
            else:
                return False

        # Create collection
        self.client.create_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(
                size=vector_size,
                distance=distance_map.get(distance, Distance.COSINE),
            ),
        )

        return True

    def upsert(
        self,
        ids: List[str],
        vectors: List[List[float]],
        payloads: List[Dict[str, Any]],
    ) -> int:
        """
        Insert or update vectors in the collection.

        Args:
            ids: List of unique identifiers
            vectors: List of embedding vectors
            payloads: List of metadata dictionaries

        Returns:
            Number of vectors upserted
        """
        points = [
            PointStruct(
                id=hash(id_) % (2**63),  # Convert string to int ID
                vector=vector,
                payload={"original_id": id_, **payload},
            )
            for id_, vector, payload in zip(ids, vectors, payloads)
        ]

        self.client.upsert(
            collection_name=self.collection_name,
            points=points,
        )

        return len(points)

    def upsert_single(
        self,
        id_: str,
        vector: List[float],
        payload: Dict[str, Any],
    ) -> None:
        """
        Insert or update a single vector.

        Args:
            id_: Unique identifier
            vector: Embedding vector
            payload: Metadata dictionary
        """
        self.upsert([id_], [vector], [payload])

    def search(
        self,
        query_vector: List[float],
        limit: int = 5,
        score_threshold: float = 0.0,
        filter_conditions: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Search for similar vectors.

        Args:
            query_vector: Query embedding vector
            limit: Maximum number of results
            score_threshold: Minimum similarity score
            filter_conditions: Metadata filter conditions

        Returns:
            List of search results with payload and score
        """
        # Build filter if provided
        query_filter = None
        if filter_conditions:
            conditions = [
                FieldCondition(key=key, match=MatchValue(value=value))
                for key, value in filter_conditions.items()
            ]
            query_filter = Filter(must=conditions)

        # Execute search
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            query_filter=query_filter,
            limit=limit,
            score_threshold=score_threshold,
        )

        # Format results
        return [
            {
                "id": hit.payload.get("original_id", str(hit.id)),
                "score": hit.score,
                "payload": hit.payload,
            }
            for hit in results
        ]

    def delete(
        self,
        ids: Optional[List[str]] = None,
        filter_conditions: Optional[Dict[str, Any]] = None,
    ) -> int:
        """
        Delete vectors from the collection.

        Args:
            ids: List of IDs to delete
            filter_conditions: Metadata filter for deletion

        Returns:
            Number of vectors deleted (estimated)
        """
        if ids:
            int_ids = [hash(id_) % (2**63) for id_ in ids]
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=int_ids,
            )
            return len(ids)

        if filter_conditions:
            conditions = [
                FieldCondition(key=key, match=MatchValue(value=value))
                for key, value in filter_conditions.items()
            ]
            query_filter = Filter(must=conditions)
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=query_filter,
            )
            return -1  # Unknown count

        return 0

    def get_collection_info(self) -> Dict[str, Any]:
        """
        Get information about the collection.

        Returns:
            Collection statistics and configuration
        """
        try:
            info = self.client.get_collection(self.collection_name)
            return {
                "name": self.collection_name,
                "vectors_count": info.points_count,
                "vectors_size": info.vectors_count,
                "status": info.status.value if info.status else "unknown",
            }
        except Exception as e:
            return {
                "name": self.collection_name,
                "error": str(e),
            }

    def drop_collection(self) -> bool:
        """
        Delete the entire collection.

        Returns:
            True if deleted successfully
        """
        try:
            self.client.delete_collection(self.collection_name)
            return True
        except Exception:
            return False


def get_qdrant_manager(
    collection_name: str = "ai_textbook",
) -> Optional[QdrantManager]:
    """
    Get a Qdrant manager instance if available.

    Args:
        collection_name: Name of the collection

    Returns:
        QdrantManager instance or None if not available
    """
    if not QDRANT_AVAILABLE:
        return None

    try:
        return QdrantManager(collection_name=collection_name)
    except Exception:
        return None


def is_qdrant_available() -> bool:
    """Check if Qdrant is available and configured."""
    if not QDRANT_AVAILABLE:
        return False

    try:
        manager = QdrantManager()
        manager.client.get_collections()
        return True
    except Exception:
        return False
