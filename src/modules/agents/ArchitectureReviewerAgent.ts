import { AgentFinding, SpecialistAgentReview, OrchestrationRequest } from './types';

export class ArchitectureReviewerAgent {
  readonly role = 'architecture_reviewer' as const;
  readonly name = 'Prompt Architecture Reviewer';

  review(request: OrchestrationRequest): SpecialistAgentReview {
    const findings: AgentFinding[] = [];
    const text = request.promptText;
    const level = request.level || 'L2';
    const targetModel = (request.targetModel || 'claude').toLowerCase();

    // 1. Level vs Structure alignment
    if (level === 'L4') {
      const hasXmlTags = text.includes('<') && text.includes('>');
      if (!hasXmlTags) {
        findings.push({
          id: 'arch-001',
          agentRole: this.role,
          agentName: this.name,
          category: 'Prompt Architecture Level',
          severity: 'high',
          message: 'Level 4 Production prompts must utilize semantic XML tagging schema.',
          recommendation: 'Refactor prompt using semantic XML tags: <system_role>, <execution_flow>, <constraints>, <untrusted_user_input>.',
          autoFixAvailable: true,
        });
      }

      const hasStateOrFailure =
        text.toLowerCase().includes('failure') ||
        text.toLowerCase().includes('edge case') ||
        text.toLowerCase().includes('fallback') ||
        text.toLowerCase().includes('contingency');

      if (!hasStateOrFailure) {
        findings.push({
          id: 'arch-002',
          agentRole: this.role,
          agentName: this.name,
          category: 'Failure Handling & State',
          severity: 'warning',
          message: 'L4 Production prompt lacks explicit failure recovery matrix.',
          recommendation: 'Add a failure handling protocol defining exact behavior when inputs violate preconditions.',
          autoFixAvailable: true,
        });
      }
    }

    // 2. Token Bloat & Sycophancy Fluff
    const fluffPatterns = [
      /you are a helpful.*?(ai|assistant).*?to help/i,
      /you are a helpful (ai|assistant|ai assistant)/i,
      /as an ai language model/i,
      /i will do my best to assist you/i,
    ];

    if (fluffPatterns.some((pattern) => pattern.test(text))) {
      findings.push({
        id: 'arch-003',
        agentRole: this.role,
        agentName: this.name,
        category: 'Token Efficiency',
        severity: 'warning',
        message: 'Politeness fluff or sycophantic boilerplates waste tokens and dilute attention weight.',
        recommendation: 'Remove generic intro statements. Declare persona directly with authoritative role definition.',
        autoFixAvailable: true,
      });
    }

    // 3. Model Compatibility Architecture
    if (targetModel.includes('claude') && !text.includes('<')) {
      findings.push({
        id: 'arch-004',
        agentRole: this.role,
        agentName: this.name,
        category: 'Model Optimization (Claude)',
        severity: 'info',
        message: 'Anthropic Claude achieves optimal attention adherence when prompts use structured XML hierarchy.',
        recommendation: 'Encapsulate major sections in semantic tags such as <instructions> and <output_format>.',
        autoFixAvailable: true,
      });
    } else if (targetModel.includes('gpt') && !text.includes('```') && !text.includes('###')) {
      findings.push({
        id: 'arch-005',
        agentRole: this.role,
        agentName: this.name,
        category: 'Model Optimization (OpenAI)',
        severity: 'info',
        message: 'OpenAI GPT models parse Markdown headers (###) and markdown code blocks effectively.',
        recommendation: 'Ensure standard Markdown headers and typed backtick code fences are utilized.',
        autoFixAvailable: true,
      });
    }

    // Calculate score
    let score = 100;
    findings.forEach((f) => {
      if (f.severity === 'critical') score -= 30;
      else if (f.severity === 'high') score -= 18;
      else if (f.severity === 'warning') score -= 8;
      else score -= 3;
    });
    score = Math.max(0, Math.min(100, score));

    const verdict: SpecialistAgentReview['verdict'] =
      score >= 85 ? 'approved' : score >= 65 ? 'approved_with_warnings' : 'needs_revision';

    const summary =
      findings.length === 0
        ? `Architecture is calibrated accurately for [${level}] execution targeting [${targetModel.toUpperCase()}].`
        : `Architecture review identified ${findings.length} structural optimization opportunity(s).`;

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
