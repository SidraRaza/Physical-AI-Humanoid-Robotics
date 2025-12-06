# Path: backend/tests/unit/rag_test.py

import pytest
from unittest.mock import MagicMock, patch
from backend.rag_chatbot.qdrant_client import QdrantManager
from backend.rag_chatbot.openai_agent import OpenAIAgent
from backend.rag_chatbot.skill_manager import SkillManager

# Mock environment variables for testing
@pytest.fixture(autouse=True)
def mock_env_vars(monkeypatch):
    monkeypatch.setenv("QDRANT_HOST", "http://localhost:6333")
    monkeypatch.setenv("QDRANT_API_KEY", "test_qdrant_key")
    monkeypatch.setenv("OPENAI_API_KEY", "test_openai_key")

@pytest.fixture
def mock_qdrant_client():
    with patch('qdrant_client.QdrantClient') as mock:
        yield mock

@pytest.fixture
def mock_openai_client():
    with patch('openai.OpenAI') as mock:
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

def test_openai_agent_init(mock_openai_client):
    agent = OpenAIAgent(api_key="test_key")
    mock_openai_client.assert_called_once_with(api_key="test_key")
    assert agent.model == "gpt-3.5-turbo"

def test_openai_agent_generate_response_no_tool(mock_openai_client):
    mock_completion = MagicMock()
    mock_completion.choices[0].message.content = "Test response."
    mock_completion.choices[0].message.tool_calls = None
    mock_openai_client.return_value.chat.completions.create.return_value = mock_completion

    agent = OpenAIAgent(api_key="test_key")
    response = agent.generate_response("Hello", ["context"])
    assert response == "Test response."
    mock_openai_client.return_value.chat.completions.create.assert_called_once()

def test_openai_agent_generate_response_with_tool_call(mock_openai_client, mock_skill_manager):
    # First response: call a tool
    mock_tool_call_response = MagicMock()
    mock_tool_call_response.choices[0].message.tool_calls = [MagicMock()]
    mock_tool_call_response.choices[0].message.tool_calls[0].function.name = "mock_skill"
    mock_tool_call_response.choices[0].message.tool_calls[0].function.arguments = "{}"
    mock_tool_call_response.choices[0].message.id = "call_123"
    mock_openai_client.return_value.chat.completions.create.side_effect = [
        mock_tool_call_response,
        MagicMock(choices=[MagicMock(message=MagicMock(content="Tool executed response."))])
    ]

    agent = OpenAIAgent(api_key="test_key", skill_manager=mock_skill_manager)
    response = agent.generate_response("Use a tool", ["context"])
    assert response == "Tool executed response."
    assert mock_openai_client.return_value.chat.completions.create.call_count == 2

def test_skill_manager_load_skills():
    # Assuming backend/skills exists and contains read_glossary.py
    sm = SkillManager(skills_dir="./backend/skills")
    assert "read_glossary_term" in sm.skills
    assert sm.skills["read_glossary_term"]["metadata"]["name"] == "read_glossary_term"

def test_skill_manager_execute_skill():
    sm = SkillManager(skills_dir="./backend/skills")
    result = sm.execute_skill("read_glossary_term", term="Docusaurus")
    assert "A static site generator" in result


