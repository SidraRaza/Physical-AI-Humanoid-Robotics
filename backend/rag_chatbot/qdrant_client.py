# Path: backend/rag_chatbot/qdrant_client.py

# Placeholder for Qdrant client interactions, e.g., connecting, indexing, searching.

from qdrant_client import QdrantClient, models
from typing import List, Dict, Any

class QdrantManager:
    def __init__(self, host: str, api_key: str, collection_name: str = "my_ai_textbook"):
        self.client = QdrantClient(host=host, api_key=api_key)
        self.collection_name = collection_name

    def recreate_collection(self, vector_size: int = 1536, distance_metric: models.Distance = models.Distance.COSINE):
        self.client.recreate_collection(
            collection_name=self.collection_name,
            vectors_config=models.VectorParams(size=vector_size, distance=distance_metric),
        )

    def upsert_vectors(self, ids: List[str], vectors: List[List[float]], payloads: List[Dict[str, Any]]):
        self.client.upsert(
            collection_name=self.collection_name,
            points=models.Batch(ids=ids, vectors=vectors, payloads=payloads),
        )

    def search_vectors(self, query_vector: List[float], limit: int = 5, query_filter: Optional[models.Filter] = None) -> List[Dict[str, Any]]:
        search_result = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            query_filter=query_filter,
            limit=limit,
        )
        return [hit.dict() for hit in search_result]