# Tasks System - Reusable intelligent task functions
# This module provides modular, reusable task functions that can be used by
# the RAG chatbot and other application features.

from .task_runner import TaskRunner, TaskResult, get_task_runner, register_task_from_module
from .ai_tasks import (
    generate_response,
    summarize_text,
    extract_key_concepts,
    generate_explanation,
    analyze_code,
    translate_to_simple,
)
from .data_tasks import (
    fetch_chapter_content,
    search_textbook,
    get_glossary_term,
    list_chapters,
)
from .workflow_tasks import (
    log_user_query,
    format_response_with_sources,
    create_learning_path,
    validate_query,
    build_prompt,
)

__all__ = [
    # Task Runner
    'TaskRunner',
    'TaskResult',
    'get_task_runner',
    'register_task_from_module',
    # AI Tasks
    'generate_response',
    'summarize_text',
    'extract_key_concepts',
    'generate_explanation',
    'analyze_code',
    'translate_to_simple',
    # Data Tasks
    'fetch_chapter_content',
    'search_textbook',
    'get_glossary_term',
    'list_chapters',
    # Workflow Tasks
    'log_user_query',
    'format_response_with_sources',
    'create_learning_path',
    'validate_query',
    'build_prompt',
]
