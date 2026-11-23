export type EngineeringLevel = 'L1' | 'L2' | 'L3' | 'L4';

export type TargetModel = 
  | 'claude-3-7-sonnet'
  | 'gpt-4o'
  | 'gemini-2-5-pro'
  | 'deepseek-r1'
  | 'universal';

export type UserMode = 'beginner' | 'professional' | 'expert';

export type DomainCategory = 
  | 'software-engineering'
  | 'copywriting-marketing'
  | 'customer-support'
  | 'data-analytics'
  | 'creative-production'
  | 'healthcare-science'
  | 'finance-legal'
  | 'general-assistant';

export interface DiscoveryOption {
  id: string;
  label: string;
  description?: string;
  isRecommended?: boolean;
}

export interface DiscoveryQuestion {
  id: string;
  category: 'role' | 'format' | 'constraints' | 'edge_cases' | 'model_fit' | 'context';
  question: string;
  rationale: string;
  options: DiscoveryOption[];
  allowCustom?: boolean;
  selectedOptionId?: string;
  customAnswer?: string;
}

export interface PromptComponentStructure {
  systemRole: string;
  contextAndMission: string;
  inputVariables: { name: string; description: string; required: boolean }[];
  executionInstructions: string[];
  negativeConstraints: string[];
  outputContract: string;
  edgeCasesAndFallbacks: string[];
  fewShotExamples?: { input: string; output: string }[];
  acceptanceCriteria: string[];
  securityGuardrails: string[];
}

export interface QualityAuditMetrics {
  intentFidelityScore: number; // 0 - 100
  structuralDepthScore: number; // 0 - 100
  securityResistanceScore: number; // 0 - 100
  modelCompatibilityScore: number; // 0 - 100
  overallScore: number;
  estimatedTokens: number;
  estimatedCostPer1kRuns: string;
  auditNotes: {
    type: 'success' | 'warning' | 'info';
    text: string;
  }[];
}

export interface PromptVersion {
  id: string;
  versionNumber: number;
  timestamp: string;
  level: EngineeringLevel;
  targetModel: TargetModel;
  compiledPrompt: string;
  components: PromptComponentStructure;
  metrics: QualityAuditMetrics;
  changeSummary: string;
}

export interface PromptProjectSession {
  id: string;
  title: string;
  rawInput: string;
  domain: DomainCategory;
  level: EngineeringLevel;
  targetModel: TargetModel;
  userMode: UserMode;
  stage: 'input' | 'discovery' | 'compiled';
  questions: DiscoveryQuestion[];
  currentVersion?: PromptVersion;
  history: PromptVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface StarterTemplate {
  id: string;
  title: string;
  category: DomainCategory;
  description: string;
  rawIdea: string;
  recommendedLevel: EngineeringLevel;
  recommendedModel: TargetModel;
}
