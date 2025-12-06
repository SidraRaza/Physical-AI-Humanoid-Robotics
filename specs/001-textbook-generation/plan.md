# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The plan outlines the implementation for an AI-native textbook with a RAG chatbot, leveraging Docusaurus for the frontend and a Python-based backend with Qdrant and Neon.

## Technical Context

**Language/Version**: Python (FastAPI), JavaScript/TypeScript (Docusaurus)
**Primary Dependencies**: FastAPI, Qdrant client, Neon (psycopg2/asyncpg), Docusaurus, React
**Storage**: Qdrant (vector database), PostgreSQL (Neon)
**Testing**: `pytest` (backend), `Jest` with `React Testing Library` (frontend unit/component), `Cypress` (frontend E2E)
**Target Platform**: GitHub Pages (frontend), Railway/Render (backend)
**Project Type**: Web (frontend + backend)
**Performance Goals**: Page load < 2s (NFR-001), Chatbot response < 5s (NFR-002)
**Constraints**: No heavy GPU usage, minimal embeddings, free-tier friendly architecture
**Scale/Scope**: 6 textbook chapters, RAG chatbot, ~100 concurrent users (based on free-tier constraint NFR-007)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [X] **Simplicity**: The plan leverages Docusaurus and a focused RAG architecture, aligning with the principle of simplicity.
- [X] **Accuracy**: The specification (FR-004) explicitly mandates that the chatbot's responses are derived solely from the textbook text, ensuring accuracy.
- [X] **Minimalism**: The plan focuses on core features, with optional elements clearly delineated, adhering to minimalism.
- [X] **Fast Builds**: The Docusaurus framework is known for optimized build times, aligning with the goal of fast builds (SC-001).
- [X] **Free-tier Architecture**: The plan explicitly incorporates Qdrant, Neon, and free-tier embeddings, with scalability targets for the free tier (TDC-003, TDC-004, TDC-005, NFR-007), ensuring free-tier compatibility.
- [X] **RAG Answers ONLY from Book Text**: This is a direct requirement in the functional specification (FR-004), strictly aligning with the constitution.

## Project Structure

### Documentation (this feature)

```text
specs/001-textbook-generation/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/             # FastAPI routes and endpoint definitions
│   ├── config/          # Environment variable loading, app settings
│   ├── models/          # Pydantic models for data (Chapter, Snippet, Query, Response)
│   ├── services/        # Business logic: RAG, Qdrant, PostgreSQL, embeddings
│   └── utils/           # Helper functions (logging, metrics)
├── tests/
│   ├── unit/
│   └── integration/
├── data/                # Directory for initial textbook content (markdown)
├── Dockerfile
└── requirements.txt

frontend/
├── docs/                # Markdown files for textbook chapters
├── src/
│   ├── components/      # React components (Chatbot UI, Text Selection)
│   ├── pages/           # Docusaurus pages
│   └── theme/           # Custom Docusaurus theme overrides
├── static/
├── docusaurus.config.js
└── package.json
```

**Structure Decision**: The project will use a monorepo-like structure with `backend/` for the FastAPI RAG service and `frontend/` for the Docusaurus textbook, supporting clear separation of concerns and independent deployment.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
