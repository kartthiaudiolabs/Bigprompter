import { describe, it, expect, beforeEach } from 'vitest';
import { UsageTracker } from '../../src/modules/billing/usageTracker';

describe('Usage & Cost Tracker', () => {
  beforeEach(() => {
    UsageTracker.clear();
  });

  it('should record usage events and compute aggregate stats', () => {
    UsageTracker.record({
      projectId: 'proj-123',
      provider: 'google',
      model: 'gemini-2.5-flash',
      inputTokens: 1000,
      outputTokens: 500,
      totalTokens: 1500,
      estimatedCostUSD: 0.00052,
      latencyMs: 320,
    });

    UsageTracker.record({
      projectId: 'proj-123',
      provider: 'anthropic',
      model: 'claude-3-7-sonnet',
      inputTokens: 2000,
      outputTokens: 800,
      totalTokens: 2800,
      estimatedCostUSD: 0.018,
      latencyMs: 750,
    });

    const stats = UsageTracker.getStats('proj-123');
    expect(stats.totalCalls).toBe(2);
    expect(stats.totalTokens).toBe(4300);
    expect(stats.totalCostUSD).toBeGreaterThan(0.01);
    expect(stats.providerBreakdown['google'].calls).toBe(1);
    expect(stats.providerBreakdown['anthropic'].calls).toBe(1);
  });
});
