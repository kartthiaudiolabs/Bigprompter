-- Seed initial starter templates
INSERT INTO public.templates (id, title, category, description, raw_idea, recommended_level, recommended_model, is_system_template)
VALUES
  (
    'code-reviewer-pro',
    'Autonomous Code Reviewer & Bug Hunter',
    'software-engineering',
    'Deep architectural code review engine that spots race conditions, security vulnerabilities, and performance regressions.',
    'I want a code review assistant that reviews pull requests, finds bugs, and gives refactoring suggestions.',
    'L4',
    'claude-3-7-sonnet',
    TRUE
  ),
  (
    'b2b-copywriter',
    'High-Converting B2B SaaS Landing Page Copywriter',
    'copywriting-marketing',
    'Generates objection-handling copy, hero headers, feature matrices, and social proof sections tuned for B2B buyer psychology.',
    'Write high converting landing page copy for a new developer tool.',
    'L3',
    'gpt-4o',
    TRUE
  ),
  (
    'sql-synthesizer',
    'Natural Language to Optimized PostgreSQL Architect',
    'data-analytics',
    'Translates ambiguous business questions into dialect-specific, indexed SQL with execution plans and safety checks.',
    'Translate English questions into fast Postgres SQL queries with explanations.',
    'L3',
    'gemini-2-5-pro',
    TRUE
  ),
  (
    'customer-support-triage',
    'Tier-1 Customer Support & Sentiment Resolution Agent',
    'customer-support',
    'Autonomous customer triage bot that tags urgency, refunds policy enforcement, and escalating to human engineers.',
    'Help desk chatbot that answers customer questions and escalates difficult complaints.',
    'L3',
    'gpt-4o',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;
