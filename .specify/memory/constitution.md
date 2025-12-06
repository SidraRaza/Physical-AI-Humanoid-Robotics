<!-- Sync Impact Report
Version change: None → 1.0.0
List of modified principles:
  - None
Added sections:
  - Constraints
  - Key Features
Removed sections:
  - None
Templates requiring updates:
  - .specify/templates/plan-template.md: ⚠ pending
  - .specify/templates/spec-template.md: ⚠ pending
  - .specify/templates/tasks-template.md: ⚠ pending
  - .specify/templates/commands/*.md: ⚠ pending
Follow-up TODOs:
  - None
-->
# Physical AI & Humanoid Robotics — Essentials Constitution

## Core Principles

### Simplicity
All aspects of the project, from code to UI to architecture, must prioritize simplicity for ease of understanding, maintenance, and learning.

### Accuracy
Content and RAG chatbot responses must be factually correct and derived solely from the book's text.

### Minimalism
Avoid unnecessary features, dependencies, or complexity. Focus on core functionality and a clean, uncluttered user experience.

### Fast Builds
The Docusaurus build process must be optimized for speed to enable rapid iteration and deployment.

### Free-tier Architecture
All chosen technologies and services (Qdrant, Neon, FastAPI) must be compatible with free-tier usage to minimize cost barriers.

### RAG Answers ONLY from Book Text
The RAG chatbot's knowledge base is strictly limited to the content of the textbook. It must not generate responses from external sources or hallucinate information.

## Constraints

- No heavy GPU usage for any component (training, inference, etc.).
- Minimal embedding sizes and processing to reduce resource requirements.

## Key Features

- Docusaurus-based interactive textbook for content delivery.
- Integrated RAG chatbot using Qdrant (vector DB), Neon (PostgreSQL), and FastAPI (backend).
- "Select-text → Ask AI" functionality for direct interaction with book content.
- Optional Urdu localization and personalization features.

## Governance
This constitution defines the foundational principles and guidelines for the "Physical AI & Humanoid Robotics — Essentials" project.
Amendments require review and approval by relevant stakeholders.
Compliance reviews will be conducted periodically to ensure adherence to these principles.
All changes and additions to the project must demonstrate alignment with these core principles.

<!-- Sync Impact Report
Version change: 1.0.0 → 1.0.1
List of modified principles:
  - None
Added sections:
  - None
Removed sections:
  - None
Templates requiring updates:
  - .specify/templates/plan-template.md: ⚠ pending
  - .specify/templates/spec-template.md: ⚠ pending
  - .specify/templates/tasks-template.md: ⚠ pending
  - .specify/templates/commands/*.md: ⚠ pending
Follow-up TODOs:
  - None
-->
**Version**: 1.0.1 | **Ratified**: 2025-12-03 | **Last Amended**: 2025-12-03
