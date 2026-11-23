# BIG PROMPTER — API CONTRACT SPECIFICATION v1.0

## 1. Endpoints Overview

All APIs are hosted as Next.js Server Route Handlers under `/api/*` and validated with Zod schemas.

### 1.1 `POST /api/discovery`
Analyzes raw intent, detects domain category, and synthesizes dynamic multiple-choice discovery questions.

**Request Payload:**
```json
{
  "rawInput": "Build a secure SQL query assistant for Postgres",
  "preferredLevel": "L3",
  "preferredModel": "gemini-2-5-pro"
}
```

**Response Payload:**
```json
{
  "success": true,
  "domain": "data-analytics",
  "questions": [
    {
      "id": "q-role",
      "category": "role",
      "question": "What tone, authority, and depth should the prompt establish?",
      "rationale": "Calibrates vocabulary, precision, and level of guidance.",
      "options": [
        {
          "id": "role-expert-consultant",
          "label": "Senior Database Architect & Performance Tuner",
          "isRecommended": true
        }
      ],
      "selectedOptionId": "role-expert-consultant"
    }
  ]
}
```

---

### 1.2 `POST /api/compile`
Compiles confirmed discovery requirements into an L1, L2, L3, or L4 prompt architecture.

**Request Payload:**
```json
{
  "rawInput": "Build a secure SQL query assistant for Postgres",
  "domain": "data-analytics",
  "level": "L4",
  "targetModel": "gemini-2-5-pro",
  "answers": [
    { "questionId": "q-role", "selectedOptionId": "role-expert-consultant" }
  ]
}
```

**Response Payload:**
```json
{
  "success": true,
  "versionNumber": 1,
  "compiledPrompt": "<system_role>...</system_role>",
  "metrics": {
    "intentFidelityScore": 92,
    "structuralDepthScore": 98,
    "securityResistanceScore": 96,
    "modelCompatibilityScore": 95,
    "overallScore": 95,
    "estimatedTokens": 480,
    "estimatedCostPer1kRuns": "$0.0012"
  }
}
```

---

### 1.3 `POST /api/sandbox`
Executes test payloads against live AI providers or the deterministic sandbox.

**Request Payload:**
```json
{
  "compiledPrompt": "<system_role>...</system_role>",
  "sampleInput": "SELECT * FROM users WHERE id = 1;",
  "provider": "google",
  "apiKey": "optional_user_byok_key"
}
```

**Response Payload:**
```json
{
  "success": true,
  "output": "### Execution Output\n1. Validated query...",
  "latencyMs": 340,
  "tokensUsed": 195,
  "providerUsed": "Google Gemini 2.5 Flash (Live API)"
}
```
