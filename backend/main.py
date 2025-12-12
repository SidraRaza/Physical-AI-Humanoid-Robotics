# Physical AI Textbook API
# Backend API with RAG-powered chatbot

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from rag_chatbot.model import ChatRequest, ChatResponse, SourceDocument
from rag_chatbot.gemini_chat_agent import GeminiChatAgent
from rag_chatbot.retrieval import RAGRetriever, create_retriever
from rag_chatbot.ingestion import ingest_all_documents

load_dotenv()  # Load environment variables from .env file

# Global state
rag_retriever: RAGRetriever = None
chat_agent: GeminiChatAgent = None
is_indexed: bool = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RAG system on startup."""
    global rag_retriever, chat_agent, is_indexed

    # Initialize Gemini agent
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

    if GEMINI_API_KEY:
        chat_agent = GeminiChatAgent(api_key=GEMINI_API_KEY)
        print("Gemini agent initialized successfully.")

        # Initialize RAG retriever (in-memory by default, Qdrant if configured)
        use_qdrant = os.getenv("USE_QDRANT", "false").lower() == "true"
        rag_retriever = create_retriever(use_qdrant=use_qdrant)
        print(f"RAG retriever initialized (Qdrant: {use_qdrant}).")

        # Index documents if AUTO_INDEX is enabled
        if os.getenv("AUTO_INDEX", "false").lower() == "true":
            try:
                chunks = ingest_all_documents()
                indexed = rag_retriever.index_chunks(list(chunks))
                is_indexed = True
                print(f"Indexed {indexed} document chunks on startup.")
            except Exception as e:
                print(f"Warning: Failed to index documents on startup: {e}")
    else:
        print("Warning: GEMINI_API_KEY not set. Chatbot functionality will be limited.")

    yield

    # Cleanup on shutdown
    print("Shutting down...")


app = FastAPI(
    title="Physical AI Textbook API",
    description="Backend API for the Physical AI Textbook chatbot powered by Gemini with RAG",
    version="2.0.0",
    lifespan=lifespan,
)

# Retrieve allowed origins from environment variable
allowed_origins_str = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000,http://localhost:3001,https://sidraraza.github.io/Physical-AI-Humanoid-Robotics"
)
origins = [origin.strip() for origin in allowed_origins_str.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to the Physical AI Textbook API!",
        "version": "2.0.0",
        "features": ["RAG chatbot", "Document indexing", "Semantic search"],
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "Backend is healthy",
        "gemini_configured": chat_agent is not None,
        "rag_enabled": rag_retriever is not None,
        "documents_indexed": is_indexed,
        "index_size": rag_retriever.index_size if rag_retriever else 0,
    }


@app.post("/index")
async def index_documents(background_tasks: BackgroundTasks):
    """
    Index all textbook documents for RAG retrieval.
    Runs in background to avoid blocking.
    """
    global is_indexed

    if not rag_retriever:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    def do_indexing():
        global is_indexed
        try:
            chunks = list(ingest_all_documents())
            indexed = rag_retriever.index_chunks(chunks)
            is_indexed = True
            print(f"Background indexing complete: {indexed} chunks")
        except Exception as e:
            print(f"Background indexing failed: {e}")

    background_tasks.add_task(do_indexing)

    return {
        "message": "Indexing started in background",
        "status": "processing",
    }


@app.get("/index/status")
async def index_status():
    """Get the current indexing status."""
    return {
        "indexed": is_indexed,
        "index_size": rag_retriever.index_size if rag_retriever else 0,
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint with RAG-enhanced responses.

    The chatbot will:
    1. Search for relevant content from the textbook
    2. Use the context to generate an informed response
    3. Return sources used for the answer
    """
    if not chat_agent:
        return ChatResponse(
            response="Chatbot is not configured. Please set GEMINI_API_KEY environment variable.",
            source_documents=[]
        )

    try:
        # Get relevant context from RAG if available
        context = ""
        source_documents = []

        if rag_retriever and is_indexed:
            # Search for relevant content
            results = rag_retriever.search(request.query, top_k=3)

            if results:
                # Build context from results
                context_parts = []
                for result in results:
                    context_parts.append(result.chunk.content)

                    # Add source document info
                    source_documents.append(SourceDocument(
                        title=result.chunk.metadata.get("title", "Textbook"),
                        url=f"/docs/{result.chunk.metadata.get('document_id', 'chapter1')}",
                        excerpt=result.chunk.content[:150] + "..."
                    ))

                context = "\n\n---\n\n".join(context_parts)

        # Generate response
        response_content = chat_agent.generate_response(
            query=request.query,
            selected_text=request.selected_text,
            context=context if context else None,
        )

        return ChatResponse(
            response=response_content,
            source_documents=source_documents
        )

    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(
            response=f"Sorry, I encountered an error: {str(e)}",
            source_documents=[]
        )


@app.post("/search")
async def search_documents(query: str, top_k: int = 5):
    """
    Search for relevant document chunks without generating a response.
    Useful for exploring the knowledge base.
    """
    if not rag_retriever or not is_indexed:
        raise HTTPException(
            status_code=503,
            detail="RAG system not initialized or documents not indexed"
        )

    try:
        results = rag_retriever.search(query, top_k=top_k)

        return {
            "query": query,
            "results": [
                {
                    "content": r.chunk.content,
                    "score": r.score,
                    "rank": r.rank,
                    "metadata": r.chunk.metadata,
                }
                for r in results
            ],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
