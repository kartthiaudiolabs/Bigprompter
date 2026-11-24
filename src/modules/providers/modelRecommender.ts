import { TargetModel, DomainCategory, EngineeringLevel } from '@/validation';

export interface ModelProfile {
  id: TargetModel;
  name: string;
  provider: 'anthropic' | 'google' | 'openai' | 'deepseek' | 'universal';
  inputCostPerMillionUSD: number;
  outputCostPerMillionUSD: number;
  contextWindowTokens: number;
  strengths: string[];
  bestFor: string;
  syntaxFlavor: string;
}

export const MODEL_CATALOG: Record<TargetModel, ModelProfile> = {
  'claude-3-7-sonnet': {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    inputCostPerMillionUSD: 3.00,
    outputCostPerMillionUSD: 15.00,
    contextWindowTokens: 200_000,
    strengths: ['Rigorous XML Tagging', 'Prompt Injection Resistance', 'Nuanced Architectural Synthesis'],
    bestFor: 'L4 Production Agents, Critical Security Audits & Code Refactoring',
    syntaxFlavor: 'Semantic XML Boundary Tags (<system_role>, <untrusted_user_input>)',
  },
  'gemini-2-5-pro': {
    id: 'gemini-2-5-pro',
    name: 'Google Gemini 2.5 Pro',
    provider: 'google',
    inputCostPerMillionUSD: 1.25,
    outputCostPerMillionUSD: 5.00,
    contextWindowTokens: 1_000_000,
    strengths: ['1M+ Context Window', 'Calibrated Reasoning & Confidence', 'Multimodal Reference Docs'],
    bestFor: 'Large Codebase Ingestion, Multi-Document Legal & Financial Audits',
    syntaxFlavor: 'System Instruction Objects & Calibrated JSON Schema',
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'openai',
    inputCostPerMillionUSD: 2.50,
    outputCostPerMillionUSD: 10.00,
    contextWindowTokens: 128_000,
    strengths: ['Fast Latency', 'Strict Structured Outputs (JSON Schema)', 'High Tool Calling Reliability'],
    bestFor: 'Interactive Web APIs, High-Throughput Microcopy & Customer Triage',
    syntaxFlavor: 'Triple-Backtick Delimiters & Developer/User Message Separation',
  },
  'deepseek-r1': {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    inputCostPerMillionUSD: 0.55,
    outputCostPerMillionUSD: 2.19,
    contextWindowTokens: 64_000,
    strengths: ['Chain-of-Thought Verification', 'Mathematical & Algorithmic Rigor', 'Ultra-Low Cost'],
    bestFor: 'Mathematical Proofs, Formal Verification & Cost-Constrained Pipelines',
    syntaxFlavor: 'Chain-of-Thought Reasoning Directives',
  },
  'universal': {
    id: 'universal',
    name: 'Universal Provider-Agnostic',
    provider: 'universal',
    inputCostPerMillionUSD: 1.50,
    outputCostPerMillionUSD: 6.00,
    contextWindowTokens: 64_000,
    strengths: ['High Cross-Provider Portability', 'Standard Markdown Conventions', 'Zero Vendor Lock-in'],
    bestFor: 'Multi-Cloud Portability & Fallback Chains',
    syntaxFlavor: 'Standard Markdown Headings & Explicit Variable Tags ({{INPUT}})',
  },
};

export interface ModelRecommendation {
  recommendedModel: TargetModel;
  rationale: string;
  catalog: ModelProfile[];
  estimatedCostForTaskUSD: number;
}

export function recommendTargetModel(
  domain: DomainCategory,
  level: EngineeringLevel,
  priority: 'quality' | 'cost' | 'latency' = 'quality'
): ModelRecommendation {
  let recommendedModel: TargetModel = 'claude-3-7-sonnet';
  let rationale = 'Selected for highest architectural rigor, schema adherence, and prompt injection resistance.';

  if (priority === 'cost') {
    recommendedModel = 'deepseek-r1';
    rationale = 'Selected for lowest inference cost per million tokens with strong reasoning accuracy.';
  } else if (priority === 'latency') {
    recommendedModel = 'gpt-4o';
    rationale = 'Selected for rapid time-to-first-token and reliable streaming throughput.';
  } else if (domain === 'data-analytics' || domain === 'finance-legal') {
    if (level === 'L4') {
      recommendedModel = 'gemini-2-5-pro';
      rationale = 'Selected for massive context capability (1M+ tokens) and calibrated probability reasoning.';
    } else {
      recommendedModel = 'gpt-4o';
      rationale = 'Selected for deterministic tabular output and structured JSON schema formatting.';
    }
  } else if (domain === 'software-engineering') {
    recommendedModel = 'claude-3-7-sonnet';
    rationale = 'Industry benchmark for software architecture, defensive XML boundaries, and zero hallucinations.';
  }

  // Estimated task cost: assume ~1.5k prompt tokens and ~800 completion tokens
  const profile = MODEL_CATALOG[recommendedModel];
  const estimatedCostForTaskUSD = Number(
    ((1500 / 1_000_000) * profile.inputCostPerMillionUSD +
      (800 / 1_000_000) * profile.outputCostPerMillionUSD
    ).toFixed(6)
  );

  return {
    recommendedModel,
    rationale,
    catalog: Object.values(MODEL_CATALOG),
    estimatedCostForTaskUSD,
  };
}
