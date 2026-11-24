import { AgentFinding, SpecialistAgentReview, OrchestrationRequest } from './types';

export class DomainSpecialistAgent {
  readonly role = 'domain_specialist' as const;
  readonly name = 'Domain Intelligence Specialist';

  review(request: OrchestrationRequest): SpecialistAgentReview {
    const findings: AgentFinding[] = [];
    const text = request.promptText.toLowerCase();
    const domain = (request.domain || 'general').toLowerCase();

    // 1. Healthcare / Clinical Domain
    if (domain.includes('health') || domain.includes('medical') || text.includes('patient') || text.includes('symptom')) {
      const hasClinicalDisclaimer =
        text.includes('not a substitute for professional medical advice') ||
        text.includes('informational purposes only') ||
        text.includes('consult a qualified physician') ||
        text.includes('disclaimer');

      if (!hasClinicalDisclaimer) {
        findings.push({
          id: 'dom-med-001',
          agentRole: this.role,
          agentName: this.name,
          category: 'Healthcare Compliance',
          severity: 'critical',
          message: 'Mandatory clinical disclaimer missing for healthcare workload.',
          recommendation:
            'Must append explicit regulatory notice: "This output is strictly for informational and clinical decision-support purposes and is NOT a substitute for licensed medical diagnosis, treatment, or judgment."',
          autoFixAvailable: true,
          affectedSection: 'Regulatory Guardrails',
        });
      }

      const hasHipaaProtection = text.includes('hipaa') || text.includes('phi') || text.includes('de-identified') || text.includes('anonymize');
      if (!hasHipaaProtection) {
        findings.push({
          id: 'dom-med-002',
          agentRole: this.role,
          agentName: this.name,
          category: 'Patient Data Privacy',
          severity: 'high',
          message: 'Lacks explicit instructions for scrubbing Protected Health Information (PHI).',
          recommendation: 'Specify that all patient names, MRNs, dates, and geographic identifiers must be redacted or de-identified.',
          autoFixAvailable: true,
        });
      }
    }

    // 2. Legal & Compliance Domain
    if (domain.includes('legal') || domain.includes('contract') || text.includes('lawyer') || text.includes('attorney') || text.includes('statute')) {
      const hasLegalDisclaimer =
        text.includes('not formal legal advice') ||
        text.includes('informational') ||
        text.includes('attorney-client relationship');

      if (!hasLegalDisclaimer) {
        findings.push({
          id: 'dom-leg-001',
          agentRole: this.role,
          agentName: this.name,
          category: 'Legal Practice Guardrails',
          severity: 'high',
          message: 'Missing standard legal non-representation disclaimer.',
          recommendation:
            'Include: "This analysis is for research and drafting assistance only and does not establish an attorney-client relationship or constitute formal legal counsel."',
          autoFixAvailable: true,
        });
      }
    }

    // 3. Finance & Investment Domain
    if (domain.includes('finance') || domain.includes('crypto') || domain.includes('investment') || text.includes('stock') || text.includes('trading')) {
      const hasFinancialDisclaimer =
        text.includes('not financial advice') ||
        text.includes('informational purposes') ||
        text.includes('fiduciary');

      if (!hasFinancialDisclaimer) {
        findings.push({
          id: 'dom-fin-001',
          agentRole: this.role,
          agentName: this.name,
          category: 'Financial Regulatory Compliance',
          severity: 'high',
          message: 'Missing financial advisory disclaimer.',
          recommendation:
            'Mandate disclaimer: "Not financial, investment, or tax advice. Market instruments carry risk; past performance does not guarantee future results."',
          autoFixAvailable: true,
        });
      }
    }

    // 4. Software Engineering & Architecture Domain
    if (domain.includes('software') || domain.includes('devops') || domain.includes('code') || text.includes('typescript') || text.includes('api')) {
      const hasErrorHandling =
        text.includes('error handling') ||
        text.includes('try-catch') ||
        text.includes('edge case') ||
        text.includes('failure mode') ||
        text.includes('failure') ||
        text.includes('exception');
      if (!hasErrorHandling && request.level !== 'L1') {
        findings.push({
          id: 'dom-soft-001',
          agentRole: this.role,
          agentName: this.name,
          category: 'Software Robustness',
          severity: 'warning',
          message: 'Prompt does not specify error handling or boundary condition requirements.',
          recommendation: 'Require typed error structures, graceful fallbacks, and boundary condition validation.',
          autoFixAvailable: true,
        });
      }
    }

    // 5. Data & SQL Domain
    if (domain.includes('data') || domain.includes('sql') || text.includes('query') || text.includes('bigquery')) {
      const hasSqlSafety = text.includes('parameter') || text.includes('injection') || text.includes('read-only') || text.includes('dialect');
      if (!hasSqlSafety) {
        findings.push({
          id: 'dom-data-001',
          agentRole: this.role,
          agentName: this.name,
          category: 'Data Engineering Standards',
          severity: 'warning',
          message: 'SQL dialect and read-only/parameterization guardrails are unspecified.',
          recommendation: 'Explicitly specify the SQL dialect (e.g. PostgreSQL, BigQuery Standard SQL) and forbid destructive DDL/DML statements.',
          autoFixAvailable: true,
        });
      }
    }

    // Calculate domain score
    let score = 100;
    findings.forEach((f) => {
      if (f.severity === 'critical') score -= 30;
      else if (f.severity === 'high') score -= 15;
      else score -= 8;
    });
    score = Math.max(0, Math.min(100, score));

    const verdict: SpecialistAgentReview['verdict'] =
      score >= 85 ? 'approved' : score >= 65 ? 'approved_with_warnings' : 'needs_revision';

    const summary =
      findings.length === 0
        ? `Domain requirements for [${domain.toUpperCase()}] are fully adhered to with standard regulatory disclosures.`
        : `Domain audit for [${domain.toUpperCase()}] surfaced ${findings.length} specialized standard(s) requiring attention.`;

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
