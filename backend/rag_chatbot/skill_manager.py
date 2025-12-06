# Path: backend/rag_chatbot/skill_manager.py

import importlib.util
import os
from typing import Dict, Any, Callable

class SkillManager:
    def __init__(self, skills_dir: str = "backend/skills"):
        self.skills_dir = skills_dir
        self.skills: Dict[str, Dict[str, Any]] = {}
        self._load_skills()

    def _load_skills(self):
        if not os.path.exists(self.skills_dir):
            print(f"Warning: Skills directory not found: {self.skills_dir}")
            return

        for filename in os.listdir(self.skills_dir):
            if filename.endswith('.py') and not filename.startswith('__'):
                module_name = filename[:-3] # Remove .py extension
                file_path = os.path.join(self.skills_dir, filename)

                spec = importlib.util.spec_from_file_location(module_name, file_path)
                if spec and spec.loader:
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)

                    if hasattr(module, 'SKILL_METADATA') and hasattr(module, module.SKILL_METADATA['name']):
                        skill_function = getattr(module, module.SKILL_METADATA['name'])
                        self.skills[module.SKILL_METADATA['name']] = {
                            "metadata": module.SKILL_METADATA,
                            "function": skill_function
                        }
                        print(f"Loaded skill: {module.SKILL_METADATA['name']}")
                    else:
                        print(f"Warning: Skill metadata or function not found in {filename}")

    def get_skill_metadata(self) -> Dict[str, Any]:
        return {name: skill["metadata"] for name, skill in self.skills.items()}

    def execute_skill(self, skill_name: str, **kwargs) -> Any:
        skill_info = self.skills.get(skill_name)
        if skill_info:
            return skill_info["function"](**kwargs)
        raise ValueError(f"Skill '{skill_name}' not found.")
