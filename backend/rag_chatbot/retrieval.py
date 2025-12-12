# RAG Retrieval - Search and retrieve relevant documents
# Connects embeddings with vector storage for semantic search

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import os

from .embeddings import EmbeddingsGenerator, get_embeddings_generator
from .ingestion import DocumentChunk, DocumentIngester, ingest_all_documents


@dataclass
class RetrievalResult:
    """
    Result from a retrieval query.

    Attributes:
        chunk: The retrieved document chunk
        score: Similarity score (higher is more similar)
        rank: Rank in the result list (1-based)
    """
    chunk: DocumentChunk
    score: float
    rank: int

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "content": self.chunk.content,
            "score": self.score,
            "rank": self.rank,
            "metadata": self.chunk.metadata,
        }


class RAGRetriever:
    """
    Retrieval-Augmented Generation retriever.

    Handles:
    - Document embedding and indexing
    - Semantic search queries
    - Context assembly for LLM prompts
    """

    def __init__(
        self,
        embeddings_generator: Optional[EmbeddingsGenerator] = None,
        use_qdrant: bool = False,
        qdrant_host: Optional[str] = None,
        qdrant_api_key: Optional[str] = None,
    ):
        """
        Initialize the RAG retriever.

        Args:
            embeddings_generator: Optional custom embeddings generator
            use_qdrant: Whether to use Qdrant for vector storage
            qdrant_host: Qdrant server host URL
            qdrant_api_key: Qdrant API key
        """
        self.embeddings = embeddings_generator or get_embeddings_generator()
        self.use_qdrant = use_qdrant

        # In-memory storage (fallback when Qdrant not available)
        self._chunks: List[DocumentChunk] = []
        self._embeddings: List[List[float]] = []

        # Qdrant client (if using)
        self._qdrant_client = None
        self._collection_name = "ai_textbook"

        if use_qdrant:
            self._init_qdrant(qdrant_host, qdrant_api_key)

    def _init_qdrant(
        self,
        host: Optional[str],
        api_key: Optional[str],
    ) -> None:
        """Initialize Qdrant client."""
        try:
            from qdrant_client import QdrantClient
            from qdrant_client.models import Distance, VectorParams

            host = host or os.getenv("QDRANT_HOST", "localhost")
            api_key = api_key or os.getenv("QDRANT_API_KEY")

            if api_key:
                self._qdrant_client = QdrantClient(url=host, api_key=api_key)
            else:
                self._qdrant_client = QdrantClient(host=host, port=6333)

            # Ensure collection exists
            collections = self._qdrant_client.get_collections().collections
            if not any(c.name == self._collection_name for c in collections):
                self._qdrant_client.create_collection(
                    collection_name=self._collection_name,
                    vectors_config=VectorParams(
                        size=self.embeddings.embedding_dimension,
                        distance=Distance.COSINE,
                    ),
                )

        except ImportError:
            print("Warning: qdrant-client not installed. Using in-memory storage.")
            self.use_qdrant = False
        except Exception as e:
            print(f"Warning: Could not connect to Qdrant: {e}. Using in-memory storage.")
            self.use_qdrant = False

    def index_chunks(
        self,
        chunks: List[DocumentChunk],
        batch_size: int = 10,
    ) -> int:
        """
        Index document chunks for retrieval.

        Args:
            chunks: List of document chunks to index
            batch_size: Batch size for embedding generation

        Returns:
            Number of chunks indexed
        """
        indexed_count = 0

        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]

            # Generate embeddings for batch
            texts = [chunk.content for chunk in batch]
            embeddings = self.embeddings.generate_batch(
                texts,
                task_type="RETRIEVAL_DOCUMENT",
            )

            # Store embeddings
            for chunk, embedding in zip(batch, embeddings):
                chunk.embedding = embedding

                if self.use_qdrant and self._qdrant_client:
                    self._index_to_qdrant(chunk)
                else:
                    self._chunks.append(chunk)
                    self._embeddings.append(embedding)

                indexed_count += 1

        return indexed_count

    def _index_to_qdrant(self, chunk: DocumentChunk) -> None:
        """Index a single chunk to Qdrant."""
        from qdrant_client.models import PointStruct

        point = PointStruct(
            id=hash(chunk.id) % (2**63),  # Convert string ID to int
            vector=chunk.embedding,
            payload={
                "chunk_id": chunk.id,
                "content": chunk.content,
                **chunk.metadata,
            },
        )

        self._qdrant_client.upsert(
            collection_name=self._collection_name,
            points=[point],
        )

    def search(
        self,
        query: str,
        top_k: int = 5,
        min_score: float = 0.0,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[RetrievalResult]:
        """
        Search for relevant document chunks.

        Args:
            query: Search query
            top_k: Maximum number of results to return
            min_score: Minimum similarity score threshold
            filter_metadata: Optional metadata filters

        Returns:
            List of retrieval results sorted by relevance
        """
        # Generate query embedding
        query_embedding = self.embeddings.generate_query_embedding(query)

        if self.use_qdrant and self._qdrant_client:
            return self._search_qdrant(query_embedding, top_k, min_score, filter_metadata)
        else:
            return self._search_memory(query_embedding, top_k, min_score, filter_metadata)

    def _search_memory(
        self,
        query_embedding: List[float],
        top_k: int,
        min_score: float,
        filter_metadata: Optional[Dict[str, Any]],
    ) -> List[RetrievalResult]:
        """Search in-memory storage."""
        if not self._chunks:
            return []

        # Calculate cosine similarities
        scores = []
        for i, embedding in enumerate(self._embeddings):
            score = self._cosine_similarity(query_embedding, embedding)
            scores.append((i, score))

        # Sort by score
        scores.sort(key=lambda x: x[1], reverse=True)

        # Build results
        results = []
        for rank, (idx, score) in enumerate(scores[:top_k], 1):
            if score < min_score:
                continue

            chunk = self._chunks[idx]

            # Apply metadata filter
            if filter_metadata:
                if not self._matches_filter(chunk.metadata, filter_metadata):
                    continue

            results.append(RetrievalResult(
                chunk=chunk,
                score=score,
                rank=rank,
            ))

        return results

    def _search_qdrant(
        self,
        query_embedding: List[float],
        top_k: int,
        min_score: float,
        filter_metadata: Optional[Dict[str, Any]],
    ) -> List[RetrievalResult]:
        """Search Qdrant vector database."""
        from qdrant_client.models import Filter, FieldCondition, MatchValue

        # Build filter if provided
        qdrant_filter = None
        if filter_metadata:
            conditions = [
                FieldCondition(key=key, match=MatchValue(value=value))
                for key, value in filter_metadata.items()
            ]
            qdrant_filter = Filter(must=conditions)

        # Search
        results = self._qdrant_client.search(
            collection_name=self._collection_name,
            query_vector=query_embedding,
            query_filter=qdrant_filter,
            limit=top_k,
            score_threshold=min_score,
        )

        # Convert to RetrievalResult
        retrieval_results = []
        for rank, hit in enumerate(results, 1):
            chunk = DocumentChunk(
                id=hit.payload.get("chunk_id", str(hit.id)),
                content=hit.payload.get("content", ""),
                metadata={k: v for k, v in hit.payload.items() if k not in ["chunk_id", "content"]},
            )
            retrieval_results.append(RetrievalResult(
                chunk=chunk,
                score=hit.score,
                rank=rank,
            ))

        return retrieval_results

    def _cosine_similarity(
        self,
        vec1: List[float],
        vec2: List[float],
    ) -> float:
        """Calculate cosine similarity between two vectors."""
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = sum(a * a for a in vec1) ** 0.5
        norm2 = sum(b * b for b in vec2) ** 0.5

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return dot_product / (norm1 * norm2)

    def _matches_filter(
        self,
        metadata: Dict[str, Any],
        filter_dict: Dict[str, Any],
    ) -> bool:
        """Check if metadata matches filter criteria."""
        for key, value in filter_dict.items():
            if key not in metadata or metadata[key] != value:
                return False
        return True

    def get_context(
        self,
        query: str,
        max_chunks: int = 3,
        max_length: int = 2000,
    ) -> str:
        """
        Get context for a query (for LLM prompt building).

        Args:
            query: User's query
            max_chunks: Maximum number of chunks to include
            max_length: Maximum total context length

        Returns:
            Formatted context string
        """
        results = self.search(query, top_k=max_chunks)

        if not results:
            return ""

        context_parts = []
        total_length = 0

        for result in results:
            content = result.chunk.content
            if total_length + len(content) > max_length:
                # Truncate to fit
                remaining = max_length - total_length
                content = content[:remaining] + "..."

            source = result.chunk.metadata.get("title", result.chunk.metadata.get("source_file", "Unknown"))
            context_parts.append(f"[Source: {source}]\n{content}")
            total_length += len(content)

            if total_length >= max_length:
                break

        return "\n\n---\n\n".join(context_parts)

    def clear_index(self) -> None:
        """Clear all indexed documents."""
        self._chunks = []
        self._embeddings = []

        if self.use_qdrant and self._qdrant_client:
            try:
                self._qdrant_client.delete_collection(self._collection_name)
                self._init_qdrant(None, None)
            except Exception:
                pass

    @property
    def index_size(self) -> int:
        """Get the number of indexed chunks."""
        if self.use_qdrant and self._qdrant_client:
            try:
                info = self._qdrant_client.get_collection(self._collection_name)
                return info.points_count
            except Exception:
                return 0
        return len(self._chunks)


# Convenience functions
def create_retriever(use_qdrant: bool = False) -> RAGRetriever:
    """
    Create a RAG retriever with default settings.

    Args:
        use_qdrant: Whether to use Qdrant for storage

    Returns:
        Configured RAGRetriever instance
    """
    return RAGRetriever(use_qdrant=use_qdrant)


def index_textbook(retriever: Optional[RAGRetriever] = None) -> int:
    """
    Index all textbook content.

    Args:
        retriever: Optional retriever to use

    Returns:
        Number of chunks indexed
    """
    retriever = retriever or create_retriever()
    chunks = ingest_all_documents()
    return retriever.index_chunks(chunks)
