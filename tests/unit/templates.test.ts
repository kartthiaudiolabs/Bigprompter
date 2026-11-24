import { describe, it, expect } from 'vitest';
import { templateService, TEMPLATE_LIBRARY } from '@/modules/templates';

describe('Adaptive Template Library Suite (Phase 4)', () => {
  it('should have 8 pre-engineered production templates in the catalog', () => {
    expect(TEMPLATE_LIBRARY.length).toBeGreaterThanOrEqual(8);
  });

  it('should filter templates accurately by domain', () => {
    const healthcareTemplates = templateService.listTemplates({ domain: 'healthcare' });
    expect(healthcareTemplates.length).toBeGreaterThanOrEqual(1);
    expect(healthcareTemplates[0].domain).toBe('healthcare');

    const softwareTemplates = templateService.listTemplates({ domain: 'software' });
    expect(softwareTemplates.length).toBeGreaterThanOrEqual(1);
    expect(softwareTemplates[0].domain).toBe('software');
  });

  it('should filter templates accurately by level', () => {
    const l4Templates = templateService.listTemplates({ level: 'L4' });
    expect(l4Templates.length).toBeGreaterThan(0);
    expect(l4Templates.every((t) => t.level === 'L4')).toBe(true);
  });

  it('should search templates by keyword in title, description, or tags', () => {
    const results = templateService.listTemplates({ searchQuery: 'stride' });
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('tpl-sec-01');

    const hipaaResults = templateService.listTemplates({ searchQuery: 'hipaa' });
    expect(hipaaResults.length).toBe(1);
    expect(hipaaResults[0].id).toBe('tpl-med-01');
  });

  it('should instantiate template substituting custom user variables', () => {
    const instantiated = templateService.instantiateTemplate({
      templateId: 'tpl-soft-01',
      variableValues: {
        feature_name: 'Distributed Kafka Event Streamer',
        tech_stack: 'Go, Kafka, ClickHouse',
      },
    });

    expect(instantiated.domain).toBe('software');
    expect(instantiated.level).toBe('L4');
    expect(instantiated.promptText).toContain('Project Target: Distributed Kafka Event Streamer');
    expect(instantiated.promptText).toContain('Technology Stack: Go, Kafka, ClickHouse');
    // Default value should be used when not overridden
    expect(instantiated.promptText).toContain('Scale & SLA: 10,000 events/sec, p99 < 80ms');
  });

  it('should throw an error when instantiating a non-existent template ID', () => {
    expect(() =>
      templateService.instantiateTemplate({
        templateId: 'tpl-invalid-999',
        variableValues: {},
      })
    ).toThrowError(/Template not found/);
  });
});
