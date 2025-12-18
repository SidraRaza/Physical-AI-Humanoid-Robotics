# Physical AI Textbook API
# Backend API with RAG-powered chatbot and intelligent tasks

from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from rag_chatbot.model import ChatRequest, ChatResponse, SourceDocument
from rag_chatbot.gemini_chat_agent import GeminiChatAgent
from rag_chatbot.retrieval import RAGRetriever, create_retriever
from rag_chatbot.ingestion import ingest_all_documents

# Import Tasks System
from tasks import (
    TaskRunner,
    get_task_runner,
    register_task_from_module,
    # Import the modules to trigger task registration
    ai_tasks,
    data_tasks,
    workflow_tasks
)
# Import functions that are used directly in main.py
from tasks.ai_tasks import (
    generate_response,
    summarize_text,
    extract_key_concepts,
    generate_explanation
)
from tasks.data_tasks import (
    fetch_chapter_content,
    search_textbook,
    get_glossary_term,
    list_chapters
)
from tasks.workflow_tasks import (
    log_user_query,
    format_response_with_sources,
    create_learning_path,
    validate_query,
    build_prompt
)

load_dotenv()  # Load environment variables from .env file

# Global state
rag_retriever: RAGRetriever = None
chat_agent: GeminiChatAgent = None
is_indexed: bool = False
task_runner: TaskRunner = None


# Additional Pydantic models for new endpoints
class SummarizeRequest(BaseModel):
    text: str
    max_sentences: int = 3
    style: str = "concise"


class ExplainRequest(BaseModel):
    concept: str
    level: str = "beginner"
    include_examples: bool = True


class LearningPathRequest(BaseModel):
    topic: str
    current_level: str = "beginner"
    target_level: str = "intermediate"


class ConceptExtractionRequest(BaseModel):
    text: str
    max_concepts: int = 5


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RAG system and tasks on startup."""
    global rag_retriever, chat_agent, is_indexed, task_runner

    # Initialize TaskRunner
    task_runner = get_task_runner()  # Use the global instance
    print("Task runner initialized.")

    # Register all tasks from the modules to ensure they're available
    register_task_from_module(ai_tasks)
    register_task_from_module(data_tasks)
    register_task_from_module(workflow_tasks)
    print("All tasks registered with the task runner.")

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
    description="Backend API for the Physical AI Textbook with RAG-powered chatbot and intelligent tasks",
    version="2.1.0",
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


# ==================== TASK-BASED ENDPOINTS ====================


@app.get("/api/chapters")
async def get_chapters():
    """List all available textbook chapters."""
    chapters = list_chapters()
    return {"chapters": chapters, "count": len(chapters)}


@app.get("/api/chapter/{chapter_id}")
async def get_chapter(chapter_id: str, section: Optional[str] = None):
    """
    Get content from a specific chapter.

    Args:
        chapter_id: Chapter identifier (e.g., 'chapter1')
        section: Optional section title to extract
    """
    result = fetch_chapter_content(chapter_id, section)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error"))
    return result


@app.get("/api/glossary/{term}")
async def get_term(term: str):
    """Look up a term in the glossary."""
    result = get_glossary_term(term)
    return result


@app.post("/api/summarize")
async def summarize_content(request: SummarizeRequest):
    """
    Summarize a piece of text.

    Args:
        text: Text to summarize
        max_sentences: Maximum sentences in summary (default: 3)
        style: Summary style ('concise', 'detailed', 'bullet_points')
    """
    if not chat_agent:
        raise HTTPException(status_code=503, detail="AI service not configured")

    try:
        summary = summarize_text(
            text=request.text,
            max_sentences=request.max_sentences,
            style=request.style
        )
        return {"success": True, "summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/explain")
async def explain_concept(request: ExplainRequest):
    """
    Generate an explanation for a concept at a specific difficulty level.

    Args:
        concept: The concept to explain
        level: Difficulty level ('beginner', 'intermediate', 'advanced')
        include_examples: Whether to include examples
    """
    if not chat_agent:
        raise HTTPException(status_code=503, detail="AI service not configured")

    try:
        explanation = generate_explanation(
            concept=request.concept,
            level=request.level,
            include_examples=request.include_examples
        )
        return {"success": True, "explanation": explanation, "concept": request.concept, "level": request.level}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/extract-concepts")
async def extract_concepts(request: ConceptExtractionRequest):
    """
    Extract key concepts from a piece of text.

    Args:
        text: Text to analyze
        max_concepts: Maximum number of concepts to extract
    """
    if not chat_agent:
        raise HTTPException(status_code=503, detail="AI service not configured")

    try:
        concepts = extract_key_concepts(
            text=request.text,
            max_concepts=request.max_concepts
        )
        return {"success": True, "concepts": concepts, "count": len(concepts)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/learning-path")
async def get_learning_path(request: LearningPathRequest):
    """
    Create a suggested learning path for a topic.

    Args:
        topic: Topic to learn
        current_level: Current knowledge level
        target_level: Target knowledge level
    """
    path = create_learning_path(
        topic=request.topic,
        current_level=request.current_level,
        target_level=request.target_level
    )
    return path


@app.get("/api/search")
async def search_content(
    q: str = Query(..., description="Search query"),
    max_results: int = Query(5, ge=1, le=20, description="Maximum results"),
    chapter: Optional[str] = Query(None, description="Filter by chapter")
):
    """
    Search the textbook content.

    Args:
        q: Search query
        max_results: Maximum number of results (1-20)
        chapter: Optional chapter filter
    """
    results = search_textbook(
        query=q,
        max_results=max_results,
        chapter_filter=chapter
    )
    return {"query": q, "results": results, "count": len(results)}


@app.get("/api/tasks")
async def list_tasks():
    """List all available task functions."""
    if task_runner:
        available_tasks = task_runner.get_registered_tasks()
        task_list = [
            {
                "name": task["name"],
                "description": task["description"],
            }
            for task in available_tasks
        ]
    else:
        # Fallback list if task runner is not initialized
        task_list = [
            {
                "name": "summarize",
                "description": "Summarize text content",
            },
            {
                "name": "explain",
                "description": "Explain a concept at specified difficulty",
            },
            {
                "name": "extract-concepts",
                "description": "Extract key concepts from text",
            },
            {
                "name": "learning-path",
                "description": "Generate a learning path for a topic",
            },
            {
                "name": "search",
                "description": "Search textbook content",
            },
            {
                "name": "glossary",
                "description": "Look up term definitions",
            },
            {
                "name": "chapters",
                "description": "List or get chapter content",
            },
        ]

    return {
        "tasks": task_list,
        "count": len(task_list)
    }


@app.post("/api/tasks/{task_name}")
async def execute_task(task_name: str, task_params: Dict[str, Any] = {}):
    """Execute a specific task by name with provided parameters."""
    if not task_runner:
        raise HTTPException(status_code=503, detail="Task runner not initialized")

    try:
        result = await task_runner.run(task_name, **task_params)
        return {
            "success": result.success,
            "data": result.data,
            "error": result.error,
            "execution_time_ms": result.execution_time_ms,
            "metadata": result.metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
