import { EngineeringLevel, TargetModel, DomainCategory } from '@/validation';

export interface ArchitectureBlock {
  id: string;
  title: string;
  tagPattern: string;
  category: 'security' | 'persona' | 'workflow' | 'contract' | 'recovery' | 'evaluation';
  description: string;
  levelRequired: EngineeringLevel;
  isEnabled: boolean;
  isMandatory: boolean;
}

export interface PromptArchitectureSchematic {
  title: string;
  level: EngineeringLevel;
  targetModel: TargetModel;
  domain: DomainCategory;
  dataFlowDiagram: string;
  blocks: ArchitectureBlock[];
}

export function designPromptArchitecture(
  rawPrompt: string,
  domain: DomainCategory,
  level: EngineeringLevel,
  targetModel: TargetModel
): PromptArchitectureSchematic {
  const isL4 = level === 'L4';
  const isL3 = level === 'L3';
  const isL2 = level === 'L2';

  const blocks: ArchitectureBlock[] = [
    {
      id: 'block-agent-manifest',
      title: 'Agent Identity & Protocol Manifest',
      tagPattern: '<agent_manifest>',
      category: 'persona',
      description: 'Defines autonomous agent metadata, version number, and sandbox containment rules.',
      levelRequired: 'L4',
      isEnabled: isL4,
      isMandatory: false,
    },
    {
      id: 'block-system-role',
      title: 'Senior Persona & Authority Scrutiny',
      tagPattern: '<system_role>',
      category: 'persona',
      description: 'Establishes domain principal authority, precision, and tone.',
      levelRequired: 'L1',
      isEnabled: true,
      isMandatory: true,
    },
    {
      id: 'block-security-defenses',
      title: 'Prompt-Injection & Jailbreak Defenses',
      tagPattern: '<security_and_injection_defenses>',
      category: 'security',
      description: 'Enforces untrusted input isolation, instruction overrides immunity, and token leakage protections.',
      levelRequired: 'L3',
      isEnabled: isL3 || isL4,
      isMandatory: isL4,
    },
    {
      id: 'block-mission-context',
      title: 'Mission Specification & Core Intent',
      tagPattern: '<mission_specification>',
      category: 'workflow',
      description: 'Formalizes the primary objective extracted from the raw user prompt.',
      levelRequired: 'L1',
      isEnabled: true,
      isMandatory: true,
    },
    {
      id: 'block-execution-protocol',
      title: 'Step-by-Step Logic & Task Decomposition',
      tagPattern: '<execution_protocol>',
      category: 'workflow',
      description: 'Sequences the model through Ingestion -> Architecture -> Execution -> Quality verification.',
      levelRequired: 'L2',
      isEnabled: isL2 || isL3 || isL4,
      isMandatory: true,
    },
    {
      id: 'block-negative-constraints',
      title: 'Negative Boundaries & Anti-Hallucination Guardrails',
      tagPattern: '<negative_constraints>',
      category: 'contract',
      description: 'Bans AI cliches, fabricated packages, conversational filler, and unauthorized external dependencies.',
      levelRequired: 'L2',
      isEnabled: isL2 || isL3 || isL4,
      isMandatory: true,
    },
    {
      id: 'block-output-contract',
      title: 'Output Schema Contract (XML / JSON / Typed Markdown)',
      tagPattern: '<output_contract>',
      category: 'contract',
      description: 'Strict format boundaries ensuring downstream tools or developers parse results seamlessly.',
      levelRequired: 'L1',
      isEnabled: true,
      isMandatory: true,
    },
    {
      id: 'block-edge-cases',
      title: 'Edge Case & Failure Recovery Matrix',
      tagPattern: '<edge_cases_and_failure_matrix>',
      category: 'recovery',
      description: 'Defines fallback protocols when input is ambiguous, truncated, or exceeds scope.',
      levelRequired: 'L3',
      isEnabled: isL3 || isL4,
      isMandatory: false,
    },
    {
      id: 'block-few-shots',
      title: 'Demonstrative Few-Shot Input/Output Pair',
      tagPattern: '<demonstrative_few_shots>',
      category: 'evaluation',
      description: 'Anchors model behavior with concrete input and expected output examples.',
      levelRequired: 'L3',
      isEnabled: isL3 || isL4,
      isMandatory: false,
    },
    {
      id: 'block-untrusted-payload',
      title: 'Untrusted User Payload Container',
      tagPattern: '<untrusted_user_input>',
      category: 'security',
      description: 'Isolates the actual user runtime input payload so malicious commands are treated as inert data.',
      levelRequired: 'L3',
      isEnabled: isL3 || isL4,
      isMandatory: isL4,
    },
  ];

  const dataFlowDiagram = `[Runtime Input Payload]
      ↓
[<untrusted_user_input> Boundary Container]
      ↓
[<security_and_injection_defenses> Filter]
      ↓
[<system_role> Persona & Mission Decoupling]
      ↓
[<execution_protocol> Step-by-Step Pipeline]
      ↓
[<negative_constraints> Guardrail Check]
      ↓
[<output_contract> Deterministic Deliverable]`;

  return {
    title: `Architecture Schematic: ${domain.replace('-', ' ').toUpperCase()} (${level})`,
    level,
    targetModel,
    domain,
    dataFlowDiagram,
    blocks,
  };
}
