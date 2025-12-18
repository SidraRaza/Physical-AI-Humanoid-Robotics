# Path: backend/skills/textbook_search.py

# Example skill: searching the textbook content.
from ..tasks import search_textbook

def textbook_search(query: str, max_results: int = 5) -> str:
    """Searches the textbook content for relevant passages.

    Args:
        query (str): The search query.
        max_results (int): Maximum number of results to return (default: 5).

    Returns:
        str: A formatted string with search results.
    """
    results = search_textbook(query, max_results=max_results)

    if not results:
        return f"No results found for query: '{query}'"

    formatted_results = []
    for i, result in enumerate(results, 1):
        excerpt = result['content'][:200] + "..." if len(result['content']) > 200 else result['content']
        formatted_results.append(f"{i}. Chapter: {result['chapter_id']}\n   Score: {result['score']}\n   Excerpt: {excerpt}\n")

    return f"Search results for '{query}':\n\n" + "\n".join(formatted_results)

# Metadata for the skill manager
SKILL_METADATA = {
    "name": "textbook_search",
    "description": "Searches the textbook content for relevant passages based on a query. Useful for finding specific information in the textbook.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query to look for in the textbook."
            },
            "max_results": {
                "type": "integer",
                "description": "Maximum number of results to return (default: 5).",
                "default": 5
            }
        },
        "required": ["query"]
    }
}