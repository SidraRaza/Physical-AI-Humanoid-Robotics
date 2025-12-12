# Path: backend/rag_chatbot/gemini_chat_agent.py

import google.generativeai as genai
from typing import Optional


class GeminiChatAgent:
    """Agent that uses Google's Gemini API for chat responses."""

    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        """
        Initialize the Gemini agent.

        Args:
            api_key: Google AI API key
            model: Model to use (default: gemini-1.5-flash - fast and free)
        """
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name=model,
            system_instruction="""You are a helpful AI learning assistant for a Deep Learning textbook.
Your role is to:
- Answer questions about deep learning, neural networks, AI, and machine learning concepts
- Explain complex topics in a beginner-friendly way
- Provide examples and analogies to help understanding
- Be encouraging and supportive of learners at all levels

Keep responses concise but informative. Use markdown formatting when helpful."""
        )

    def generate_response(
        self,
        query: str,
        selected_text: Optional[str] = None,
    ) -> str:
        """
        Generate a response using Gemini.

        Args:
            query: The user's question
            selected_text: Optional text selected by the user for context

        Returns:
            The generated response text
        """
        # Build the user message
        if selected_text:
            user_message = f"The user has selected this text from the textbook:\n\n\"{selected_text}\"\n\nTheir question is: {query}"
        else:
            user_message = query

        try:
            response = self.model.generate_content(user_message)

            if response.text:
                return response.text
            return "I apologize, but I couldn't generate a response. Please try again."

        except Exception as e:
            error_msg = str(e)
            if "quota" in error_msg.lower():
                return "Error: API quota exceeded. Please wait a moment and try again."
            elif "invalid" in error_msg.lower() and "key" in error_msg.lower():
                return "Error: Invalid API key. Please check your GEMINI_API_KEY."
            else:
                return f"Error: {error_msg}"
