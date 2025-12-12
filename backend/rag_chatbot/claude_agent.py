# Path: backend/rag_chatbot/claude_agent.py

import anthropic
from typing import Optional


class ClaudeAgent:
    """Agent that uses Anthropic's Claude API for chat responses."""

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-20250514"):
        """
        Initialize the Claude agent.

        Args:
            api_key: Anthropic API key
            model: Model to use (default: claude-sonnet-4-20250514)
        """
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = model
        self.system_prompt = """You are a helpful AI learning assistant for a Deep Learning textbook.
Your role is to:
- Answer questions about deep learning, neural networks, AI, and machine learning concepts
- Explain complex topics in a beginner-friendly way
- Provide examples and analogies to help understanding
- Be encouraging and supportive of learners at all levels

Keep responses concise but informative. Use markdown formatting when helpful."""

    def generate_response(
        self,
        query: str,
        selected_text: Optional[str] = None,
        max_tokens: int = 1024
    ) -> str:
        """
        Generate a response using Claude.

        Args:
            query: The user's question
            selected_text: Optional text selected by the user for context
            max_tokens: Maximum tokens in response

        Returns:
            The generated response text
        """
        # Build the user message
        if selected_text:
            user_message = f"The user has selected this text from the textbook:\n\n\"{selected_text}\"\n\nTheir question is: {query}"
        else:
            user_message = query

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                system=self.system_prompt,
                messages=[
                    {"role": "user", "content": user_message}
                ]
            )

            # Extract text from response
            if message.content and len(message.content) > 0:
                return message.content[0].text
            return "I apologize, but I couldn't generate a response. Please try again."

        except anthropic.APIConnectionError:
            return "Error: Unable to connect to Claude API. Please check your internet connection."
        except anthropic.RateLimitError:
            return "Error: Rate limit exceeded. Please wait a moment and try again."
        except anthropic.APIStatusError as e:
            return f"Error: API error occurred - {e.message}"
        except Exception as e:
            return f"Error: An unexpected error occurred - {str(e)}"
