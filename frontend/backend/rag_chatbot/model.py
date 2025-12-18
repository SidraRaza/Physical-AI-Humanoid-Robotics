# Path: backend/rag_chatbot/model.py

# Placeholder for data models related to RAG chatbot, e.g., query, response, source documents.

from pydantic import BaseModel
from typing import List, Optional

class SourceDocument(BaseModel):
    title: str
    url: str
    excerpt: str

class ChatResponse(BaseModel):
    response: str
    source_documents: List[SourceDocument]

class ChatRequest(BaseModel):
    query: str
    selected_text: Optional[str] = None