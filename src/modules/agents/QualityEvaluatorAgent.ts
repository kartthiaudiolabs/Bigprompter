import { AgentFinding, SpecialistAgentReview, OrchestrationRequest } from './types';

export class QualityEvaluatorAgent {
  readonly role = 'quality_evaluator' as const;
  readonly name = 'Prompt Quality & Rigor Evaluator';

  review(request: OrchestrationRequest): SpecialistAgentReview {
    const findings: AgentFinding[] = [];
    const text = request.promptText;
    const lower = text.toLowerCase();

    // 1. Output Contract Clarity
    const hasOutputContract =
      lower.includes('output format') ||
      lower.includes('output_contract') ||
      lower.includes('output contract') ||
      lower.includes('response format') ||
      lower.includes('json schema') ||
      lower.includes('return only') ||
      lower.includes('deliverable structure');

    if (!hasOutputContract) {
      findings.push({
        id: 'qual-001',
        agentRole: this.role,
        agentName: this.name,
        category: 'Output Contract',
        severity: 'high',
        message: 'No concrete output contract or formatting specification detected.',
        recommendation:
          'Define the exact deliverable structure (e.g. JSON schema, Markdown tables, or tagged sections) to eliminate conversational drift.',
        autoFixAvailable: true,
        affectedSection: 'Output Contract',
      });
    }

    // 2. Anti-Hallucination & Uncertainty Behavior
    const hasUncertaintyBehavior =
      lower.includes('if unknown') ||
      lower.includes('if not provided') ||
      lower.includes('not provided or unknown') ||
      lower.includes('do not extrapolate') ||
      lower.includes('do not assume') ||
      lower.includes('state "data not available"');

    if (!hasUncertaintyBehavior && request.level !== 'L1') {
      findings.push({
        id: 'qual-002',
        agentRole: this.role,
        agentName: this.name,
        category: 'Anti-Hallucination Guardrail',
        severity: 'high',
        message: 'Lacks instructions for handling missing or ambiguous information.',
        recommendation:
          'Instruct the model: "When information is missing or ambiguous, state what is needed rather than inventing or extrapolating unverified claims."',
        autoFixAvailable: true,
      });
    }

    // 3. Ambiguous Phrasing & Subjective Directives
    const ambiguousPatterns = [
      /\bmake it (great|awesome|creative|good|professional)\b/i,
      /\bdo your best\b/i,
      /\bas much as possible\b/i,
      /\betc\.?\b/i,
    ];

    const matchedAmbiguities = ambiguousPatterns.filter((pattern) => pattern.test(text));
    if (matchedAmbiguities.length > 0) {
      findings.push({
        id: 'qual-003',
        agentRole: this.role,
        agentName: this.name,
        category: 'Vagueness & Ambiguity',
        severity: 'warning',
        message: 'Subjective or open-ended phrases detected that degrade model determinism.',
        recommendation: 'Replace vague directives ("make it good") with objective, measurable acceptance criteria.',
        autoFixAvailable: false,
      });
    }

    // 4. Negative Constraints
    const hasNegativeConstraints =
      lower.includes('do not') ||
      lower.includes('never') ||
      lower.includes('under no circumstances') ||
      lower.includes('avoid') ||
      lower.includes('forbidden') ||
      lower.includes('prohibited');

    if (!hasNegativeConstraints && request.level !== 'L1') {
      findings.push({
        id: 'qual-004',
        agentRole: this.role,
        agentName: this.name,
        category: 'Negative Constraints',
        severity: 'warning',
        message: 'No negative constraints or boundary definitions specified.',
        recommendation: 'Define what the model must NOT do (e.g. no conversational fluff, no unverified citations, no preamble).',
        autoFixAvailable: true,
      });
    }

    // Calculate score
    let score = 100;
    findings.forEach((f) => {
      if (f.severity === 'critical') score -= 30;
      else if (f.severity === 'high') score -= 18;
      else if (f.severity === 'warning') score -= 10;
      else score -= 5;
    });
    score = Math.max(0, Math.min(100, score));

    const verdict: SpecialistAgentReview['verdict'] =
      score >= 85 ? 'approved' : score >= 65 ? 'approved_with_warnings' : 'needs_revision';

    const summary =
      findings.length === 0
        ? 'Prompt structure meets professional quality standards with clear output contracts and anti-hallucination guardrails.'
        : `Quality evaluation surfaced ${findings.length} structural deficiency(s).`;

    return {
      agentRole: this.role,
      agentName: this.name,
      score,
      verdict,
      findings,
      summary,
    };
  }
}
