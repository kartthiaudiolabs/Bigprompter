import { describe, it, expect } from 'vitest';
import {
  EngineeringLevelSchema,
  TargetModelSchema,
  DiscoveryRequestSchema,
  CompileRequestSchema,
  SandboxExecutionRequestSchema
} from '../../src/validation';

describe('Validation Schemas (Zod)', () => {
  it('should validate allowed engineering levels L1 to L4', () => {
    expect(EngineeringLevelSchema.safeParse('L1').success).toBe(true);
    expect(EngineeringLevelSchema.safeParse('L2').success).toBe(true);
    expect(EngineeringLevelSchema.safeParse('L3').success).toBe(true);
    expect(EngineeringLevelSchema.safeParse('L4').success).toBe(true);
    expect(EngineeringLevelSchema.safeParse('L5').success).toBe(false);
    expect(EngineeringLevelSchema.safeParse('BASIC').success).toBe(false);
  });

  it('should validate target models', () => {
    expect(TargetModelSchema.safeParse('claude-3-7-sonnet').success).toBe(true);
    expect(TargetModelSchema.safeParse('gemini-2-5-pro').success).toBe(true);
    expect(TargetModelSchema.safeParse('gpt-4o').success).toBe(true);
    expect(TargetModelSchema.safeParse('deepseek-r1').success).toBe(true);
    expect(TargetModelSchema.safeParse('universal').success).toBe(true);
    expect(TargetModelSchema.safeParse('invalid-model').success).toBe(false);
  });

  it('should reject raw prompts that are too short', () => {
    const invalid = DiscoveryRequestSchema.safeParse({ rawInput: 'ab' });
    expect(invalid.success).toBe(false);

    const valid = DiscoveryRequestSchema.safeParse({ rawInput: 'Build a code reviewer' });
    expect(valid.success).toBe(true);
  });

  it('should validate compilation request payloads', () => {
    const valid = CompileRequestSchema.safeParse({
      rawInput: 'Autonomous code review bot',
      domain: 'software-engineering',
      level: 'L4',
      targetModel: 'claude-3-7-sonnet',
      answers: [
        { questionId: 'q-role', selectedOptionId: 'role-staff-architect' }
      ]
    });
    expect(valid.success).toBe(true);
  });

  it('should validate sandbox execution payloads', () => {
    const valid = SandboxExecutionRequestSchema.safeParse({
      compiledPrompt: '<system_role>Expert Code Reviewer</system_role>',
      sampleInput: 'console.log("hello world");',
      provider: 'deterministic'
    });
    expect(valid.success).toBe(true);
  });
});
