# AI Tasks - Reusable AI model task functions
# These tasks handle interactions with AI models (Gemini, etc.)

from typing import Optional, List, Dict, Any
import os
from .task_runner import task

# Try to import google.generativeai, handle if not installed
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    genai = None


def _get_model():
    """Get configured Gemini model instance."""
    if not GENAI_AVAILABLE:
        raise RuntimeError("google-generativeai package not installed")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable not set")

    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.0-flash")


@task(
    name="generate_response",
    description="Generate an AI response to a user query with optional context",
    timeout_seconds=60.0
)
def generate_response(
    query: str,
    context: Optional[str] = None,
    system_prompt: Optional[str] = None,
) -> str:
    """
    Generate an AI response to a user query.

    Args:
        query: The user's question or prompt
        context: Optional context from RAG retrieval
        system_prompt: Optional system prompt override

    Returns:
        Generated response text
    """
    model = _get_model()

    # Build the prompt
    prompt_parts = []

    if system_prompt:
        prompt_parts.append(f"System: {system_prompt}\n\n")
    else:
        prompt_parts.append(
            "You are a helpful AI learning assistant for a Deep Learning textbook. "
            "Answer questions clearly and concisely. Use markdown formatting when helpful.\n\n"
        )

    if context:
        prompt_parts.append(f"Context from textbook:\n{context}\n\n")

    prompt_parts.append(f"User question: {query}")

    full_prompt = "".join(prompt_parts)

    try:
        response = model.generate_content(full_prompt)
        return response.text if response.text else "I couldn't generate a response."
    except Exception as e:
        raise RuntimeError(f"Failed to generate response: {str(e)}")


@task(
    name="summarize_text",
    description="Summarize a piece of text with specified style and length",
    timeout_seconds=30.0
)
def summarize_text(
    text: str,
    max_sentences: int = 3,
    style: str = "concise",
) -> str:
    """
    Summarize a piece of text.

    Args:
        text: The text to summarize
        max_sentences: Maximum number of sentences in summary
        style: Summary style ('concise', 'detailed', 'bullet_points')

    Returns:
        Summary of the text
    """
    model = _get_model()

    style_instructions = {
        "concise": "Be very brief and to the point.",
        "detailed": "Include important details and context.",
        "bullet_points": "Format as bullet points with key takeaways.",
    }

    prompt = f"""Summarize the following text in approximately {max_sentences} sentences.
{style_instructions.get(style, '')}

Text:
{text}

Summary:"""

    try:
        response = model.generate_content(prompt)
        return response.text if response.text else "Could not generate summary."
    except Exception as e:
        raise RuntimeError(f"Failed to summarize: {str(e)}")


@task(
    name="extract_key_concepts",
    description="Extract key concepts from a piece of text with names and descriptions",
    timeout_seconds=45.0
)
def extract_key_concepts(
    text: str,
    max_concepts: int = 5,
) -> List[Dict[str, str]]:
    """
    Extract key concepts from a piece of text.

    Args:
        text: The text to analyze
        max_concepts: Maximum number of concepts to extract

    Returns:
        List of concepts with name and description
    """
    model = _get_model()

    prompt = f"""Extract the {max_concepts} most important concepts from this text.
For each concept, provide:
1. The concept name
2. A brief one-sentence explanation

Format your response as a numbered list with "Name: explanation" format.

Text:
{text}

Key Concepts:"""

    try:
        response = model.generate_content(prompt)
        if not response.text:
            return []

        # Parse response into structured format
        concepts = []
        lines = response.text.strip().split('\n')
        for line in lines:
            line = line.strip()
            if not line or not line[0].isdigit():
                continue

            # Remove number prefix
            if '. ' in line:
                line = line.split('. ', 1)[1]

            if ': ' in line:
                name, desc = line.split(': ', 1)
                concepts.append({"name": name.strip(), "description": desc.strip()})
            else:
                concepts.append({"name": line, "description": ""})

        return concepts[:max_concepts]

    except Exception as e:
        raise RuntimeError(f"Failed to extract concepts: {str(e)}")


@task(
    name="generate_explanation",
    description="Generate an explanation for a concept at a specific difficulty level",
    timeout_seconds=45.0
)
def generate_explanation(
    concept: str,
    level: str = "beginner",
    include_examples: bool = True,
) -> str:
    """
    Generate an explanation for a concept at a specific level.

    Args:
        concept: The concept to explain
        level: Difficulty level ('beginner', 'intermediate', 'advanced')
        include_examples: Whether to include examples

    Returns:
        Explanation of the concept
    """
    model = _get_model()

    level_instructions = {
        "beginner": "Explain as if to someone with no technical background. Use simple analogies.",
        "intermediate": "Assume basic programming knowledge. Include some technical details.",
        "advanced": "Provide in-depth technical explanation with mathematical details if relevant.",
    }

    example_instruction = "Include a practical example to illustrate the concept." if include_examples else ""

    prompt = f"""Explain the concept of "{concept}" for deep learning.

Level: {level}
{level_instructions.get(level, '')}

{example_instruction}

Keep the explanation focused and educational."""

    try:
        response = model.generate_content(prompt)
        return response.text if response.text else "Could not generate explanation."
    except Exception as e:
        raise RuntimeError(f"Failed to generate explanation: {str(e)}")


@task(
    name="analyze_code",
    description="Analyze code and provide insights based on the specified task",
    timeout_seconds=60.0
)
def analyze_code(
    code: str,
    task: str = "explain",
) -> str:
    """
    Analyze code and provide insights.

    Args:
        code: The code to analyze
        task: Analysis task ('explain', 'review', 'optimize', 'debug')

    Returns:
        Analysis results
    """
    model = _get_model()

    task_prompts = {
        "explain": "Explain what this code does, line by line if needed:",
        "review": "Review this code for potential issues, best practices, and improvements:",
        "optimize": "Suggest optimizations for this code's performance and readability:",
        "debug": "Identify potential bugs or issues in this code:",
    }

    prompt = f"""{task_prompts.get(task, task_prompts['explain'])}

```
{code}
```

Analysis:"""

    try:
        response = model.generate_content(prompt)
        return response.text if response.text else "Could not analyze code."
    except Exception as e:
        raise RuntimeError(f"Failed to analyze code: {str(e)}")


@task(
    name="translate_to_simple",
    description="Translate technical text into simpler, more accessible language",
    timeout_seconds=30.0
)
def translate_to_simple(
    technical_text: str,
) -> str:
    """
    Translate technical text into simpler language.

    Args:
        technical_text: Complex technical text

    Returns:
        Simplified version of the text
    """
    model = _get_model()

    prompt = f"""Rewrite the following technical text in simpler, more accessible language.
Keep the core meaning but make it understandable for beginners.

Technical text:
{technical_text}

Simplified version:"""

    try:
        response = model.generate_content(prompt)
        return response.text if response.text else technical_text
    except Exception as e:
        raise RuntimeError(f"Failed to simplify text: {str(e)}")
