import { describe, it, expect, beforeEach } from 'vitest';
import { RegisterRequestSchema, LoginRequestSchema } from '../../src/validation';
import { AuthService } from '../../src/modules/auth';

describe('Auth Module & Schemas', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should validate correct registration payload', () => {
    const valid = RegisterRequestSchema.safeParse({
      email: 'engineer@bigprompter.ai',
      password: 'strongPassword123',
      fullName: 'Principal Architect',
    });
    expect(valid.success).toBe(true);
  });

  it('should reject short passwords under 6 characters', () => {
    const invalid = RegisterRequestSchema.safeParse({
      email: 'engineer@bigprompter.ai',
      password: '123',
      fullName: 'Principal Architect',
    });
    expect(invalid.success).toBe(false);
  });

  it('should validate login request payload', () => {
    const valid = LoginRequestSchema.safeParse({
      email: 'engineer@bigprompter.ai',
      password: 'securePassword',
    });
    expect(valid.success).toBe(true);
  });
});
