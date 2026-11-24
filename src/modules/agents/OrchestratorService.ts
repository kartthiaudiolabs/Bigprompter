import {
  AgentDisagreement,
  OrchestrationReport,
  OrchestrationRequest,
  SpecialistAgentReview,
} from './types';
import { SecurityAuditorAgent } from './SecurityAuditorAgent';
import { DomainSpecialistAgent } from './DomainSpecialistAgent';
import { QualityEvaluatorAgent } from './QualityEvaluatorAgent';
import { ArchitectureReviewerAgent } from './ArchitectureReviewerAgent';

export class OrchestratorService {
  private readonly securityAuditor = new SecurityAuditorAgent();
  private readonly domainSpecialist = new DomainSpecialistAgent();
  private readonly qualityEvaluator = new QualityEvaluatorAgent();
  private readonly architectureReviewer = new ArchitectureReviewerAgent();

  async orchestrate(request: OrchestrationRequest): Promise<OrchestrationReport> {
    const activeAgents = request.activeAgents || [
      'security_auditor',
      'domain_specialist',
      'quality_evaluator',
      'architecture_reviewer',
    ];

    const agentReviews: SpecialistAgentReview[] = [];

    if (activeAgents.includes('security_auditor')) {
      agentReviews.push(this.securityAuditor.review(request));
    }
    if (activeAgents.includes('domain_specialist')) {
      agentReviews.push(this.domainSpecialist.review(request));
    }
    if (activeAgents.includes('quality_evaluator')) {
      agentReviews.push(this.qualityEvaluator.review(request));
    }
    if (activeAgents.includes('architecture_reviewer')) {
      agentReviews.push(this.architectureReviewer.review(request));
    }

    // Detect agent disagreements
    const disagreements = this.detectDisagreements(agentReviews, request);

    // Calculate aggregated metrics
    const totalScore = agentReviews.reduce((acc, rev) => acc + rev.score, 0);
    const overallScore = Math.round(totalScore / (agentReviews.length || 1));

    let criticalIssuesCount = 0;
    let warningsCount = 0;

    agentReviews.forEach((review) => {
      review.findings.forEach((finding) => {
        if (finding.severity === 'critical') criticalIssuesCount++;
        else if (finding.severity === 'high' || finding.severity === 'warning') warningsCount++;
      });
    });

    let readinessVerdict: OrchestrationReport['readinessVerdict'] = 'ready';
    if (criticalIssuesCount > 0) {
      readinessVerdict = 'blocked';
    } else if (overallScore < 70 || disagreements.some((d) => d.requiresUserApproval)) {
      readinessVerdict = 'conditional';
    } else if (overallScore < 85) {
      readinessVerdict = 'needs_work';
    }

    // Recommended Actions synthesis
    const recommendedActions: string[] = [];
    agentReviews.forEach((review) => {
      review.findings.forEach((f) => {
        if (f.severity === 'critical' || f.severity === 'high') {
          recommendedActions.push(`[${review.agentName}] ${f.recommendation}`);
        }
      });
    });

    if (disagreements.length > 0) {
      disagreements.forEach((d) => {
        recommendedActions.push(`[Conflict Resolution] ${d.recommendedResolution}`);
      });
    }

    const orchestratorSynthesis = this.generateSynthesis(
      overallScore,
      readinessVerdict,
      criticalIssuesCount,
      warningsCount,
      disagreements.length
    );

    return {
      timestamp: new Date().toISOString(),
      overallScore,
      readinessVerdict,
      agentReviews,
      disagreements,
      criticalIssuesCount,
      warningsCount,
      orchestratorSynthesis,
      recommendedActions,
    };
  }

