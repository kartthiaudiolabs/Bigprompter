import { AIProvider } from './types';
import { GeminiAdapter } from './GeminiAdapter';
import { AnthropicAdapter } from './AnthropicAdapter';
import { OpenAIAdapter } from './OpenAIAdapter';
import { DeterministicAdapter } from './DeterministicAdapter';

export * from './types';
export * from './GeminiAdapter';
export * from './AnthropicAdapter';
export * from './OpenAIAdapter';
export * from './DeterministicAdapter';

export function getAIProvider(providerId?: string): AIProvider {
  switch (providerId) {
    case 'anthropic':
      return new AnthropicAdapter();
    case 'openai':
      return new OpenAIAdapter();
    case 'google':
      return new GeminiAdapter();
    case 'deterministic':
    default:
      return new DeterministicAdapter();
  }
}
