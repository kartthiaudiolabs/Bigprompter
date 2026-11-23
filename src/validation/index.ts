import { z } from 'zod';

export const EngineeringLevelSchema = z.enum(['L1', 'L2', 'L3', 'L4']);
export type EngineeringLevel = z.infer<typeof EngineeringLevelSchema>;

export const TargetModelSchema = z.enum([
  'claude-3-7-sonnet',
  'gpt-4o',
  'gemini-2-5-pro',
  'deepseek-r1',
  'universal'
]);
export type TargetModel = z.infer<typeof TargetModelSchema>;

export const DomainCategorySchema = z.enum([
  'software-engineering',
  'copywriting-marketing',
  'customer-support',
  'data-analytics',
  'creative-production',
  'healthcare-science',
  'finance-legal',
  'general-assistant'
]);
export type DomainCategory = z.infer<typeof DomainCategorySchema>;

export const UserModeSchema = z.enum(['beginner', 'professional', 'expert']);
export type UserMode = z.infer<typeof UserModeSchema>;

export const DiscoveryRequestSchema = z.object({
  rawInput: z.string().min(3, 'Raw prompt must be at least 3 characters').max(10000, 'Prompt exceeds maximum length'),
  preferredLevel: EngineeringLevelSchema.optional().default('L4'),
  preferredModel: TargetModelSchema.optional().default('claude-3-7-sonnet')
});
export type DiscoveryRequest = z.infer<typeof DiscoveryRequestSchema>;

export const AnswerItemSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().optional(),
  customAnswer: z.string().optional()
});

export const CompileRequestSchema = z.object({
  rawInput: z.string().min(3, 'Raw prompt must be at least 3 characters'),
  domain: DomainCategorySchema,
  level: EngineeringLevelSchema,
  targetModel: TargetModelSchema,
  answers: z.array(AnswerItemSchema)
});
export type CompileRequest = z.infer<typeof CompileRequestSchema>;

export const SandboxExecutionRequestSchema = z.object({
  compiledPrompt: z.string().min(10, 'Compiled prompt is required'),
  sampleInput: z.string().max(50000).default('Run standard verification'),
  provider: z.enum(['google', 'anthropic', 'openai', 'deterministic']).default('deterministic'),
  apiKey: z.string().optional()
});
export type SandboxExecutionRequest = z.infer<typeof SandboxExecutionRequestSchema>;
