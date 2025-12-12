# Task Runner - Unified utility for running tasks
# Provides standardized error handling, logging, and async execution

from typing import Any, Callable, Dict, List, Optional, TypeVar, Generic
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import asyncio
import logging
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

T = TypeVar('T')


class TaskStatus(Enum):
    """Status of a task execution."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class TaskResult(Generic[T]):
    """
    Represents the result of a task execution.

    Attributes:
        success: Whether the task completed successfully
        data: The result data if successful
        error: Error message if failed
        execution_time_ms: Time taken to execute in milliseconds
        metadata: Additional metadata about the execution
    """
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None
    execution_time_ms: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary."""
        return {
            "success": self.success,
            "data": self.data,
            "error": self.error,
            "execution_time_ms": self.execution_time_ms,
            "metadata": self.metadata,
        }


@dataclass
class TaskDefinition:
    """
    Definition of a task that can be executed.

    Attributes:
        name: Unique name of the task
        func: The function to execute
        description: Human-readable description
        is_async: Whether the function is async
        timeout_seconds: Maximum execution time
        retry_count: Number of retries on failure
    """
    name: str
    func: Callable
    description: str = ""
    is_async: bool = False
    timeout_seconds: float = 30.0
    retry_count: int = 0


class TaskRunner:
    """
    Unified task runner for executing tasks with standardized handling.

    Features:
    - Sync and async task support
    - Automatic error handling and logging
    - Execution timing
    - Retry logic
    - Task registry

    Usage:
        runner = TaskRunner()

        # Register a task
        runner.register("my_task", my_function, description="Does something")

        # Run the task
        result = await runner.run("my_task", arg1="value1")
    """

    def __init__(self):
        self._tasks: Dict[str, TaskDefinition] = {}
        self._execution_history: List[Dict[str, Any]] = []

    def register(
        self,
        name: str,
        func: Callable,
        description: str = "",
        is_async: bool = False,
        timeout_seconds: float = 30.0,
        retry_count: int = 0,
    ) -> None:
        """
        Register a task for execution.

        Args:
            name: Unique task name
            func: Function to execute
            description: Task description
            is_async: Whether function is async
            timeout_seconds: Timeout for execution
            retry_count: Number of retries on failure
        """
        self._tasks[name] = TaskDefinition(
            name=name,
            func=func,
            description=description,
            is_async=is_async,
            timeout_seconds=timeout_seconds,
            retry_count=retry_count,
        )
        logger.info(f"Registered task: {name}")

    def get_registered_tasks(self) -> List[Dict[str, str]]:
        """Get list of registered tasks with descriptions."""
        return [
            {"name": t.name, "description": t.description}
            for t in self._tasks.values()
        ]

    async def run(
        self,
        task_name: str,
        **kwargs: Any,
    ) -> TaskResult:
        """
        Run a registered task.

        Args:
            task_name: Name of the task to run
            **kwargs: Arguments to pass to the task function

        Returns:
            TaskResult with execution details
        """
        if task_name not in self._tasks:
            return TaskResult(
                success=False,
                error=f"Task '{task_name}' not found",
                metadata={"available_tasks": list(self._tasks.keys())},
            )

        task = self._tasks[task_name]
        start_time = datetime.now()
        attempts = 0
        last_error = None

        while attempts <= task.retry_count:
            attempts += 1
            try:
                logger.info(f"Running task '{task_name}' (attempt {attempts})")

                # Execute with timeout
                if task.is_async:
                    result = await asyncio.wait_for(
                        task.func(**kwargs),
                        timeout=task.timeout_seconds,
                    )
                else:
                    # Run sync function in executor to allow timeout
                    loop = asyncio.get_event_loop()
                    result = await asyncio.wait_for(
                        loop.run_in_executor(None, lambda: task.func(**kwargs)),
                        timeout=task.timeout_seconds,
                    )

                execution_time = (datetime.now() - start_time).total_seconds() * 1000

                task_result = TaskResult(
                    success=True,
                    data=result,
                    execution_time_ms=execution_time,
                    metadata={
                        "task_name": task_name,
                        "attempts": attempts,
                    },
                )

                self._log_execution(task_name, task_result)
                return task_result

            except asyncio.TimeoutError:
                last_error = f"Task timed out after {task.timeout_seconds}s"
                logger.warning(f"Task '{task_name}' timed out")

            except Exception as e:
                last_error = str(e)
                logger.error(f"Task '{task_name}' failed: {e}")
                logger.debug(traceback.format_exc())

        # All attempts failed
        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        task_result = TaskResult(
            success=False,
            error=last_error,
            execution_time_ms=execution_time,
            metadata={
                "task_name": task_name,
                "attempts": attempts,
            },
        )

        self._log_execution(task_name, task_result)
        return task_result

    def run_sync(self, task_name: str, **kwargs: Any) -> TaskResult:
        """
        Run a task synchronously (blocking).

        Args:
            task_name: Name of the task to run
            **kwargs: Arguments to pass to the task function

        Returns:
            TaskResult with execution details
        """
        return asyncio.run(self.run(task_name, **kwargs))

    def _log_execution(self, task_name: str, result: TaskResult) -> None:
        """Log task execution to history."""
        self._execution_history.append({
            "task_name": task_name,
            "timestamp": datetime.now().isoformat(),
            "success": result.success,
            "execution_time_ms": result.execution_time_ms,
            "error": result.error,
        })

        # Keep only last 100 executions
        if len(self._execution_history) > 100:
            self._execution_history = self._execution_history[-100:]

    def get_execution_history(
        self,
        task_name: Optional[str] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Get task execution history.

        Args:
            task_name: Filter by task name (optional)
            limit: Maximum number of entries to return

        Returns:
            List of execution history entries
        """
        history = self._execution_history
        if task_name:
            history = [h for h in history if h["task_name"] == task_name]
        return history[-limit:]


# Global task runner instance
default_runner = TaskRunner()


def task(
    name: Optional[str] = None,
    description: str = "",
    timeout_seconds: float = 30.0,
    retry_count: int = 0,
):
    """
    Decorator to register a function as a task.

    Usage:
        @task(name="my_task", description="Does something")
        def my_function(arg1: str) -> str:
            return f"Result: {arg1}"
    """
    def decorator(func: Callable) -> Callable:
        task_name = name or func.__name__
        is_async = asyncio.iscoroutinefunction(func)

        default_runner.register(
            name=task_name,
            func=func,
            description=description or func.__doc__ or "",
            is_async=is_async,
            timeout_seconds=timeout_seconds,
            retry_count=retry_count,
        )

        return func

    return decorator
