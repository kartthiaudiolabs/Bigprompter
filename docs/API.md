# BIG PROMPTER — API CONTRACT SPECIFICATION v1.0

## 1. Endpoints Overview

All APIs are hosted as Next.js Server Route Handlers under `/api/*` and validated with Zod schemas.

### 1.1 `POST /api/discovery`
Analyzes raw intent, detects domain category, and synthesizes dynamic multiple-choice discovery questions.

### 1.2 `POST /api/compile`
Compiles confirmed discovery requirements into an L1, L2, L3, or L4 prompt architecture with model-tailored schemas.

### 1.3 `POST /api/sandbox`
Executes test payloads against live AI providers (OpenAI, Claude, Gemini) or the deterministic sandbox.

### 1.4 `POST /api/sandbox/stream`
Server-Sent Events (SSE) streaming execution returning chunked deltas (`text`, `isComplete`, `tokensStreamed`, `elapsedMs`).

### 1.5 `POST /api/auth/register` & `POST /api/auth/login`
Authentication routes supporting Supabase Auth with automatic local-storage fallback for offline sandbox operation.

### 1.6 `GET /api/projects` & `POST /api/projects`
Project memory isolation and multi-project workspaces ensuring strict scoping of prompts and credentials.

### 1.7 `POST /api/discovery/analyze`
Requirement Baseline & Contradiction Detection engine detecting conflicts in user constraints.

### 1.8 `POST /api/architecture/design`
Generates the 5-box visual Prompt Architecture Schematic (`System Role`, `Execution Protocol`, `Negative Guardrails`, `Output Contract`, `Runtime Boundary`).

### 1.9 `POST /api/agents/orchestrate`
Hierarchical Senior Prompt Engineer orchestrator dispatching 4 specialist agents (`SecurityAuditor`, `DomainSpecialist`, `QualityEvaluator`, `ArchitectureReviewer`) with trade-off conflict resolution.

### 1.10 `GET /api/templates` & `POST /api/templates/instantiate`
Adaptive template catalog with filtering across 8 industrial domains and parameter substitution engine.

### 1.11 `POST /api/evaluation/rubric`
Multi-dimensional evidence-based rubric evaluation scoring Structural Adherence, Negative Constraints, Anti-Hallucination, Safety Compliance, and Token Density.

### 1.12 `POST /api/evaluation/injection-suite`
Automated 5-vector adversarial prompt injection test battery (Direct Override, System Prompt Extraction, Delimiter Breakout, DAN Roleplay Jailbreak, Command Smuggling).

### 1.13 `POST /api/evaluation/assertions`
Deterministic output contract validation verifying JSON schemas, required sections, and banned preambles.

### 1.14 `POST /api/export/sdk`
Generates downloadable, production-ready code bundles in TypeScript, Python, Next.js Edge Routes, cURL, LangChain/PromptFoo YAML, JSON, or Markdown.
