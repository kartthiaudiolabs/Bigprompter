import { describe, it, expect } from 'vitest';
import { DeterministicAdapter, GeminiAdapter, getAIProvider } from '../../src/server/providers';

describe('AI Provider Abstraction Layer', () => {
  it('should instantiate DeterministicAdapter by default', async () => {
    const provider = getAIProvider();
    expect(provider.providerId).toBe('deterministic');

    const configValid = await provider.validateConfiguration();
    expect(configValid).toBe(true);
  });

  it('should execute deterministic generation with normalized response', async () => {
    const provider = new DeterministicAdapter();
    const result = await provider.generate({
      prompt: 'Test prompt payload',
      systemInstruction: 'You are an engineer'
    });

    expect(result.status).toBe('fallback');
    expect(result.outputText).toContain('BIG PROMPTER TEST RUNNER');
    expect(result.totalTokens).toBeGreaterThan(0);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should calculate cost estimates for Gemini models', async () => {
    const gemini = new GeminiAdapter();
    const cost = await gemini.estimateCost({
      prompt: 'A'.repeat(4000), // ~1000 tokens
      maxTokens: 1000
    });

    expect(cost.inputTokens).toBe(1000);
    expect(cost.outputTokens).toBe(1000);
    expect(cost.estimatedCostUSD).toBeGreaterThan(0);
  });
});