  private detectDisagreements(
    reviews: SpecialistAgentReview[],
    request: OrchestrationRequest
  ): AgentDisagreement[] {
    const disagreements: AgentDisagreement[] = [];
    const domain = (request.domain || '').toLowerCase();
    const level = request.level || 'L2';

    const security = reviews.find((r) => r.agentRole === 'security_auditor');
    const domainReview = reviews.find((r) => r.agentRole === 'domain_specialist');
    const architecture = reviews.find((r) => r.agentRole === 'architecture_reviewer');
    const quality = reviews.find((r) => r.agentRole === 'quality_evaluator');

    // 1. Creative flexibility vs Strict Security formatting
    if (domain.includes('creative') && security) {
      const hasStrictBoundary = security.findings.some((f) => f.id === 'sec-001');
      if (hasStrictBoundary) {
        disagreements.push({
          id: 'disagree-001',
          agentsInvolved: ['security_auditor', 'domain_specialist'],
          conflictDescription:
            'Security Auditor requires rigid input boundaries and negative constraints, which may constrain natural creative flow in creative writing workloads.',
          tradeoffAnalysis:
            'Rigid constraints prevent jailbreaks and hallucinations, but may induce robotic or formulaic prose in storytelling.',
          recommendedResolution:
            'Maintain lightweight input delimiter tagging while explicitly preserving freedom for tone, metaphors, and narrative pacing.',
          requiresUserApproval: true,
        });
      }
    }

    // 2. Regulatory Compliance Length vs Token Bloat
    if (domainReview && architecture) {
      const hasRegulatoryNeeds = domainReview.findings.some(
        (f) => f.category.includes('Compliance') || f.category.includes('Legal')
      );
      const hasBloatWarning = architecture.findings.some((f) => f.category === 'Token Efficiency');

      if (hasRegulatoryNeeds && hasBloatWarning) {
        disagreements.push({
          id: 'disagree-002',
          agentsInvolved: ['domain_specialist', 'architecture_reviewer'],
          conflictDescription:
            'Domain Specialist requires mandatory regulatory disclaimers, while Architecture Reviewer warns against token overhead.',
          tradeoffAnalysis:
            'Omitting disclaimers introduces compliance and liability risks. Including boilerplate consumes prompt context.',
          recommendedResolution:
            'Consolidate disclaimers into a concise, high-density single line directive at the end of the system contract.',
          requiresUserApproval: false,
        });
      }
    }

    // 3. Fast Turnaround vs L4 Comprehensive Architecture
    if (level === 'L1' || level === 'L2') {
      const archL4Demand = architecture?.findings.some((f) => f.id === 'arch-001');
      if (archL4Demand) {
        disagreements.push({
          id: 'disagree-003',
          agentsInvolved: ['architecture_reviewer', 'quality_evaluator'],
          conflictDescription:
            'Architecture Reviewer suggests heavy XML schema tags, but current task is calibrated for agile L1/L2 execution.',
          tradeoffAnalysis:
            'Over-engineering lightweight prompts increases cognitive load and setup time unnecessarily.',
          recommendedResolution:
            'Keep lightweight markdown headers for L1/L2; reserve full XML schema for L4 Production escalations.',
          requiresUserApproval: false,
        });
      }
    }

    return disagreements;
  }

  private generateSynthesis(
    overallScore: number,
    verdict: OrchestrationReport['readinessVerdict'],
    criticals: number,
    warnings: number,
    conflicts: number
  ): string {
    if (verdict === 'ready') {
      return `Orchestrator Verdict: APPROVED (${overallScore}/100). The prompt meets professional engineering standards across security, domain compliance, and architecture. All specialist consensus gates are satisfied.`;
    }
    if (verdict === 'blocked') {
      return `Orchestrator Verdict: BLOCKED (${overallScore}/100). Execution halted due to ${criticals} critical issue(s) flagged by specialist agents (e.g., missing mandatory clinical disclaimers or prompt injection vulnerabilities). Resolution required before production deployment.`;
    }
    if (verdict === 'conditional') {
      return `Orchestrator Verdict: CONDITIONAL PASS (${overallScore}/100). System is usable but requires user review on ${conflicts} architectural trade-off(s) and ${warnings} warning(s).`;
    }
    return `Orchestrator Verdict: REVISION RECOMMENDED (${overallScore}/100). The prompt requires architectural refinement and output contract hardening before deployment.`;
  }
}

export const orchestratorService = new OrchestratorService();
