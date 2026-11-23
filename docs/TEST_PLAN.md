# BIG PROMPTER — QUALITY ASSURANCE & TEST PLAN v1.0

## 1. Testing Strategy & Pyramid

```text
       ▲
      / \     E2E / Workflow Tests (Playwright / Webview)
     /   \    - User journey from Input -> Discovery -> Compilation -> Sandbox
    /-----\
   /       \   Integration Tests (Server Route Handlers & Provider Adapters)
  /         \  - API validation, Mock LLM streaming, Schema conformity
 /-----------\
/             \  Unit Tests (Vitest)
/---------------\ - Domain classifier, Question generator, L1–L4 Compiler, Zod schemas
```

---

## 2. Test Execution Matrix (Phase 0 Baseline)

| Test Suite | Focus Area | Framework | Target Files |
|---|---|---|---|
| **Unit: Validation** | Validates that malformed payloads, invalid levels, or empty inputs are rejected by Zod schemas. | Vitest | `src/validation/*.ts` |
| **Unit: Domain & Discovery** | Validates that domain keywords accurately classify software, copywriting, SQL, etc., and that questions contain sensible defaults. | Vitest | `src/modules/discovery/*.ts` |
| **Unit: L1–L4 Compiler** | Verifies that L1 outputs simple text, while L4 emits untrusted content tags, model-specific XML/delimiters, and negative constraints. | Vitest | `src/modules/compiler/*.ts` |
| **Unit: Provider Abstraction** | Tests that OpenAI, Claude, and Gemini adapter request/response transformations normalize correctly. | Vitest | `src/server/providers/*.ts` |
| **Integration: Build Verification** | Runs Next.js strict TypeScript compilation and asset generation. | Next.js Build | Full project |

---

## 3. Definition of Verification Success
1. **0 TypeScript Errors:** `tsc --noEmit` exits with code 0.
2. **All Unit Tests Pass:** `vitest run` executes all test suites without failure.
3. **Clean Build:** `next build` builds production server bundles without warnings or bundle breaks.
