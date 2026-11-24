import { describe, it, expect } from 'vitest';
import { designPromptArchitecture } from '../../src/modules/architecture';

describe('Prompt Architecture Designer', () => {
  it('should design complete L4 production architecture with mandatory security and manifest blocks', () => {
    const schematic = designPromptArchitecture(
      'Autonomous Code Reviewer',
      'software-engineering',
      'L4',
      'claude-3-7-sonnet'
    );

    expect(schematic.level).toBe('L4');
    expect(schematic.blocks.length).toBeGreaterThanOrEqual(8);

    const manifest = schematic.blocks.find(b => b.id === 'block-agent-manifest');
    expect(manifest?.isEnabled).toBe(true);

    const security = schematic.blocks.find(b => b.id === 'block-security-defenses');
    expect(security?.isEnabled).toBe(true);
    expect(security?.isMandatory).toBe(true);

    const untrusted = schematic.blocks.find(b => b.id === 'block-untrusted-payload');
    expect(untrusted?.isEnabled).toBe(true);
    expect(untrusted?.isMandatory).toBe(true);
  });

  it('should design lightweight L1 architecture omitting complex security containers', () => {
    const schematic = designPromptArchitecture(
      'Simple Task',
      'general-assistant',
      'L1',
      'universal'
    );

    const manifest = schematic.blocks.find(b => b.id === 'block-agent-manifest');
    expect(manifest?.isEnabled).toBe(false);

    const security = schematic.blocks.find(b => b.id === 'block-security-defenses');
    expect(security?.isEnabled).toBe(false);
  });

  it('should produce data flow pipeline diagram', () => {
    const schematic = designPromptArchitecture(
      'B2B SaaS copy',
      'copywriting-marketing',
      'L3',
      'gpt-4o'
    );

    expect(schematic.dataFlowDiagram).toContain('<untrusted_user_input>');
    expect(schematic.dataFlowDiagram).toContain('<output_contract>');
  });
});
