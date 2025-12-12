# Tasks System - Reusable intelligent task functions
# This module provides modular, reusable task functions that can be used by
# the RAG chatbot and other application features.

from .task_runner import TaskRunner, TaskResult
from .ai_tasks import (
    generate_response,
    summarize_text,
    extract_key_concepts,
    generate_explanation,
)
from .data_tasks import (
    fetch_chapter_content,
    search_textbook,
    get_glossary_term,
)
from .workflow_tasks import (
    log_user_query,
    format_response_with_sources,
    create_learning_path,
)

__all__ = [
    # Task Runner
    'TaskRunner',
    'TaskResult',
    # AI Tasks
    'generate_response',
    'summarize_text',
    'extract_key_concepts',
    'generate_explanation',
    # Data Tasks
    'fetch_chapter_content',
    'search_textbook',
    'get_glossary_term',
    # Workflow Tasks
    'log_user_query',
    'format_response_with_sources',
    'create_learning_path',
]
