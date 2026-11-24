import { describe, it, expect } from 'vitest';
import { extractRequirementBaseline } from '../../src/modules/requirements';

describe('Requirement Baseline & Contradiction Detection Engine', () => {
  it('should extract explicit known requirements for JSON output and security boundaries', () => {
    const raw = 'Build an API prompt that outputs strict JSON schema with OWASP security checks';
    const baseline = extractRequirementBaseline(raw, 'software-engineering');

    expect(baseline.knownRequirements.some(r => r.category === 'format')).toBe(true);
    expect(baseline.knownRequirements.some(r => r.category === 'security')).toBe(true);
  });

  it('should detect contradictions when prompt requests both brevity and exhaustive depth', () => {
    const raw = 'Write a concise short prompt that provides a detailed exhaustive breakdown of all edge cases';
    const baseline = extractRequirementBaseline(raw, 'software-engineering');

    expect(baseline.contradictions.length).toBeGreaterThan(0);
    const depthBrevity = baseline.contradictions.find(c => c.id === 'contra-depth-brevity');
    expect(depthBrevity).toBeDefined();
    expect(depthBrevity?.severity).toBe('high');
    expect(depthBrevity?.recommendation).toContain('executive summary');
  });

  it('should detect contradiction when requesting code only and explanation', () => {
    const raw = 'Generate code only with deep explain details';
    const baseline = extractRequirementBaseline(raw, 'software-engineering');

    const codeContra = baseline.contradictions.find(c => c.id === 'contra-code-explanation');
    expect(codeContra).toBeDefined();
  });

  it('should flag simple short prompts as fast-track eligible', () => {
    const simple = 'Translate English to Spanish';
    const baseline = extractRequirementBaseline(simple, 'general-assistant');

    expect(baseline.complexityScore).toBe('simple');
    expect(baseline.canFastTrack).toBe(true);
  });
});
