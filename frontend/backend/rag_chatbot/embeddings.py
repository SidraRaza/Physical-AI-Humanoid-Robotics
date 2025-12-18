# Embeddings Pipeline - Generate embeddings for RAG
# Uses Google's Gemini embedding API (free tier available)

from typing import List, Optional
import os
import hashlib

# Try to import google.generativeai for embeddings
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    genai = None


class EmbeddingsGenerator:
    """
    Generate embeddings for text using Google's Gemini embedding API.

    The Gemini embedding API is free to use and provides high-quality
    embeddings suitable for semantic search and retrieval.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "models/text-embedding-004",
    ):
        """
        Initialize the embeddings generator.

        Args:
            api_key: Google AI API key (or from GEMINI_API_KEY env var)
            model: Embedding model to use
        """
        if not GENAI_AVAILABLE:
            raise RuntimeError(
                "google-generativeai package not installed. "
                "Install with: pip install google-generativeai"
            )

        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "API key required. Set GEMINI_API_KEY environment variable "
                "or pass api_key parameter."
            )

        genai.configure(api_key=self.api_key)
        self.model = model
        self._cache: dict = {}  # Simple in-memory cache

    def generate(
        self,
        text: str,
        task_type: str = "RETRIEVAL_DOCUMENT",
        use_cache: bool = True,
    ) -> List[float]:
        """
        Generate embeddings for a single text.

        Args:
            text: Text to embed
            task_type: Type of embedding task:
                - RETRIEVAL_DOCUMENT: For documents to be retrieved
                - RETRIEVAL_QUERY: For search queries
                - SEMANTIC_SIMILARITY: For comparing text similarity
                - CLASSIFICATION: For text classification
            use_cache: Whether to use cached embeddings

        Returns:
            List of embedding floats (768 dimensions for text-embedding-004)
        """
        # Check cache
        cache_key = self._get_cache_key(text, task_type)
        if use_cache and cache_key in self._cache:
            return self._cache[cache_key]

        try:
            result = genai.embed_content(
                model=self.model,
                content=text,
                task_type=task_type,
            )

            embedding = result["embedding"]

            # Cache result
            if use_cache:
                self._cache[cache_key] = embedding

            return embedding

        except Exception as e:
            raise RuntimeError(f"Failed to generate embedding: {str(e)}")

    def generate_batch(
        self,
        texts: List[str],
        task_type: str = "RETRIEVAL_DOCUMENT",
        use_cache: bool = True,
    ) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.

        Args:
            texts: List of texts to embed
            task_type: Type of embedding task
            use_cache: Whether to use cached embeddings

        Returns:
            List of embedding vectors
        """
        embeddings = []

        for text in texts:
            embedding = self.generate(text, task_type, use_cache)
            embeddings.append(embedding)

        return embeddings

    def generate_query_embedding(self, query: str) -> List[float]:
        """
        Generate embedding optimized for search queries.

        Args:
            query: Search query text

        Returns:
            Query embedding vector
        """
        return self.generate(query, task_type="RETRIEVAL_QUERY", use_cache=False)

    def generate_document_embedding(self, document: str) -> List[float]:
        """
        Generate embedding optimized for document retrieval.

        Args:
            document: Document text

        Returns:
            Document embedding vector
        """
        return self.generate(document, task_type="RETRIEVAL_DOCUMENT", use_cache=True)

    def _get_cache_key(self, text: str, task_type: str) -> str:
        """Generate cache key for text and task type."""
        content = f"{task_type}:{text}"
        return hashlib.md5(content.encode()).hexdigest()

    def clear_cache(self) -> None:
        """Clear the embedding cache."""
        self._cache.clear()

    @property
    def embedding_dimension(self) -> int:
        """Get the dimension of embeddings produced by this model."""
        # text-embedding-004 produces 768-dimensional embeddings
        return 768


def get_embeddings_generator() -> EmbeddingsGenerator:
    """
    Factory function to get an embeddings generator instance.

    Returns:
        Configured EmbeddingsGenerator instance
    """
    return EmbeddingsGenerator()


# Convenience functions for common operations
def embed_text(text: str, task_type: str = "RETRIEVAL_DOCUMENT") -> List[float]:
    """
    Convenience function to embed a single text.

    Args:
        text: Text to embed
        task_type: Embedding task type

    Returns:
        Embedding vector
    """
    generator = get_embeddings_generator()
    return generator.generate(text, task_type)


def embed_query(query: str) -> List[float]:
    """
    Convenience function to embed a search query.

    Args:
        query: Search query

    Returns:
        Query embedding vector
    """
    generator = get_embeddings_generator()
    return generator.generate_query_embedding(query)


def embed_documents(documents: List[str]) -> List[List[float]]:
    """
    Convenience function to embed multiple documents.

    Args:
        documents: List of document texts

    Returns:
        List of embedding vectors
    """
    generator = get_embeddings_generator()
    return generator.generate_batch(documents, task_type="RETRIEVAL_DOCUMENT")
