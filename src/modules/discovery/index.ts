import { DomainCategory } from '../../validation';
import { DiscoveryQuestion } from '../../types';

// Helper to detect domain from raw prompt
export function detectDomain(rawText: string): DomainCategory {
  const lower = rawText.toLowerCase();
  if (lower.match(/\b(data|analytics|dashboard|chart|metrics|kpi|statistics|excel|csv|sql|postgres|postgresql|query|queries)\b/)) {
    return 'data-analytics';
  }
  if (lower.match(/\b(code|coding|python|javascript|typescript|bug|repo|react|backend|api|apis|database|git|pull\s*request|pr)\b/)) {
    return 'software-engineering';
  }
  if (lower.match(/\b(copy|marketing|headline|landing|ad|email|seo|blog|sales|funnel|conversion)\b/)) {
    return 'copywriting-marketing';
  }
  if (lower.match(/\b(support|ticket|helpdesk|customer|refund|complaint|faq|triage|csat)\b/)) {
    return 'customer-support';
  }
  if (lower.match(/\b(music|audio|mix|master|song|chord|eq|sound|video|design|animation)\b/)) {
    return 'creative-production';
  }
  if (lower.match(/\b(contract|legal|gdpr|compliance|liability|privacy|law|audit|nda)\b/)) {
    return 'finance-legal';
  }
  if (lower.match(/\b(health|medical|clinic|doctor|patient|pharma|bio|scientific)\b/)) {
    return 'healthcare-science';
  }
  return 'general-assistant';
}

