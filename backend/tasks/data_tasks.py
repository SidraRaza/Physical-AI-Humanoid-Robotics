# Data Tasks - Reusable data fetching and search functions
# These tasks handle data retrieval from files, databases, and external sources

from typing import Optional, List, Dict, Any
from pathlib import Path
import os
import re
import json


# Base paths for content
CONTENT_DIR = Path(__file__).parent.parent.parent / "frontend" / "docs"
EXTERNAL_CONTENT_DIR = Path(__file__).parent.parent.parent / "external-content"


def fetch_chapter_content(
    chapter_id: str,
    section: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Fetch content from a specific chapter of the textbook.

    Args:
        chapter_id: Chapter identifier (e.g., 'chapter1', 'appendix-a')
        section: Optional specific section within the chapter

    Returns:
        Dictionary with chapter content and metadata
    """
    # Map chapter IDs to files
    chapter_files = {
        "chapter1": "chapter-1.md",
        "chapter2": "chapter-2.md",
        "chapter3": "chapter-3.md",
        "chapter4": "chapter-4.md",
        "chapter5": "chapter-5.md",
        "chapter6": "chapter-6.md",
        "chapter7": "chapter-7.md",
        "appendix-a": "appendix-a.md",
        "appendix-b": "appendix-b.md",
        "appendix-c": "appendix-c.md",
    }

    filename = chapter_files.get(chapter_id.lower())
    if not filename:
        return {
            "success": False,
            "error": f"Unknown chapter: {chapter_id}",
            "available_chapters": list(chapter_files.keys()),
        }

    filepath = CONTENT_DIR / filename
    if not filepath.exists():
        return {
            "success": False,
            "error": f"Chapter file not found: {filename}",
        }

    try:
        content = filepath.read_text(encoding="utf-8")

        # Extract metadata from frontmatter if present
        metadata = {}
        if content.startswith("---"):
            end_idx = content.find("---", 3)
            if end_idx != -1:
                frontmatter = content[3:end_idx].strip()
                content = content[end_idx + 3:].strip()
                for line in frontmatter.split("\n"):
                    if ": " in line:
                        key, value = line.split(": ", 1)
                        metadata[key.strip()] = value.strip()

        # Extract specific section if requested
        if section:
            section_content = _extract_section(content, section)
            if section_content:
                content = section_content
            else:
                return {
                    "success": False,
                    "error": f"Section '{section}' not found in chapter",
                }

        return {
            "success": True,
            "chapter_id": chapter_id,
            "content": content,
            "metadata": metadata,
            "word_count": len(content.split()),
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to read chapter: {str(e)}",
        }


def _extract_section(content: str, section_title: str) -> Optional[str]:
    """Extract a specific section from markdown content."""
    lines = content.split("\n")
    section_start = None
    section_level = None

    for i, line in enumerate(lines):
        # Check for heading
        if line.startswith("#"):
            level = len(line) - len(line.lstrip("#"))
            title = line.lstrip("# ").strip()

            if section_start is not None:
                # Check if this is same or higher level heading (section end)
                if level <= section_level:
                    return "\n".join(lines[section_start:i])

            # Check if this is the section we're looking for
            if section_title.lower() in title.lower():
                section_start = i
                section_level = level

    # Return from section start to end of content
    if section_start is not None:
        return "\n".join(lines[section_start:])

    return None


def search_textbook(
    query: str,
    max_results: int = 5,
    chapter_filter: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Search the textbook content for relevant passages.

    Args:
        query: Search query
        max_results: Maximum number of results to return
        chapter_filter: Optional chapter to limit search

    Returns:
        List of matching passages with metadata
    """
    results = []
    query_lower = query.lower()
    query_words = set(query_lower.split())

    # Get files to search
    if chapter_filter:
        files = [CONTENT_DIR / f"{chapter_filter}.md"]
    else:
        files = list(CONTENT_DIR.glob("*.md"))

    for filepath in files:
        if not filepath.exists():
            continue

        try:
            content = filepath.read_text(encoding="utf-8")
            chapter_id = filepath.stem

            # Split into paragraphs
            paragraphs = content.split("\n\n")

            for para in paragraphs:
                para = para.strip()
                if len(para) < 50:  # Skip short paragraphs
                    continue

                para_lower = para.lower()

                # Simple relevance scoring
                score = 0
                # Exact phrase match
                if query_lower in para_lower:
                    score += 10
                # Word matches
                para_words = set(para_lower.split())
                matching_words = query_words & para_words
                score += len(matching_words) * 2

                if score > 0:
                    results.append({
                        "chapter_id": chapter_id,
                        "content": para[:500] + ("..." if len(para) > 500 else ""),
                        "score": score,
                        "word_count": len(para.split()),
                    })

        except Exception:
            continue

    # Sort by score and limit results
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:max_results]


