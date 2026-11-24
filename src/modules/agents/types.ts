export type AgentRole =
  | 'security_auditor'
  | 'domain_specialist'
  | 'quality_evaluator'
  | 'architecture_reviewer';

export type FindingSeverity = 'info' | 'warning' | 'high' | 'critical';

export interface AgentFinding {
  id: string;
  agentRole: AgentRole;
  agentName: string;
  category: string;
  severity: FindingSeverity;
  message: string;
  recommendation: string;
  autoFixAvailable: boolean;
  affectedSection?: string;
}

export interface AgentDisagreement {
  id: string;
  agentsInvolved: [AgentRole, AgentRole];
  conflictDescription: string;
  tradeoffAnalysis: string;
  recommendedResolution: string;
  requiresUserApproval: boolean;
}

export interface SpecialistAgentReview {
  agentRole: AgentRole;
  agentName: string;
  score: number; // 0-100
  verdict: 'approved' | 'approved_with_warnings' | 'needs_revision' | 'rejected';
  findings: AgentFinding[];
  summary: string;
}

export interface OrchestrationReport {
  timestamp: string;
  overallScore: number; // 0-100
  readinessVerdict: 'ready' | 'conditional' | 'needs_work' | 'blocked';
  agentReviews: SpecialistAgentReview[];
  disagreements: AgentDisagreement[];
  criticalIssuesCount: number;
  warningsCount: number;
  orchestratorSynthesis: string;
  recommendedActions: string[];
}

export interface OrchestrationRequest {
  promptText: string;
  level?: 'L1' | 'L2' | 'L3' | 'L4';
  domain?: string;
  targetModel?: string;
  activeAgents?: AgentRole[];
}