// Generate dynamic, intelligent Discovery Questions based on raw prompt & domain
export function generateDiscoveryQuestions(rawPrompt: string, domain: DomainCategory): DiscoveryQuestion[] {
  if (domain === 'software-engineering') {
    return [
      {
        id: 'q-role',
        category: 'role',
        question: 'What level of authority and persona should the AI adopt?',
        rationale: 'Shapes the depth, terminology, and scrutiny of the code review or engineering output.',
        options: [
          {
            id: 'role-staff-architect',
            label: 'Staff Software Architect & Security Auditor',
            description: 'Scrutinizes edge cases, concurrency, security vulnerabilities, and architectural trade-offs.',
            isRecommended: true
          },
          {
            id: 'role-senior-mentor',
            label: 'Senior Developer & Pragmatic Mentor',
            description: 'Focuses on clean code, idiomatic readability, and constructive educational feedback.'
          },
          {
            id: 'role-speed-coder',
            label: 'Rapid Implementation Assistant',
            description: 'Provides direct drop-in code snippets with minimal commentary.'
          }
        ],
        selectedOptionId: 'role-staff-architect'
      },
      {
        id: 'q-format',
        category: 'format',
        question: 'What is the required output contract and format?',
        rationale: 'Ensures downstream integration with CI/CD tools, editors, or human developers.',
        options: [
          {
            id: 'fmt-diff-blocks',
            label: 'Markdown with Line-by-Line Diffs & Severity Tags',
            description: 'Structured findings tagged with [CRITICAL], [WARNING], [OPTIMIZATION], plus copyable code blocks.',
            isRecommended: true
          },
          {
            id: 'fmt-strict-json',
            label: 'Strict JSON Schema',
            description: 'Machine-parseable JSON object with file, line, ruleId, message, and suggestedPatch fields.'
          },
          {
            id: 'fmt-executive-summary',
            label: 'High-Level Architecture Summary & Checklist',
            description: 'Concise executive brief highlighting risk items and an actionable review checklist.'
          }
        ],
        selectedOptionId: 'fmt-diff-blocks'
      },
      {
        id: 'q-constraints',
        category: 'constraints',
        question: 'What negative constraints and security boundaries must be enforced?',
        rationale: 'Prevents hallucinations, untested third-party dependencies, and unsafe recommendations.',
        options: [
          {
            id: 'const-zero-untested-deps',
            label: 'No Unvetted Dependencies & Strict OWASP Guardrails',
            description: 'Prohibits proposing external libraries without justification; strictly checks for injection and memory leaks.',
            isRecommended: true
          },
          {
            id: 'const-pure-stdlib',
            label: 'Standard Library Only (Zero New Dependencies)',
            description: 'All proposed solutions must use native language APIs only.'
          },
          {
            id: 'const-permissive',
            label: 'Balanced Production Standards',
            description: 'Focuses on maintainability without overly restricting modern ecosystem libraries.'
          }
        ],
        selectedOptionId: 'const-zero-untested-deps'
      },
      {
        id: 'q-edge-cases',
        category: 'edge_cases',
        question: 'How should the AI handle missing context or incomplete inputs?',
        rationale: 'Defines failure behavior when provided code is a snippet or lacks full repository context.',
        options: [
          {
            id: 'edge-state-assumptions',
            label: 'Explicitly List Assumptions Before Reviewing',
            description: 'State missing context hypotheses clearly in a designated section without halting execution.',
            isRecommended: true
          },
          {
            id: 'edge-halt-ask',
            label: 'Halt & Request Clarification',
            description: 'Pause and ask targeted questions if critical interfaces, types, or dependencies are ambiguous.'
          },
          {
            id: 'edge-best-guess',
            label: 'Proceed with Most Likely Framework Conventions',
            description: 'Silently assume standard framework patterns (e.g., standard Next.js / Express conventions).'
          }
        ],
        selectedOptionId: 'edge-state-assumptions'
      }
    ];
  }

  if (domain === 'copywriting-marketing') {
    return [
      {
        id: 'q-role',
        category: 'role',
        question: 'What copywriter persona and psychological framework should be used?',
        rationale: 'Directly influences conversion rate, vocabulary, and buyer urgency.',
        options: [
          {
            id: 'role-direct-response',
            label: 'Elite Direct-Response Copy Strategist',
            description: 'Uses PAS (Problem-Agitate-Solve) and objection-neutralizing buyer psychology.',
            isRecommended: true
          },
          {
            id: 'role-storybrand',
            label: 'StoryBrand Narrative Architect',
            description: 'Positions the customer as the hero and the product as the wise guide.'
          },
          {
            id: 'role-witty-tech',
            label: 'Sharp, Minimalist Developer-First Voice',
            description: 'Subtle, no-fluff, highly technical tone that appeals to skeptical engineering leads.'
          }
        ],
        selectedOptionId: 'role-direct-response'
      },
      {
        id: 'q-format',
        category: 'format',
        question: 'How should the copy options and variations be structured?',
        rationale: 'Allows immediate A/B testing and seamless handover to designers.',
        options: [
          {
            id: 'fmt-modular-blocks',
            label: 'Wireframe-Ready Sections with 3 Angle Variations',
            description: 'Hero, Social Proof, Core Value Props, and CTA variants with designer notes.',
            isRecommended: true
          },
          {
            id: 'fmt-spreadsheet-matrix',
            label: 'Tabular Copy Matrix (Headlines, Sub-lines, Microcopy)',
            description: 'Clean structured table ready for spreadsheet import and split-testing.'
          },
          {
            id: 'fmt-flowing-markdown',
            label: 'Complete Single-Page Flow in Clean Markdown',
            description: 'Continuous ready-to-publish page text.'
          }
        ],
        selectedOptionId: 'fmt-modular-blocks'
      },
      {
        id: 'q-constraints',
        category: 'constraints',
        question: 'What copywriting anti-patterns and buzzwords must be banned?',
        rationale: 'Ensures the copy stays crisp and avoids generic AI cliches.',
        options: [
          {
            id: 'const-ban-cliches',
            label: 'Ban Generic AI Fluff ("Delve", "Supercharge", "Unleash", "Game-changer")',
            description: 'Forces concrete metrics, specific nouns, active verbs, and real proof points.',
            isRecommended: true
          },
          {
            id: 'const-strict-wordcount',
            label: 'Strict Word Count Caps (Micro-copy & High Impact)',
            description: 'Headlines under 8 words, paragraphs under 35 words for fast skimming.'
          },
          {
            id: 'const-compliance-safe',
            label: 'Compliance-Safe (No Unsubstantiated Claims or Guarantees)',
            description: 'Avoids legal liability by preventing absolute claims like "100% guaranteed".'
          }
        ],
        selectedOptionId: 'const-ban-cliches'
      },
      {
        id: 'q-edge-cases',
        category: 'edge_cases',
        question: 'How should weak or missing product differentiators be handled?',
        rationale: 'Prevents bland copy when the user provides limited feature details.',
        options: [
          {
            id: 'edge-highlight-gaps',
            label: 'Use Bracketed Placeholders [e.g., {{SPECIFIC_SPEED_STAT}}]',
            description: 'Generate high-impact copy while clearly prompting the user where real numbers belong.',
            isRecommended: true
          },
          {
            id: 'edge-infer-competitors',
            label: 'Position Against Industry Status Quo',
            description: 'Contrast against common frustrations with legacy solutions.'
          }
        ],
        selectedOptionId: 'edge-highlight-gaps'
      }
    ];
  }

  // Universal / General fallback questions
  return [
    {
      id: 'q-role',
      category: 'role',
      question: 'What tone, authority, and depth should the prompt establish?',
      rationale: 'Calibrates vocabulary, precision, and level of guidance.',
      options: [
        {
          id: 'role-expert-consultant',
          label: 'Senior Domain Principal & Executive Consultant',
          description: 'Deep analytical precision, strategic context, and rigorous execution.',
          isRecommended: true
        },
        {
          id: 'role-pragmatic-partner',
          label: 'Pragmatic, Collaborative Specialist',
          description: 'Hands-on, direct, action-oriented, and easy to follow.'
        },
        {
          id: 'role-concise-operator',
          label: 'Concise, Objective Task Operator',
          description: 'Zero conversational preamble; outputs only direct deliverables.'
        }
      ],
      selectedOptionId: 'role-expert-consultant'
    },
    {
      id: 'q-format',
      category: 'format',
      question: 'What output structure is best for your workflow?',
      rationale: 'Ensures the generated output is immediately usable without reformatting.',
      options: [
        {
          id: 'fmt-structured-markdown',
          label: 'Semantic Markdown with XML Section Tags',
          description: 'Clear hierarchical headings, bulleted logic, and tagged data boundaries.',
          isRecommended: true
        },
        {
          id: 'fmt-strict-json',
          label: 'Typed JSON Schema Output',
          description: 'Structured JSON ready for programmatic parsing and API pipelines.'
        },
        {
          id: 'fmt-step-by-step',
          label: 'Step-by-Step Executable Action Plan',
          description: 'Sequenced checklist with input requirements and verification gates.'
        }
      ],
      selectedOptionId: 'fmt-structured-markdown'
    },
    {
      id: 'q-constraints',
      category: 'constraints',
      question: 'What strict boundaries and negative constraints should apply?',
      rationale: 'Defines what the model must NEVER do to prevent undesirable outputs.',
      options: [
        {
          id: 'const-anti-hallucination',
          label: 'Zero Hallucination: Cite Sources or Explicitly State Uncertainty',
          description: 'Model must never fabricate facts, statistics, or capabilities.',
          isRecommended: true
        },
        {
          id: 'const-no-preamble',
          label: 'No Fluff, Meta-Talk, or Sycophancy',
          description: 'Eliminates phrases like "Certainly! Here is...", "As an AI...", or apologies.'
        },
        {
          id: 'const-strict-brevity',
          label: 'Strict Density & Token Efficiency',
          description: 'Delivers maximum information with minimum word count.'
        }
      ],
      selectedOptionId: 'const-anti-hallucination'
    },
    {
      id: 'q-edge-cases',
      category: 'edge_cases',
      question: 'What is the fallback protocol when input data is incomplete or ambiguous?',
      rationale: 'Prevents silent failures and misleading assumptions.',
      options: [
        {
          id: 'edge-ask-first',
          label: 'Ask Clarifying Questions Before Generating',
          description: 'Prompts the user for missing parameters if critical ambiguity exists.',
          isRecommended: true
        },
        {
          id: 'edge-provide-defaults',
          label: 'Declare Sensible Defaults & Proceed with Caveats',
          description: 'States standard assumptions in an explicit callout block and completes the task.'
        }
      ],
      selectedOptionId: 'edge-ask-first'
    }
  ];
}
