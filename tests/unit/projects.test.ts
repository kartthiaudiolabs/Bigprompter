import { describe, it, expect, beforeEach } from 'vitest';
import { CreateProjectSchema, UpdateProjectSchema } from '../../src/validation';
import { ProjectService } from '../../src/modules/projects';

describe('Project Management & Workspace Isolation', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should validate create project schema', () => {
    const valid = CreateProjectSchema.safeParse({
      title: 'Autonomous Code Reviewer',
      description: 'Reviews pull requests with security focus',
      objectives: ['Zero false positives', 'OWASP vulnerability checks'],
    });
    expect(valid.success).toBe(true);
  });

  it('should reject project titles with fewer than 2 characters', () => {
    const invalid = CreateProjectSchema.safeParse({
      title: 'A',
    });
    expect(invalid.success).toBe(false);
  });

  it('should validate project update payload', () => {
    const valid = UpdateProjectSchema.safeParse({
      title: 'Updated Scope',
      isArchived: true,
    });
    expect(valid.success).toBe(true);
  });
});
