import { DomainCategory } from '@/validation';

export interface KnownRequirement {
  id: string;
  category: 'role' | 'objective' | 'format' | 'constraint' | 'security';
  statement: string;
  sourceText: string;
  confidence: number; // 0.0 - 1.0
}

export interface SystemAssumption {
  id: string;
  category: 'error_handling' | 'data_boundary' | 'dependency_policy' | 'brevity';
  statement: string;
  rationale: string;
  isConfirmed: boolean;
}

export interface DetectedContradiction {
  id: string;
  conflictA: string;
  conflictB: string;
  severity: 'high' | 'medium';
  recommendation: string;
}

export interface RequirementBaseline {
  rawPrompt: string;
  domain: DomainCategory;
  complexityScore: 'simple' | 'moderate' | 'complex';
  canFastTrack: boolean;
  knownRequirements: KnownRequirement[];
  assumptions: SystemAssumption[];
  contradictions: DetectedContradiction[];
}

export function extractRequirementBaseline(rawPrompt: string, domain: DomainCategory): RequirementBaseline {
  const text = rawPrompt.trim();
  const lower = text.toLowerCase();
  const knownRequirements: KnownRequirement[] = [];
  const assumptions: SystemAssumption[] = [];
  const contradictions: DetectedContradiction[] = [];

  // 1. Identify Known Requirements from text
  if (lower.match(/\b(json|schema|api|endpoint)\b/)) {
    knownRequirements.push({
      id: 'known-format-json',
      category: 'format',
      statement: 'Structured machine-parseable JSON contract required.',
      sourceText: text.match(/\b(json|schema|api|endpoint)\b/i)?.[0] || 'json',
      confidence: 0.95,
    });
  }

  if (lower.match(/\b(security|vulnerabilit|owasp|injection|leak|auth)\b/)) {
    knownRequirements.push({
      id: 'known-sec-boundary',
      category: 'security',
      statement: 'Rigorous cybersecurity and injection boundary enforcement.',
      sourceText: text.match(/\b(security|vulnerabilit|owasp|injection|leak|auth)\b/i)?.[0] || 'security',
      confidence: 0.95,
    });
  }

  if (lower.match(/\b(brief|concise|short|under \d+|fast)\b/)) {
    knownRequirements.push({
      id: 'known-brevity',
      category: 'constraint',
      statement: 'Strict brevity and token density constraint.',
      sourceText: text.match(/\b(brief|concise|short|under \d+|fast)\b/i)?.[0] || 'concise',
      confidence: 0.9,
    });
  }

  if (lower.match(/\b(detailed|exhaustive|deep|step-by-step|comprehensive)\b/)) {
    knownRequirements.push({
      id: 'known-depth',
      category: 'objective',
      statement: 'Deep exhaustive analysis with step-by-step reasoning.',
      sourceText: text.match(/\b(detailed|exhaustive|deep|step-by-step|comprehensive)\b/i)?.[0] || 'detailed',
      confidence: 0.9,
    });
  }

  // 2. Detect Contradictions
  const hasBrevity = knownRequirements.some(r => r.id === 'known-brevity');
  const hasDepth = knownRequirements.some(r => r.id === 'known-depth');
  if (hasBrevity && hasDepth) {
    contradictions.push({
      id: 'contra-depth-brevity',
      conflictA: 'Prompt demands brevity ("concise / short")',
      conflictB: 'Prompt demands exhaustive depth ("detailed / comprehensive")',
      severity: 'high',
      recommendation: 'Prioritize a dense executive summary with expandable technical breakdowns.',
    });
  }

  if (lower.includes('code only') && lower.includes('explain')) {
    contradictions.push({
      id: 'contra-code-explanation',
      conflictA: 'Requested "code only" with no commentary',
      conflictB: 'Requested detailed explanations',
      severity: 'medium',
      recommendation: 'Place explanations inside inline code comments or an explicit markdown footnote.',
    });
  }

  // 3. Synthesize System Assumptions (The missing dimensions)
  if (!knownRequirements.some(r => r.category === 'format')) {
    assumptions.push({
      id: 'asmp-format',
      category: 'data_boundary',
      statement: 'Output will follow semantic Markdown with XML section tags.',
      rationale: 'Maximizes human readability while maintaining clean programmatic parsing boundaries.',
      isConfirmed: true,
    });
  }

  assumptions.push({
    id: 'asmp-error-handling',
    category: 'error_handling',
    statement: 'If input is ambiguous or corrupted, state explicit assumptions before proceeding.',
    rationale: 'Prevents silent execution failures and misleading answers.',
    isConfirmed: true,
  });

  assumptions.push({
    id: 'asmp-anti-hallucination',
    category: 'dependency_policy',
    statement: 'Strict negative constraint: Zero fabricated packages, libraries, or unverified claims.',
    rationale: 'Mandatory standard for production reliability.',
    isConfirmed: true,
  });

  // Determine Complexity & Fast-Track eligibility
  const wordCount = text.split(/\s+/).length;
  let complexityScore: 'simple' | 'moderate' | 'complex' = 'moderate';
  let canFastTrack = false;

  if (wordCount < 12 && contradictions.length === 0) {
    complexityScore = 'simple';
    canFastTrack = true; // Can skip deep multi-turn interview if user prefers
  } else if (wordCount > 50 || contradictions.length > 0 || knownRequirements.length >= 3) {
    complexityScore = 'complex';
    canFastTrack = false;
  }

  return {
    rawPrompt: text,
    domain,
    complexityScore,
    canFastTrack,
    knownRequirements,
    assumptions,
    contradictions,
  };
}
