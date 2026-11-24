import { describe, it, expect } from 'vitest';
import { DeterministicAdapter } from '../../src/server/providers';

describe('AI Streaming Protocol', () => {
  it('should stream generation chunks sequentially and mark final chunk complete', async () => {
    const adapter = new DeterministicAdapter();
    const stream = adapter.stream({
      prompt: 'Test prompt stream',
    });

    const receivedChunks: string[] = [];
    let completed = false;
    let finalTokenCount = 0;

    for await (const chunk of stream) {
      if (chunk.text) {
        receivedChunks.push(chunk.text);
      }
      if (chunk.tokensStreamed) {
        finalTokenCount = chunk.tokensStreamed;
      }
      if (chunk.isComplete) {
        completed = true;
      }
    }

    expect(receivedChunks.length).toBeGreaterThan(1);
    expect(completed).toBe(true);
    expect(finalTokenCount).toBeGreaterThan(0);
  });
});
