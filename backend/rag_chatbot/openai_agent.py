# Path: backend/rag_chatbot/openai_agent.py

# Placeholder for OpenAI API interactions, e.g., generating responses based on retrieved context.

from openai import OpenAI
from typing import List, Dict, Any, Optional
import json
from backend.rag_chatbot.skill_manager import SkillManager

class OpenAIAgent:
    def __init__(self, api_key: str, model: str = "gpt-3.5-turbo", skill_manager: Optional[SkillManager] = None):
        self.client = OpenAI(api_key=api_key)
        self.model = model
        self.skill_manager = skill_manager

    def generate_response(self, prompt: str, context: List[str]) -> str:
        messages = [
            {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided context and can use tools."},
            {"role": "user", "content": f"Context: {context}\n\nQuestion: {prompt}"}
        ]

        tools = []
        if self.skill_manager:
            for skill_name, skill_meta in self.skill_manager.get_skill_metadata().items():
                tools.append({"type": "function", "function": skill_meta})

        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=tools if tools else None,
            tool_choice="auto" if tools else "none",
            max_tokens=500
        )

        response_message = response.choices[0].message

        if response_message.tool_calls:
            tool_call = response_message.tool_calls[0] # Assuming one tool call for simplicity
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)

            if self.skill_manager and function_name in self.skill_manager.skills:
                print(f"Executing tool: {function_name} with args {function_args}")
                tool_output = self.skill_manager.execute_skill(function_name, **function_args)
                messages.append(response_message)
                messages.append(
                    {
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": str(tool_output),
                    }
                )
                second_response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    max_tokens=500
                )
                return second_response.choices[0].message.content.strip()
            else:
                return f"Error: Tool {function_name} not found or not managed."
        else:
            return response_message.content.strip()