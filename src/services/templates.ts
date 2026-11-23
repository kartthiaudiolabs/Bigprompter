import { StarterTemplate } from '../types';

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'code-reviewer-pro',
    title: 'Autonomous Code Reviewer & Bug Hunter',
    category: 'software-engineering',
    description: 'Deep architectural code review engine that spots race conditions, security vulnerabilities, and performance regressions.',
    rawIdea: 'I want a code review assistant that reviews pull requests, finds bugs, and gives refactoring suggestions.',
    recommendedLevel: 'L4',
    recommendedModel: 'claude-3-7-sonnet',
  },
  {
    id: 'b2b-copywriter',
    title: 'High-Converting B2B SaaS Landing Page Copywriter',
    category: 'copywriting-marketing',
    description: 'Generates objection-handling copy, hero headers, feature matrices, and social proof sections tuned for B2B buyer psychology.',
    rawIdea: 'Write high converting landing page copy for a new developer tool.',
    recommendedLevel: 'L3',
    recommendedModel: 'gpt-4o',
  },
  {
    id: 'sql-synthesizer',
    title: 'Natural Language to Optimized PostgreSQL Architect',
    category: 'data-analytics',
    description: 'Translates ambiguous business questions into dialect-specific, indexed SQL with execution plans and safety checks.',
    rawIdea: 'Translate English questions into fast Postgres SQL queries with explanations.',
    recommendedLevel: 'L3',
    recommendedModel: 'gemini-2-5-pro',
  },
  {
    id: 'customer-support-triage',
    title: 'Tier-1 Customer Support & Sentiment Resolution Agent',
    category: 'customer-support',
    description: 'Autonomous customer triage bot that tags urgency, refunds policy enforcement, and escalating to human engineers.',
    rawIdea: 'Help desk chatbot that answers customer questions and escalates difficult complaints.',
    recommendedLevel: 'L3',
    recommendedModel: 'gpt-4o',
  },
  {
    id: 'music-producer-assistant',
    title: 'Music Mixing & Production Assistant',
    category: 'creative-production',
    description: 'Analyzes song arrangement, frequency clashes, dynamic range, and vocal chain settings for mixing engineers.',
    rawIdea: 'Help me mix my audio track and suggest EQ, compression, and vocal chain settings.',
    recommendedLevel: 'L2',
    recommendedModel: 'gemini-2-5-pro',
  },
  {
    id: 'legal-compliance-audit',
    title: 'SaaS Privacy & GDPR Compliance Analyzer',
    category: 'finance-legal',
    description: 'Scans privacy policies, terms of service, and vendor contracts for regulatory gaps, DPA clauses, and liabilities.',
    rawIdea: 'Review vendor contracts and privacy policies for GDPR and data privacy compliance.',
    recommendedLevel: 'L4',
    recommendedModel: 'claude-3-7-sonnet',
  }
];
