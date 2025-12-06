# Path: backend/skills/read_glossary.py

# Example skill: reading from a simulated glossary.

def read_glossary_term(term: str) -> str:
    """Reads the definition of a term from the glossary.

    Args:
        term (str): The term to look up.

    Returns:
        str: The definition of the term or a 'not found' message.
    """
    glossary = {
        "Docusaurus": "A static site generator for building documentation websites.",
        "RAG": "Retrieval-Augmented Generation, a technique for enhancing language models with external knowledge.",
        "FastAPI": "A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints."
    }
    return glossary.get(term, f"Term '{term}' not found in glossary.")

# Metadata for the skill manager
SKILL_METADATA = {
    "name": "read_glossary_term",
    "description": "Reads the definition of a term from the glossary. Useful for understanding key concepts.",
    "parameters": {
        "type": "object",
        "properties": {
            "term": {
                "type": "string",
                "description": "The term to look up in the glossary."
            }
        },
        "required": ["term"]
    }
}
