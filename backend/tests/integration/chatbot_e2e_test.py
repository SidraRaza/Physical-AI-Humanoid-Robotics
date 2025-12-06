# Path: backend/tests/integration/chatbot_e2e_test.py

import pytest
from httpx import AsyncClient
from backend.main import app

@pytest.mark.asyncio
async def test_read_root():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the FastAPI backend!"}

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Backend is healthy"}

@pytest.mark.asyncio
async def test_chat_endpoint_missing_env_vars():
    # Temporarily unset env vars for this test
    import os
    original_q_host = os.getenv("QDRANT_HOST")
    original_q_key = os.getenv("QDRANT_API_KEY")
    original_o_key = os.getenv("OPENAI_API_KEY")

    os.environ.pop("QDRANT_HOST", None)
    os.environ.pop("QDRANT_API_KEY", None)
    os.environ.pop("OPENAI_API_KEY", None)

    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/chat", json={
            "query": "What is Docusaurus?",
            "selected_text": None
        })
    assert response.status_code == 200
    assert response.json()["response"] == "RAG chatbot is not fully configured. Please check environment variables."

    # Restore env vars
    if original_q_host: os.environ["QDRANT_HOST"] = original_q_host
    if original_q_key: os.environ["QDRANT_API_KEY"] = original_q_key
    if original_o_key: os.environ["OPENAI_API_KEY"] = original_o_key

@pytest.mark.asyncio
async def test_chat_endpoint_with_query():
    # This test assumes env vars are set, and mocks Qdrant and OpenAI interactions.
    # In a real E2E test, these would be live.
    with patch('backend.rag_chatbot.qdrant_client.QdrantManager.search_vectors') as mock_search,
         patch('backend.rag_chatbot.openai_agent.OpenAIAgent.generate_response') as mock_generate:

        mock_search.return_value = [
            {"payload": {"title": "Test Doc 1", "url": "#1", "excerpt": "This is test content 1."}},
            {"payload": {"title": "Test Doc 2", "url": "#2", "excerpt": "This is test content 2."}}
        ]
        mock_generate.return_value = "Mocked AI response based on context."

        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post("/chat", json={
                "query": "Tell me about tests.",
                "selected_text": None
            })

        assert response.status_code == 200
        assert "Mocked AI response" in response.json()["response"]
        assert len(response.json()["source_documents"]) == 2

@pytest.mark.asyncio
async def test_chat_endpoint_with_selected_text():
    with patch('backend.rag_chatbot.qdrant_client.QdrantManager.search_vectors') as mock_search,
         patch('backend.rag_chatbot.openai_agent.OpenAIAgent.generate_response') as mock_generate:

        mock_search.return_value = [
            {"payload": {"title": "Selected Doc", "url": "#selected", "excerpt": "Content related to selected text."}}
        ]
        mock_generate.return_value = "Mocked AI response based on selected text and query."

        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post("/chat", json={
                "query": "Explain this.",
                "selected_text": "Highlighted text segment."
            })

        assert response.status_code == 200
        assert "Mocked AI response" in response.json()["response"]
        assert len(response.json()["source_documents"]) == 1
