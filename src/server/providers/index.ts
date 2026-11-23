import { AIProvider } from './types';
import { GeminiAdapter } from './GeminiAdapter';
import { DeterministicAdapter } from './DeterministicAdapter';

export * from './types';
export * from './GeminiAdapter';
export * from './DeterministicAdapter';

export function getAIProvider(providerId?: string): AIProvider {
  switch (providerId) {
    case 'google':
      return new GeminiAdapter();
    case 'deterministic':
    default:
      return new DeterministicAdapter();
  }
}
