# Implementation Plan: textbook-generation

**Branch**: `002-textbook-generation` | **Date**: 2025-12-03 | **Spec**: specs/002-textbook-generation/spec.md
**Input**: Feature specification from `/specs/002-textbook-generation/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an AI-native textbook with a web-based interface for content delivery and an integrated RAG chatbot. The technical approach involves a frontend for content display and a backend for RAG services, designed for free-tier cloud compatibility.

## Technical Context

**Language/Version**: JavaScript/TypeScript (frontend), Python 3.x (backend)
**Primary Dependencies**: Docusaurus, React, FastAPI, Qdrant (or compatible vector DB), Neon (PostgreSQL or compatible relational DB)
**Storage**: PostgreSQL, Vector Database
**Testing**: Jest/React Testing Library (frontend), Pytest (backend)
**Target Platform**: Web Browser (frontend), Linux server (backend)
**Project Type**: Web application
**Performance Goals**: 99% of textbook pages load within 2 seconds. 90% of RAG chatbot queries receive a relevant answer within 5 seconds. Content generation and deployment completes within 5 minutes.
**Constraints**: Free-tier cloud environment compatibility, minimal embedding sizes and processing, no heavy GPU usage.
**Scale/Scope**: Interactive textbook with RAG chatbot, optional Urdu localization and personalization features.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

All core principles and constraints from `.specify/memory/constitution.md` are aligned with this plan:
- **Simplicity**: Achieved through clear separation of concerns (frontend/backend).
- **Accuracy**: RAG chatbot strictly adheres to book content, as per principle.
- **Minimalism**: Prioritizing free-tier architecture and minimal embeddings.
- **Fast Builds**: Targeting content generation and deployment within 5 minutes.
- **Free-tier Architecture**: Core constraint and design decision.
- **RAG Answers ONLY from Book Text**: Fundamental functional requirement.
- **No heavy GPU usage**: Explicitly avoided.
- **Minimal embedding sizes**: Considered in design.

## Project Structure

### Documentation (this feature)

```text
specs/002-textbook-generation/
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
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: The project will adopt a monorepo structure with distinct `frontend/` and `backend/` directories. The `frontend/` will host the Docusaurus application, while the `backend/` will house the FastAPI application, RAG services, and database interactions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
|           |            |                                     |
