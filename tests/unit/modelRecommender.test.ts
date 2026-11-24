import { describe, it, expect } from 'vitest';
import { recommendTargetModel, MODEL_CATALOG } from '../../src/modules/providers/modelRecommender';

describe('Model Recommendation & Comparison Engine', () => {
  it('should recommend Claude 3.7 Sonnet for L4 software engineering by default', () => {
    const rec = recommendTargetModel('software-engineering', 'L4', 'quality');
    expect(rec.recommendedModel).toBe('claude-3-7-sonnet');
    expect(rec.rationale).toContain('software architecture');
  });

  it('should recommend DeepSeek R1 when cost optimization is prioritized', () => {
    const rec = recommendTargetModel('software-engineering', 'L3', 'cost');
    expect(rec.recommendedModel).toBe('deepseek-r1');
    expect(rec.rationale).toContain('lowest inference cost');
  });

  it('should recommend GPT-4o when latency is prioritized', () => {
    const rec = recommendTargetModel('copywriting-marketing', 'L2', 'latency');
    expect(rec.recommendedModel).toBe('gpt-4o');
    expect(rec.rationale).toContain('rapid');
  });

  it('should include full model catalog with token pricing', () => {
    const rec = recommendTargetModel('data-analytics', 'L3', 'quality');
    expect(rec.catalog.length).toBe(5);
    expect(MODEL_CATALOG['gemini-2-5-pro'].contextWindowTokens).toBe(1_000_000);
  });
});
