# C:/Users/ahed8/my-ai-textbook/backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from fastembed import TextEmbedding

from backend.rag_chatbot.model import ChatRequest, ChatResponse, SourceDocument
from backend.rag_chatbot.qdrant_client import QdrantManager
from backend.rag_chatbot.openai_agent import OpenAIAgent
from backend.rag_chatbot.skill_manager import SkillManager

load_dotenv() # Load environment variables from .env file

app = FastAPI()

# Retrieve allowed origins from environment variable, split by comma
# Default to http://localhost:3000 for local development if FRONTEND_URL is not set
allowed_origins_str = os.getenv("FRONTEND_URL", "http://localhost:3000,https://sidraraza.github.io/Physical-AI-Humanoid-Robotics")
origins = [origin.strip() for origin in allowed_origins_str.split(',')]

# Initialize RAG components
QDRANT_HOST = os.getenv("QDRANT_HOST")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not all([QDRANT_HOST, QDRANT_API_KEY, OPENAI_API_KEY]):
    print("Warning: Missing one or more RAG environment variables (QDRANT_HOST, QDRANT_API_KEY, OPENAI_API_KEY).")
    print("RAG chatbot functionality may be limited or unavailable.")

skill_manager = SkillManager()
qdrant_manager = QdrantManager(host=QDRANT_HOST, api_key=QDRANT_API_KEY) if QDRANT_HOST and QDRANT_API_KEY else None
openai_agent = OpenAIAgent(api_key=OPENAI_API_KEY, skill_manager=skill_manager) if OPENAI_API_KEY else None
embedding_model = TextEmbedding() # Initialize embedding model

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI backend!"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is healthy"}

@app.post("/chat", response_model=ChatResponse)
async def chat_with_rag(request: ChatRequest):
    if not qdrant_manager or not openai_agent:
        return ChatResponse(response="RAG chatbot is not fully configured. Please check environment variables.", source_documents=[])

    query_text = request.query
    if request.selected_text:
        query_text = f"Based on the selected text: '{request.selected_text}', {request.query}"

    # Embed the query using fastembed
    query_vector = embedding_model.embed(query_text).tolist()[0]

    # Search Qdrant for relevant documents
    search_results_raw = qdrant_manager.search_vectors(query_vector, limit=3)
    context_docs = []
    source_documents = []
    for hit in search_results_raw:
        payload = hit.get("payload", {})
        if "excerpt" in payload:
            context_docs.append(payload["excerpt"])
            source_documents.append(SourceDocument(
                title=payload.get("title", "Unknown"),
                url=payload.get("url", "#"),
                excerpt=payload.get("excerpt", "")
            ))

    # Generate response using OpenAI Agent (which can now use skills)
    response_content = openai_agent.generate_response(query_text, context_docs)

    return ChatResponse(response=response_content, source_documents=source_documents)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
