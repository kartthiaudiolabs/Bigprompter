import { AIProvider, GenerationRequest, GenerationResult, GenerationChunk, CostEstimate } from './types';
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicAdapter implements AIProvider {
  readonly providerId = 'anthropic' as const;
  private readonly defaultModel = 'claude-3-7-sonnet-20250219';

  async validateConfiguration(): Promise<boolean> {
    const key = process.env.ANTHROPIC_API_KEY;
    return Boolean(key && key.trim().length > 10);
  }

  estimateCost(request: GenerationRequest): Promise<CostEstimate> {
    const inputTokens = Math.round(request.prompt.length / 4);
    const outputTokens = request.maxTokens || 1000;
    const ratePerMillionUSD = 3.0; // Claude 3.7 blended rate
    const estimatedCostUSD = ((inputTokens * 3.0 + outputTokens * 15.0) / 1_000_000);

    return Promise.resolve({
      estimatedCostUSD: Number(estimatedCostUSD.toFixed(6)),
      inputTokens,
      outputTokens,
      ratePerMillionUSD,
    });
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    const apiKey = request.apiKey || process.env.ANTHROPIC_API_KEY;
    const model = request.model || this.defaultModel;

    if (!apiKey) {
      throw new Error('[AnthropicAdapter] Anthropic API Key is missing. Provide a valid key in settings or environment.');
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model,
      max_tokens: request.maxTokens || 2048,
      system: request.systemInstruction || undefined,
      messages: [{ role: 'user', content: request.prompt }],
    });

    const latencyMs = Date.now() - startTime;
    const outputText = message.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');

    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    const totalTokens = inputTokens + outputTokens;
    const cost = await this.estimateCost(request);

    return {
      outputText,
      inputTokens,
      outputTokens,
      totalTokens,
      latencyMs,
      provider: 'anthropic',
      model,
      cost,
      status: 'success',
    };
  }

  async *stream(request: GenerationRequest): AsyncIterable<GenerationChunk> {
    const apiKey = request.apiKey || process.env.ANTHROPIC_API_KEY;
    const model = request.model || this.defaultModel;

    if (!apiKey) {
      throw new Error('[AnthropicAdapter] Anthropic API Key is missing for streaming.');
    }

    const client = new Anthropic({ apiKey });
    const stream = await client.messages.stream({
      model,
      max_tokens: request.maxTokens || 2048,
      system: request.systemInstruction || undefined,
      messages: [{ role: 'user', content: request.prompt }],
    });

    let streamedTokens = 0;
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && (event.delta as any)?.text) {
        const text = (event.delta as any).text;
        streamedTokens += Math.round(text.length / 4) || 1;
        yield { text, isComplete: false, tokensStreamed: streamedTokens };
      }
    }

    yield { text: '', isComplete: true, tokensStreamed: streamedTokens };
  }
}
