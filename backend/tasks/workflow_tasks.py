# Workflow Tasks - Reusable workflow action functions
# These tasks handle logging, formatting, and orchestration

from typing import Optional, List, Dict, Any
from datetime import datetime
import json
import logging

# Configure logging
logger = logging.getLogger(__name__)


def log_user_query(
    query: str,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Log a user query for analytics and history.

    Args:
        query: The user's query
        user_id: Optional user identifier
        session_id: Optional session identifier
        metadata: Optional additional metadata

    Returns:
        Log entry with timestamp
    """
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "query": query,
        "user_id": user_id,
        "session_id": session_id,
        "query_length": len(query),
        "word_count": len(query.split()),
        "metadata": metadata or {},
    }

    # Log to console/file
    logger.info(f"User query logged: {json.dumps(log_entry)}")

    return {
        "success": True,
        "log_id": f"log_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "entry": log_entry,
    }


def format_response_with_sources(
    response: str,
    sources: List[Dict[str, Any]],
    format_type: str = "markdown",
) -> str:
    """
    Format a response with source citations.

    Args:
        response: The AI-generated response
        sources: List of source documents used
        format_type: Output format ('markdown', 'html', 'plain')

    Returns:
        Formatted response with sources
    """
    if not sources:
        return response

    if format_type == "markdown":
        formatted = response + "\n\n---\n\n**Sources:**\n"
        for i, source in enumerate(sources, 1):
            title = source.get("title", f"Source {i}")
            url = source.get("url", "#")
            excerpt = source.get("excerpt", "")

            if excerpt:
                formatted += f"\n{i}. **[{title}]({url})**\n   > {excerpt[:150]}...\n"
            else:
                formatted += f"\n{i}. [{title}]({url})\n"

    elif format_type == "html":
        formatted = f"<div class='response'>{response}</div>"
        formatted += "<div class='sources'><h4>Sources:</h4><ul>"
        for source in sources:
            title = source.get("title", "Source")
            url = source.get("url", "#")
            formatted += f'<li><a href="{url}">{title}</a></li>'
        formatted += "</ul></div>"

    else:  # plain
        formatted = response + "\n\nSources:\n"
        for i, source in enumerate(sources, 1):
            title = source.get("title", f"Source {i}")
            formatted += f"{i}. {title}\n"

    return formatted


def create_learning_path(
    topic: str,
    current_level: str = "beginner",
    target_level: str = "intermediate",
) -> Dict[str, Any]:
    """
    Create a suggested learning path for a topic.

    Args:
        topic: The topic to learn
        current_level: User's current knowledge level
        target_level: Desired knowledge level

    Returns:
        Structured learning path with steps
    """
    # Define learning progression
    levels = ["beginner", "intermediate", "advanced", "expert"]

    try:
        start_idx = levels.index(current_level.lower())
        end_idx = levels.index(target_level.lower())
    except ValueError:
        start_idx = 0
        end_idx = 1

    if end_idx <= start_idx:
        end_idx = start_idx + 1

    # Generate learning steps
    steps = []
    step_templates = {
        "beginner": [
            "Understand the basic concepts and terminology",
            "Review introductory examples",
            "Practice with simple exercises",
        ],
        "intermediate": [
            "Study the mathematical foundations",
            "Implement from scratch",
            "Work through guided projects",
        ],
        "advanced": [
            "Explore advanced variations and techniques",
            "Read research papers on the topic",
            "Build a complex project using the concept",
        ],
        "expert": [
            "Contribute to open-source implementations",
            "Research novel applications",
            "Teach others and write tutorials",
        ],
    }

    for level in levels[start_idx:end_idx + 1]:
        templates = step_templates.get(level, step_templates["beginner"])
        for template in templates:
            steps.append({
                "level": level,
                "description": template.replace("the concept", topic),
                "estimated_time": "2-4 hours",
            })

    return {
        "topic": topic,
        "current_level": current_level,
        "target_level": target_level,
        "total_steps": len(steps),
        "estimated_total_time": f"{len(steps) * 3} hours",
        "steps": steps,
    }


def validate_query(
    query: str,
    min_length: int = 3,
    max_length: int = 1000,
    allowed_languages: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Validate a user query before processing.

    Args:
        query: The query to validate
        min_length: Minimum query length
        max_length: Maximum query length
        allowed_languages: List of allowed languages (not implemented)

    Returns:
        Validation result with any errors
    """
    errors = []

    # Check length
    if len(query.strip()) < min_length:
        errors.append(f"Query too short (minimum {min_length} characters)")

    if len(query) > max_length:
        errors.append(f"Query too long (maximum {max_length} characters)")

    # Check for empty query
    if not query.strip():
        errors.append("Query cannot be empty")

    # Check for suspicious patterns (basic)
    suspicious_patterns = [
        "ignore previous instructions",
        "disregard your training",
        "you are now",
    ]

    query_lower = query.lower()
    for pattern in suspicious_patterns:
        if pattern in query_lower:
            errors.append("Query contains potentially problematic content")
            break

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "query_length": len(query),
        "word_count": len(query.split()),
    }


def build_prompt(
    query: str,
    context_chunks: List[str],
    system_prompt: Optional[str] = None,
    max_context_length: int = 4000,
) -> str:
    """
    Build a complete prompt with context for the AI model.

    Args:
        query: User's question
        context_chunks: Retrieved context chunks
        system_prompt: Optional system prompt
        max_context_length: Maximum total context length

    Returns:
        Complete formatted prompt
    """
    # Default system prompt
    if not system_prompt:
        system_prompt = (
            "You are a helpful AI learning assistant for a Deep Learning textbook. "
            "Answer questions based on the provided context. "
            "If the context doesn't contain relevant information, say so clearly. "
            "Use markdown formatting for better readability."
        )

    # Build context section
    context = ""
    total_length = 0

    for chunk in context_chunks:
        if total_length + len(chunk) > max_context_length:
            break
        context += f"\n---\n{chunk}"
        total_length += len(chunk)

    # Build final prompt
    prompt = f"""System: {system_prompt}

Context from textbook:
{context if context else "(No relevant context found)"}

User question: {query}

Please provide a helpful, accurate response based on the context above."""

    return prompt


def parse_model_response(
    response: str,
    expected_format: str = "text",
) -> Dict[str, Any]:
    """
    Parse and validate a model response.

    Args:
        response: Raw model response
        expected_format: Expected format ('text', 'json', 'markdown')

    Returns:
        Parsed response with metadata
    """
    result = {
        "success": True,
        "raw_response": response,
        "parsed_content": response,
        "format": expected_format,
        "warnings": [],
    }

    if expected_format == "json":
        try:
            # Try to extract JSON from response
            json_match = response.strip()

            # Handle markdown code blocks
            if json_match.startswith("```"):
                lines = json_match.split("\n")
                json_match = "\n".join(lines[1:-1])

            result["parsed_content"] = json.loads(json_match)
        except json.JSONDecodeError as e:
            result["success"] = False
            result["warnings"].append(f"Failed to parse JSON: {str(e)}")

    elif expected_format == "markdown":
        # Check for proper markdown formatting
        if "```" in response:
            result["has_code_blocks"] = True
        if response.startswith("#"):
            result["has_headings"] = True

    # Basic quality checks
    if len(response.strip()) < 10:
        result["warnings"].append("Response seems too short")

    if response.count("I cannot") > 0 or response.count("I don't know") > 0:
        result["warnings"].append("Response indicates uncertainty")

    return result
