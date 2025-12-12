# Gemini Chat Agent - AI response generation with RAG support

import google.generativeai as genai
from typing import Optional


class GeminiChatAgent:
    """Agent that uses Google's Gemini API for chat responses with RAG support."""

    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        """
        Initialize the Gemini agent.

        Args:
            api_key: Google AI API key
            model: Model to use (default: gemini-2.0-flash - fast and capable)
        """
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name=model,
            system_instruction="""You are a helpful AI learning assistant for a Physical AI and Deep Learning textbook.

Your role is to:
- Answer questions about deep learning, neural networks, AI, machine learning, and robotics
- Explain complex topics in a beginner-friendly way
- Provide examples and analogies to help understanding
- Be encouraging and supportive of learners at all levels
- When context from the textbook is provided, base your answers on that content
- If the context doesn't contain relevant information, acknowledge this and provide general knowledge

Guidelines:
- Keep responses concise but informative
- Use markdown formatting for better readability
- Include code examples when helpful (use Python)
- Cite specific concepts from the provided context when relevant
- If unsure, acknowledge uncertainty rather than making up information"""
        )

    def generate_response(
        self,
        query: str,
        selected_text: Optional[str] = None,
        context: Optional[str] = None,
    ) -> str:
        """
        Generate a response using Gemini with optional RAG context.

        Args:
            query: The user's question
            selected_text: Optional text selected by the user for context
            context: Optional RAG-retrieved context from the textbook

        Returns:
            The generated response text
        """
        # Build the prompt with available context
        prompt_parts = []

        # Add RAG context if available
        if context:
            prompt_parts.append(
                "Here is relevant content from the textbook that may help answer the question:\n\n"
                f"{context}\n\n"
                "---\n"
            )

        # Add selected text if available
        if selected_text:
            prompt_parts.append(
                f"The user has selected this specific text from the textbook:\n"
                f'"{selected_text}"\n\n'
            )

        # Add the user's question
        if selected_text or context:
            prompt_parts.append(f"User's question: {query}")
        else:
            prompt_parts.append(query)

        # Add instruction for using context
        if context:
            prompt_parts.append(
                "\n\nPlease answer based on the provided textbook content when relevant. "
                "If the context doesn't fully address the question, you may supplement with general knowledge."
            )

        full_prompt = "\n".join(prompt_parts)

        try:
            response = self.model.generate_content(full_prompt)

            if response.text:
                return response.text
            return "I apologize, but I couldn't generate a response. Please try again."

        except Exception as e:
            error_msg = str(e)
            if "quota" in error_msg.lower():
                return "Error: API quota exceeded. Please wait a moment and try again."
            elif "invalid" in error_msg.lower() and "key" in error_msg.lower():
                return "Error: Invalid API key. Please check your GEMINI_API_KEY."
            elif "safety" in error_msg.lower():
                return "I apologize, but I cannot respond to that query. Please try rephrasing your question."
            else:
                return f"Error: {error_msg}"

    def generate_with_history(
        self,
        messages: list,
        context: Optional[str] = None,
    ) -> str:
        """
        Generate a response with conversation history.

        Args:
            messages: List of message dicts with 'role' and 'content'
            context: Optional RAG context

        Returns:
            The generated response
        """
        # Start a chat session
        chat = self.model.start_chat(history=[])

        # Add context as first message if available
        if context:
            chat.send_message(
                f"Context from textbook:\n{context}\n\n"
                "Please use this context to help answer the following questions."
            )

        # Send all previous messages
        for msg in messages[:-1]:
            if msg.get("role") == "user":
                chat.send_message(msg.get("content", ""))

        # Get response for the last message
        last_message = messages[-1].get("content", "") if messages else ""

        try:
            response = chat.send_message(last_message)
            return response.text if response.text else "I couldn't generate a response."
        except Exception as e:
            return f"Error: {str(e)}"
