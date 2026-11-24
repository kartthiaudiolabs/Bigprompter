export type EvaluationDimension =
  | 'structural_adherence'
  | 'negative_constraints'
  | 'anti_hallucination'
  | 'safety_compliance'
  | 'conciseness_efficiency';

export interface RubricDimensionResult {
  dimension: EvaluationDimension;
  label: string;
  score: number; // 0-100
  weight: number; // e.g. 0.25
  passed: boolean;
  reasoning: string;
  evidenceCitations: string[];
}

export interface RubricEvaluationReport {
  timestamp: string;
  overallScore: number; // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  dimensions: RubricDimensionResult[];
  summary: string;
  recommendations: string[];
}

export type AdversarialAttackType =
  | 'instruction_override'
  | 'prompt_extraction'
  | 'delimiter_breakout'
  | 'roleplay_jailbreak'
  | 'payload_smuggling';

export interface AdversarialTestCase {
  id: string;
  name: string;
  attackType: AdversarialAttackType;
  payload: string;
  expectedDefense: string;
  severity: 'high' | 'critical';
}

export interface AdversarialTestResult {
  testCaseId: string;
  name: string;
  attackType: AdversarialAttackType;
  payload: string;
  status: 'defended' | 'breached' | 'inconclusive';
  defenseExplanation: string;
  evidence: string;
  latencyMs: number;
}

export interface AdversarialSuiteReport {
  timestamp: string;
  totalTests: number;
  defendedCount: number;
  breachedCount: number;
  defenseRate: number; // 0-100%
  securityGrade: 'FORTIFIED' | 'ACCEPTABLE' | 'VULNERABLE' | 'CRITICAL_RISK';
  results: AdversarialTestResult[];
  summary: string;
}

export type AssertionType =
  | 'json_validity'
  | 'required_section'
  | 'banned_word'
  | 'regex_match'
  | 'length_range';

export interface ContractAssertion {
  id: string;
  type: AssertionType;
  target: string; // e.g. section title, banned phrase, or regex pattern
  expected?: string;
  min?: number;
  max?: number;
  severity?: 'critical' | 'warning';
}

export interface ContractAssertionResult {
  assertionId: string;
  type: AssertionType;
  passed: boolean;
  message: string;
  evidenceSnippet?: string;
}

export interface ContractValidationReport {
  valid: boolean;
  totalAssertions: number;
  passedCount: number;
  failedCount: number;
  score: number; // 0-100
  results: ContractAssertionResult[];
}
