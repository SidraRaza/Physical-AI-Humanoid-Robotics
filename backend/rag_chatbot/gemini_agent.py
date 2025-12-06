# Path: backend/rag_chatbot/openai_agent.py

# Placeholder for OpenAI API interactions, e.g., generating responses based on retrieved context.

import google.generativeai as genai
from typing import List, Dict, Any, Optional
import json
from backend.rag_chatbot.skill_manager import SkillManager

class GeminiAgent:
    def __init__(self, api_key: str, model: str = "gemini-pro", skill_manager: Optional[SkillManager] = None):
        genai.configure(api_key=api_key)
        self.client = genai.GenerativeModel(model_name=model)
        self.model = model
        self.skill_manager = skill_manager

    def generate_response(self, prompt: str, context: List[str]) -> str:
        system_instruction = "You are a helpful assistant that answers questions based on the provided context and can use tools."

        # Prepare content parts
        parts = []
        if context:
            parts.append(f"Context: {context}")
        parts.append(f"Question: {prompt}")

        # Prepare tools for Gemini
        gemini_tools = []
        if self.skill_manager:
            for skill_name, skill_meta in self.skill_manager.get_skill_metadata().items():
                # Convert OpenAI tool format to Gemini tool format
                gemini_tools.append(genai.types.Tool(function_declarations=[genai.types.FunctionDeclaration(
                    name=skill_meta["name"],
                    description=skill_meta["description"],
                    parameters=skill_meta["parameters"]
                )]))

        # Initial chat generation
        response = self.client.generate_content(
            contents=[{"role": "user", "parts": parts}],
            tools=gemini_tools if gemini_tools else None,
            system_instruction=system_instruction
        )

        # Handle tool calls
        try:
            tool_calls = response.candidates[0].content.parts
        except (AttributeError, IndexError):
            tool_calls = []

        if tool_calls:
            function_call_part = next((part for part in tool_calls if part.function_call), None)

            if function_call_part and self.skill_manager:
                function_name = function_call_part.function_call.name
                function_args = {k: v for k, v in function_call_part.function_call.args.items()} # Convert to dict

                if function_name in self.skill_manager.skills:
                    print(f"Executing tool: {function_name} with args {function_args}")
                    tool_output = self.skill_manager.execute_skill(function_name, **function_args)

                    # Follow-up generation with tool output
                    follow_up_response = self.client.generate_content(
                        contents=[
                            {"role": "user", "parts": parts},
                            {"role": "model", "parts": tool_calls},
                            {"role": "user", "parts": [genai.types.ToolCode(text=str(tool_output))]}
                        ],
                        system_instruction=system_instruction
                    )
                    return follow_up_response.text.strip()
                else:
                    return f"Error: Tool {function_name} not found or not managed."
            else:
                return response.text.strip()
        else:
            return response.text.strip()