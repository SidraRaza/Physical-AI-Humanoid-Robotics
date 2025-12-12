# C:/Users/ahed8/my-ai-textbook/backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from rag_chatbot.model import ChatRequest, ChatResponse
from rag_chatbot.gemini_chat_agent import GeminiChatAgent

load_dotenv()  # Load environment variables from .env file

app = FastAPI(
    title="Physical AI Textbook API",
    description="Backend API for the Physical AI Textbook chatbot powered by Gemini",
    version="1.0.0"
)

# Retrieve allowed origins from environment variable, split by comma
allowed_origins_str = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000,https://sidraraza.github.io/Physical-AI-Humanoid-Robotics"
)
origins = [origin.strip() for origin in allowed_origins_str.split(',')]

# Initialize Gemini agent
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not set. Chatbot functionality will be unavailable.")
    chat_agent = None
else:
    chat_agent = GeminiChatAgent(api_key=GEMINI_API_KEY)
    print("Gemini agent initialized successfully.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"message": "Welcome to the Physical AI Textbook API!"}


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "Backend is healthy",
        "gemini_configured": chat_agent is not None
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint that uses Gemini to answer questions about deep learning.
    """
    if not chat_agent:
        return ChatResponse(
            response="Chatbot is not configured. Please set GEMINI_API_KEY environment variable.",
            source_documents=[]
        )

    # Generate response using Gemini
    response_content = chat_agent.generate_response(
        query=request.query,
        selected_text=request.selected_text
    )

    return ChatResponse(response=response_content, source_documents=[])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