def get_glossary_term(
    term: str,
) -> Dict[str, Any]:
    """
    Look up a term in the glossary.

    Args:
        term: The term to look up

    Returns:
        Dictionary with term definition and related terms
    """
    # Try to load glossary from file
    glossary_path = EXTERNAL_CONTENT_DIR / "glossary.json"

    # Default glossary for common deep learning terms
    default_glossary = {
        "neural network": {
            "definition": "A computing system inspired by biological neural networks, consisting of interconnected nodes (neurons) organized in layers that process information.",
            "related": ["deep learning", "perceptron", "activation function"],
        },
        "deep learning": {
            "definition": "A subset of machine learning that uses neural networks with multiple layers (deep neural networks) to learn complex patterns from data.",
            "related": ["neural network", "machine learning", "backpropagation"],
        },
        "backpropagation": {
            "definition": "An algorithm for training neural networks by computing gradients of the loss function with respect to weights, enabling efficient learning through gradient descent.",
            "related": ["gradient descent", "loss function", "chain rule"],
        },
        "activation function": {
            "definition": "A mathematical function applied to a neuron's output to introduce non-linearity, enabling neural networks to learn complex patterns.",
            "related": ["ReLU", "sigmoid", "tanh"],
        },
        "gradient descent": {
            "definition": "An optimization algorithm that iteratively adjusts parameters to minimize a loss function by moving in the direction of steepest descent.",
            "related": ["backpropagation", "learning rate", "optimizer"],
        },
        "loss function": {
            "definition": "A function that measures how well a model's predictions match the actual target values. The goal of training is to minimize this function.",
            "related": ["cross-entropy", "MSE", "gradient descent"],
        },
        "epoch": {
            "definition": "One complete pass through the entire training dataset during model training.",
            "related": ["batch", "iteration", "training"],
        },
        "batch size": {
            "definition": "The number of training examples used in one iteration of gradient descent.",
            "related": ["epoch", "mini-batch", "stochastic gradient descent"],
        },
        "overfitting": {
            "definition": "When a model learns the training data too well, including noise, resulting in poor generalization to new data.",
            "related": ["regularization", "dropout", "validation"],
        },
        "regularization": {
            "definition": "Techniques used to prevent overfitting by adding constraints or penalties to the model during training.",
            "related": ["L1", "L2", "dropout", "overfitting"],
        },
    }

    # Try to load from file
    glossary = default_glossary
    if glossary_path.exists():
        try:
            with open(glossary_path, "r", encoding="utf-8") as f:
                file_glossary = json.load(f)
                glossary.update(file_glossary)
        except Exception:
            pass

    # Look up term (case-insensitive)
    term_lower = term.lower().strip()

    if term_lower in glossary:
        entry = glossary[term_lower]
        return {
            "success": True,
            "term": term,
            "definition": entry["definition"],
            "related_terms": entry.get("related", []),
        }

    # Partial match
    matches = [
        key for key in glossary.keys()
        if term_lower in key or key in term_lower
    ]

    if matches:
        return {
            "success": False,
            "error": f"Term '{term}' not found exactly. Did you mean: {', '.join(matches)}?",
            "suggestions": matches,
        }

    return {
        "success": False,
        "error": f"Term '{term}' not found in glossary",
        "suggestions": [],
    }


def list_chapters() -> List[Dict[str, str]]:
    """
    List all available chapters in the textbook.

    Returns:
        List of chapters with ID and title
    """
    chapters = []

    for filepath in sorted(CONTENT_DIR.glob("*.md")):
        try:
            content = filepath.read_text(encoding="utf-8")

            # Extract title from first heading or frontmatter
            title = filepath.stem.replace("-", " ").title()

            # Check frontmatter
            if content.startswith("---"):
                end_idx = content.find("---", 3)
                if end_idx != -1:
                    frontmatter = content[3:end_idx]
                    for line in frontmatter.split("\n"):
                        if line.startswith("title:"):
                            title = line.split(":", 1)[1].strip().strip('"\'')
                            break

            # Check first heading
            lines = content.split("\n")
            for line in lines:
                if line.startswith("# "):
                    title = line[2:].strip()
                    break

            chapters.append({
                "id": filepath.stem,
                "title": title,
                "filename": filepath.name,
            })

        except Exception:
            continue

    return chapters
