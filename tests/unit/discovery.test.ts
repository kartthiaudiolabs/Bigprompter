import { describe, it, expect } from 'vitest';
import { detectDomain, generateDiscoveryQuestions } from '../../src/modules/discovery';

describe('Discovery Engine', () => {
  it('should accurately classify domain categories from raw prompts', () => {
    expect(detectDomain('Write a typescript react component')).toBe('software-engineering');
    expect(detectDomain('High-converting landing page headline for b2b')).toBe('copywriting-marketing');
    expect(detectDomain('PostgreSQL query to find top revenue users')).toBe('data-analytics');
    expect(detectDomain('Help desk chatbot for refunds and customer complaints')).toBe('customer-support');
    expect(detectDomain('Audio mix mastering and vocal chain')).toBe('creative-production');
    expect(detectDomain('Review GDPR contract compliance and liability')).toBe('finance-legal');
    expect(detectDomain('Random general conversation')).toBe('general-assistant');
  });

  it('should generate 4 structured discovery questions with recommended defaults', () => {
    const questions = generateDiscoveryQuestions('Build a code review tool', 'software-engineering');
    expect(questions.length).toBe(4);

    const roleQ = questions.find(q => q.category === 'role');
    expect(roleQ).toBeDefined();
    expect(roleQ?.options.length).toBeGreaterThanOrEqual(2);
    expect(roleQ?.options.some(o => o.isRecommended)).toBe(true);
    expect(roleQ?.rationale).toBeDefined();

    const formatQ = questions.find(q => q.category === 'format');
    expect(formatQ).toBeDefined();

    const constraintQ = questions.find(q => q.category === 'constraints');
    expect(constraintQ).toBeDefined();

    const edgeQ = questions.find(q => q.category === 'edge_cases');
    expect(edgeQ).toBeDefined();
  });
});
