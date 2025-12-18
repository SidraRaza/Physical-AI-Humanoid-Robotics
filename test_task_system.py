#!/usr/bin/env python3
"""
Test script to verify the optimized reusable intelligence system.
This tests the task runner integration and skill management.
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'frontend', 'backend'))

from tasks import get_task_runner, register_task_from_module
from tasks import ai_tasks, data_tasks, workflow_tasks

def test_task_runner():
    """Test the task runner functionality."""
    print("Testing Task Runner...")

    # Get the global task runner
    runner = get_task_runner()

    # Register tasks from modules
    register_task_from_module(ai_tasks)
    register_task_from_module(data_tasks)
    register_task_from_module(workflow_tasks)

    # List registered tasks
    tasks = runner.get_registered_tasks()
    print(f"Registered {len(tasks)} tasks:")
    for task in tasks[:10]:  # Show first 10
        print(f"  - {task['name']}: {task['description']}")
    if len(tasks) > 10:
        print(f"  ... and {len(tasks) - 10} more")

    # Test a simple workflow task
    print("\nTesting validate_query task...")
    result = runner.run_sync(
        "validate_query",
        query="This is a test query",
        min_length=5,
        max_length=100
    )
    print(f"Validation result: {result.success}")
    if result.success:
        print(f"Validation data: {result.data}")

    # Test a data task
    print("\nTesting list_chapters task...")
    try:
        result = runner.run_sync("list_chapters")
        print(f"List chapters result: {result.success}")
        if result.success:
            chapters = result.data
            print(f"Found {len(chapters) if chapters else 0} chapters")
    except Exception as e:
        print(f"List chapters failed: {e}")

    print("Task Runner test completed.\n")

def test_manual_function_calls():
    """Test calling functions directly."""
    print("Testing direct function calls...")

    # Test a simple function
    from tasks.workflow_tasks import validate_query

    result = validate_query("Test query", min_length=3, max_length=1000)
    print(f"Direct validate_query call: {result['valid']}")

    print("Direct function test completed.\n")

if __name__ == "__main__":
    print("Testing Optimized Reusable Intelligence System\n")
    print("=" * 50)

    test_task_runner()
    test_manual_function_calls()

    print("=" * 50)
    print("All tests completed!")