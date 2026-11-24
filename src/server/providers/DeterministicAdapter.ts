import { AIProvider, GenerationRequest, GenerationResult, GenerationChunk, CostEstimate } from './types';

export class DeterministicAdapter implements AIProvider {
  readonly providerId = 'deterministic' as const;

  validateConfiguration(): Promise<boolean> {
    return Promise.resolve(true);
  }

  estimateCost(request: GenerationRequest): Promise<CostEstimate> {
    const inputTokens = Math.round(request.prompt.length / 4);
    const outputTokens = 250;
    return Promise.resolve({
      estimatedCostUSD: 0,
      inputTokens,
      outputTokens,
      ratePerMillionUSD: 0,
    });
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 80));
    const latencyMs = Date.now() - startTime;

    const inputSnippet = request.prompt.slice(0, 80).replace(/\n/g, ' ');
    const outputText = `### [BIG PROMPTER TEST RUNNER: DETERMINISTIC VERIFICATION OUTPUT]
Status: 200 OK | Isolated Execution Container

#### Execution Analysis:
- Ingested Input: "${inputSnippet}..."
- Target Protocol: Big Prompter Senior Prompt Engineer Runtime
- Constraints Adhered: Strict schema, zero-hallucination boundaries, untrusted input isolation.

#### Executed Output:
\`\`\`markdown
# Production Execution Verification
1. Schema Validation: PASSED (All specified delimiters and tags respected).
2. Input Containment: PASSED (Untrusted input tags isolated safely).
3. Deliverable Core: Processed sample query adhering to active system instructions.
\`\`\`

*(Note: Provide a Gemini, Claude, or OpenAI API key in Settings to execute live against external models).*`;

    const inputTokens = Math.round(request.prompt.length / 4);
    const outputTokens = Math.round(outputText.length / 4);

    return {
      outputText,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      latencyMs,
      provider: 'deterministic',
      model: 'big-prompter-deterministic-v1',
      cost: {
        estimatedCostUSD: 0,
        inputTokens,
        outputTokens,
        ratePerMillionUSD: 0,
      },
      status: 'fallback',
    };
  }

  async *stream(request: GenerationRequest): AsyncIterable<GenerationChunk> {
    const fullResult = await this.generate(request);
    const words = fullResult.outputText.split(' ');

    let currentTokens = 0;
    for (let i = 0; i < words.length; i += 4) {
      const chunkWords = words.slice(i, i + 4).join(' ') + ' ';
      currentTokens += Math.round(chunkWords.length / 4) || 1;
      await new Promise(r => setTimeout(r, 20)); // simulated token stream rate
      yield { text: chunkWords, isComplete: false, tokensStreamed: currentTokens };
    }

    yield { text: '', isComplete: true, tokensStreamed: currentTokens };
  }
}
