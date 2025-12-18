# Document Ingestion - Process and chunk documents for RAG
# Handles markdown parsing, chunking, and metadata extraction

from typing import List, Dict, Any, Optional, Generator
from dataclasses import dataclass, field
from pathlib import Path
import re
import hashlib
from datetime import datetime


@dataclass
class DocumentChunk:
    """
    Represents a chunk of a document for embedding and retrieval.

    Attributes:
        id: Unique chunk identifier
        content: The text content of the chunk
        metadata: Associated metadata (source, chapter, etc.)
        embedding: Optional pre-computed embedding vector
    """
    id: str
    content: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    embedding: Optional[List[float]] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert chunk to dictionary."""
        return {
            "id": self.id,
            "content": self.content,
            "metadata": self.metadata,
            "has_embedding": self.embedding is not None,
        }


class TextChunker:
    """
    Split text into chunks suitable for embedding and retrieval.

    Supports multiple chunking strategies:
    - Fixed size: Split by character count
    - Sentence: Split by sentence boundaries
    - Paragraph: Split by paragraph boundaries
    - Semantic: Split by markdown sections
    """

    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        strategy: str = "semantic",
    ):
        """
        Initialize the chunker.

        Args:
            chunk_size: Target size for chunks (in characters)
            chunk_overlap: Overlap between consecutive chunks
            strategy: Chunking strategy ('fixed', 'sentence', 'paragraph', 'semantic')
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.strategy = strategy

    def chunk(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> List[DocumentChunk]:
        """
        Split text into chunks.

        Args:
            text: Text to chunk
            metadata: Base metadata for all chunks

        Returns:
            List of DocumentChunk objects
        """
        metadata = metadata or {}

        if self.strategy == "fixed":
            return self._chunk_fixed(text, metadata)
        elif self.strategy == "sentence":
            return self._chunk_by_sentences(text, metadata)
        elif self.strategy == "paragraph":
            return self._chunk_by_paragraphs(text, metadata)
        elif self.strategy == "semantic":
            return self._chunk_semantic(text, metadata)
        else:
            raise ValueError(f"Unknown chunking strategy: {self.strategy}")

    def _chunk_fixed(
        self,
        text: str,
        metadata: Dict[str, Any],
    ) -> List[DocumentChunk]:
        """Split text by fixed character count with overlap."""
        chunks = []
        start = 0

        while start < len(text):
            end = start + self.chunk_size

            # Find word boundary
            if end < len(text):
                while end > start and text[end] not in " \n\t":
                    end -= 1
                if end == start:
                    end = start + self.chunk_size

            chunk_text = text[start:end].strip()

            if chunk_text:
                chunk_id = self._generate_chunk_id(chunk_text, start)
                chunks.append(DocumentChunk(
                    id=chunk_id,
                    content=chunk_text,
                    metadata={
                        **metadata,
                        "chunk_index": len(chunks),
                        "start_char": start,
                        "end_char": end,
                    },
                ))

            start = end - self.chunk_overlap

        return chunks

    def _chunk_by_sentences(
        self,
        text: str,
        metadata: Dict[str, Any],
    ) -> List[DocumentChunk]:
        """Split text by sentence boundaries."""
        # Simple sentence splitter
        sentences = re.split(r'(?<=[.!?])\s+', text)

        chunks = []
        current_chunk = []
        current_length = 0

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            if current_length + len(sentence) > self.chunk_size and current_chunk:
                chunk_text = " ".join(current_chunk)
                chunk_id = self._generate_chunk_id(chunk_text, len(chunks))
                chunks.append(DocumentChunk(
                    id=chunk_id,
                    content=chunk_text,
                    metadata={
                        **metadata,
                        "chunk_index": len(chunks),
                        "sentence_count": len(current_chunk),
                    },
                ))
                current_chunk = []
                current_length = 0

            current_chunk.append(sentence)
            current_length += len(sentence) + 1

        # Add remaining sentences
        if current_chunk:
            chunk_text = " ".join(current_chunk)
            chunk_id = self._generate_chunk_id(chunk_text, len(chunks))
            chunks.append(DocumentChunk(
                id=chunk_id,
                content=chunk_text,
                metadata={
                    **metadata,
                    "chunk_index": len(chunks),
                    "sentence_count": len(current_chunk),
                },
            ))

        return chunks

    def _chunk_by_paragraphs(
        self,
        text: str,
        metadata: Dict[str, Any],
    ) -> List[DocumentChunk]:
        """Split text by paragraph boundaries."""
        paragraphs = text.split("\n\n")

        chunks = []
        current_chunk = []
        current_length = 0

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if current_length + len(para) > self.chunk_size and current_chunk:
                chunk_text = "\n\n".join(current_chunk)
                chunk_id = self._generate_chunk_id(chunk_text, len(chunks))
                chunks.append(DocumentChunk(
                    id=chunk_id,
                    content=chunk_text,
                    metadata={
                        **metadata,
                        "chunk_index": len(chunks),
                        "paragraph_count": len(current_chunk),
                    },
                ))
                current_chunk = []
                current_length = 0

            current_chunk.append(para)
            current_length += len(para) + 2

        # Add remaining paragraphs
        if current_chunk:
            chunk_text = "\n\n".join(current_chunk)
            chunk_id = self._generate_chunk_id(chunk_text, len(chunks))
            chunks.append(DocumentChunk(
                id=chunk_id,
                content=chunk_text,
                metadata={
                    **metadata,
                    "chunk_index": len(chunks),
                    "paragraph_count": len(current_chunk),
                },
            ))

        return chunks

    def _chunk_semantic(
        self,
        text: str,
        metadata: Dict[str, Any],
    ) -> List[DocumentChunk]:
        """Split text by markdown sections and semantic boundaries."""
        chunks = []

        # Split by markdown headings
        sections = re.split(r'\n(#{1,6}\s+[^\n]+)\n', text)

        current_heading = None
        current_content = []
        current_length = 0

        for section in sections:
            section = section.strip()
            if not section:
                continue

            # Check if this is a heading
            if re.match(r'^#{1,6}\s+', section):
                # Save previous section if exists
                if current_content:
                    self._add_semantic_chunk(
                        chunks, current_content, current_heading, metadata
                    )
                    current_content = []
                    current_length = 0

                current_heading = section.lstrip('#').strip()
                continue

            # Add content to current section
            if current_length + len(section) > self.chunk_size and current_content:
                self._add_semantic_chunk(
                    chunks, current_content, current_heading, metadata
                )
                current_content = []
                current_length = 0

            current_content.append(section)
            current_length += len(section)

        # Add remaining content
        if current_content:
            self._add_semantic_chunk(
                chunks, current_content, current_heading, metadata
            )

        return chunks

    def _add_semantic_chunk(
        self,
        chunks: List[DocumentChunk],
        content: List[str],
        heading: Optional[str],
        metadata: Dict[str, Any],
    ) -> None:
        """Add a semantic chunk to the list."""
        chunk_text = "\n\n".join(content)
        if not chunk_text.strip():
            return

        chunk_id = self._generate_chunk_id(chunk_text, len(chunks))
        chunks.append(DocumentChunk(
            id=chunk_id,
            content=chunk_text,
            metadata={
                **metadata,
                "chunk_index": len(chunks),
                "section_heading": heading,
            },
        ))

    def _generate_chunk_id(self, content: str, index: int) -> str:
        """Generate a unique chunk ID."""
        hash_input = f"{content[:100]}:{index}"
        return hashlib.md5(hash_input.encode()).hexdigest()[:12]


class DocumentIngester:
    """
    Ingest documents from various sources for RAG.

    Handles:
    - Reading markdown files
    - Extracting frontmatter metadata
    - Chunking content
    - Generating embeddings
    """

    def __init__(
        self,
        content_dir: Optional[Path] = None,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
    ):
        """
        Initialize the ingester.

        Args:
            content_dir: Directory containing markdown files
            chunk_size: Target chunk size in characters
            chunk_overlap: Overlap between chunks
        """
        # Backend is now at frontend/backend/, docs is at frontend/docs
        self.content_dir = content_dir or Path(__file__).parent.parent.parent / "docs"
        self.chunker = TextChunker(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            strategy="semantic",
        )

    def ingest_file(
        self,
        filepath: Path,
    ) -> List[DocumentChunk]:
        """
        Ingest a single markdown file.

        Args:
            filepath: Path to the markdown file

        Returns:
            List of document chunks
        """
        if not filepath.exists():
            raise FileNotFoundError(f"File not found: {filepath}")

        content = filepath.read_text(encoding="utf-8")

        # Extract frontmatter
        metadata, content = self._extract_frontmatter(content)

        # Add file metadata
        metadata.update({
            "source_file": filepath.name,
            "source_path": str(filepath),
            "document_id": filepath.stem,
            "ingested_at": datetime.now().isoformat(),
        })

        # Extract title from first heading if not in frontmatter
        if "title" not in metadata:
            title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
            if title_match:
                metadata["title"] = title_match.group(1)
            else:
                metadata["title"] = filepath.stem.replace("-", " ").title()

        # Chunk the content
        chunks = self.chunker.chunk(content, metadata)

        return chunks

    def ingest_directory(
        self,
        pattern: str = "*.md",
    ) -> Generator[DocumentChunk, None, None]:
        """
        Ingest all matching files from the content directory.

        Args:
            pattern: Glob pattern for files to ingest

        Yields:
            Document chunks from all files
        """
        for filepath in sorted(self.content_dir.glob(pattern)):
            try:
                chunks = self.ingest_file(filepath)
                for chunk in chunks:
                    yield chunk
            except Exception as e:
                print(f"Error ingesting {filepath}: {e}")
                continue

    def ingest_text(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> List[DocumentChunk]:
        """
        Ingest raw text content.

        Args:
            text: Text to ingest
            metadata: Optional metadata

        Returns:
            List of document chunks
        """
        metadata = metadata or {}
        metadata.setdefault("source_type", "text")
        metadata.setdefault("ingested_at", datetime.now().isoformat())

        return self.chunker.chunk(text, metadata)

    def _extract_frontmatter(
        self,
        content: str,
    ) -> tuple[Dict[str, Any], str]:
        """
        Extract YAML frontmatter from markdown content.

        Args:
            content: Raw markdown content

        Returns:
            Tuple of (metadata dict, content without frontmatter)
        """
        metadata = {}

        if content.startswith("---"):
            end_idx = content.find("---", 3)
            if end_idx != -1:
                frontmatter = content[3:end_idx].strip()
                content = content[end_idx + 3:].strip()

                # Parse simple YAML
                for line in frontmatter.split("\n"):
                    if ": " in line:
                        key, value = line.split(": ", 1)
                        key = key.strip()
                        value = value.strip().strip('"\'')
                        metadata[key] = value

        return metadata, content

    def get_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the content directory.

        Returns:
            Dictionary with file counts and sizes
        """
        stats = {
            "total_files": 0,
            "total_size_bytes": 0,
            "files": [],
        }

        for filepath in self.content_dir.glob("*.md"):
            stats["total_files"] += 1
            stats["total_size_bytes"] += filepath.stat().st_size
            stats["files"].append({
                "name": filepath.name,
                "size_bytes": filepath.stat().st_size,
            })

        return stats


# Convenience function for quick ingestion
def ingest_all_documents(
    content_dir: Optional[Path] = None,
) -> List[DocumentChunk]:
    """
    Ingest all documents from the content directory.

    Args:
        content_dir: Optional path to content directory

    Returns:
        List of all document chunks
    """
    ingester = DocumentIngester(content_dir=content_dir)
    return list(ingester.ingest_directory())
