# Path: backend/tests/unit/rag_test.py

import pytest
from unittest.mock import MagicMock, patch
from backend.rag_chatbot.qdrant_client import QdrantManager
from backend.rag_chatbot.gemini_agent import GeminiAgent
from backend.rag_chatbot.skill_manager import SkillManager

# Mock environment variables for testing
@pytest.fixture(autouse=True)
def mock_env_vars(monkeypatch):
    monkeypatch.setenv("QDRANT_HOST", "http://localhost:6333")
    monkeypatch.setenv("QDRANT_API_KEY", "test_qdrant_key")
    monkeypatch.setenv("GEMINI_API_KEY", "test_gemini_key")

@pytest.fixture
def mock_qdrant_client():
    with patch('qdrant_client.QdrantClient') as mock:
        yield mock

@pytest.fixture
def mock_gemini_client():
    with patch('google.generativeai.GenerativeModel') as mock:
        yield mock

@pytest.fixture
def mock_skill_manager():
    sm = SkillManager(skills_dir="./backend/skills")
    # Manually add a mock skill for testing if not loaded dynamically
    sm.skills["mock_skill"] = {
        "metadata": {"name": "mock_skill", "description": "A mock skill", "parameters": {"type": "object", "properties": {}}},
        "function": lambda: "Mock skill output"
    }
    return sm

def test_qdrant_manager_init(mock_qdrant_client):
    manager = QdrantManager(host="test_host", api_key="test_key")
    mock_qdrant_client.assert_called_once_with(host="test_host", api_key="test_key")
    assert manager.collection_name == "my_ai_textbook"

def test_qdrant_manager_recreate_collection(mock_qdrant_client):
    manager = QdrantManager(host="test_host", api_key="test_key")
    manager.recreate_collection(vector_size=100, distance_metric=MagicMock())
    mock_qdrant_client.return_value.recreate_collection.assert_called_once()

def test_qdrant_manager_upsert_vectors(mock_qdrant_client):
    manager = QdrantManager(host="test_host", api_key="test_key")
    ids = ["1"]
    vectors = [[0.1]*1536]
    payloads = [{'content': 'test'}]
    manager.upsert_vectors(ids, vectors, payloads)
    mock_qdrant_client.return_value.upsert.assert_called_once()

def test_gemini_agent_init(mock_gemini_client):
    agent = GeminiAgent(api_key="test_key")
    mock_gemini_client.assert_called_once_with(model_name="gemini-pro")
    assert agent.model == "gemini-pro"

def test_gemini_agent_generate_response_no_tool(mock_gemini_client):
    mock_response = MagicMock()
    mock_response.text = "Test response."
    mock_response.candidates = [] # No tool calls
    mock_gemini_client.return_value.generate_content.return_value = mock_response

    agent = GeminiAgent(api_key="test_key")
    response = agent.generate_response("Hello", ["context"])
    assert response == "Test response."
    mock_gemini_client.return_value.generate_content.assert_called_once()

def test_gemini_agent_generate_response_with_tool_call(mock_gemini_client, mock_skill_manager):
    # Mock the first response to contain a tool call
    mock_tool_call_part = MagicMock()
    mock_tool_call_part.function_call.name = "mock_skill"
    mock_tool_call_part.function_call.args = {}

    mock_first_response = MagicMock()
    mock_first_response.candidates = [MagicMock(content=MagicMock(parts=[mock_tool_call_part]))]

    # Mock the second response after tool execution
    mock_second_response = MagicMock()
    mock_second_response.text = "Tool executed response."

    mock_gemini_client.return_value.generate_content.side_effect = [
        mock_first_response,
        mock_second_response
    ]

    agent = GeminiAgent(api_key="test_key", skill_manager=mock_skill_manager)
    response = agent.generate_response("Use a tool", ["context"])

    assert response == "Tool executed response."
    assert mock_gemini_client.return_value.generate_content.call_count == 2

def test_skill_manager_load_skills():
    # Assuming backend/skills exists and contains read_glossary.py
    sm = SkillManager(skills_dir="./backend/skills")
    assert "read_glossary_term" in sm.skills
    assert sm.skills["read_glossary_term"]["metadata"]["name"] == "read_glossary_term"

def test_skill_manager_execute_skill():
    sm = SkillManager(skills_dir="./backend/skills")
    result = sm.execute_skill("read_glossary_term", term="Docusaurus")
    assert "A static site generator" in result


