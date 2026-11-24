import { AIProvider, GenerationRequest, GenerationResult, GenerationChunk, CostEstimate } from './types';
import OpenAI from 'openai';

export class OpenAIAdapter implements AIProvider {
  readonly providerId = 'openai' as const;
  private readonly defaultModel = 'gpt-4o';

  async validateConfiguration(): Promise<boolean> {
    const key = process.env.OPENAI_API_KEY;
    return Boolean(key && key.trim().length > 10);
  }

  estimateCost(request: GenerationRequest): Promise<CostEstimate> {
    const inputTokens = Math.round(request.prompt.length / 4);
    const outputTokens = request.maxTokens || 1000;
    const ratePerMillionUSD = 2.5; // GPT-4o blended rate
    const estimatedCostUSD = ((inputTokens * 2.5 + outputTokens * 10.0) / 1_000_000);

    return Promise.resolve({
      estimatedCostUSD: Number(estimatedCostUSD.toFixed(6)),
      inputTokens,
      outputTokens,
      ratePerMillionUSD,
    });
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    const apiKey = request.apiKey || process.env.OPENAI_API_KEY;
    const model = request.model || this.defaultModel;

    if (!apiKey) {
      throw new Error('[OpenAIAdapter] OpenAI API Key is missing. Provide a valid key in settings or environment.');
    }

    const openai = new OpenAI({ apiKey });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (request.systemInstruction) {
      messages.push({ role: 'system', content: request.systemInstruction });
    }
    messages.push({ role: 'user', content: request.prompt });

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: request.temperature ?? 0.2,
      max_tokens: request.maxTokens ?? 2048,
    });

    const latencyMs = Date.now() - startTime;
    const outputText = completion.choices[0]?.message?.content || '';
    const inputTokens = completion.usage?.prompt_tokens || Math.round(request.prompt.length / 4);
    const outputTokens = completion.usage?.completion_tokens || Math.round(outputText.length / 4);
    const totalTokens = completion.usage?.total_tokens || (inputTokens + outputTokens);
    const cost = await this.estimateCost(request);

    return {
      outputText,
      inputTokens,
      outputTokens,
      totalTokens,
      latencyMs,
      provider: 'openai',
      model,
      cost,
      status: 'success',
    };
  }

  async *stream(request: GenerationRequest): AsyncIterable<GenerationChunk> {
    const apiKey = request.apiKey || process.env.OPENAI_API_KEY;
    const model = request.model || this.defaultModel;

    if (!apiKey) {
      throw new Error('[OpenAIAdapter] OpenAI API Key is missing for streaming.');
    }

    const openai = new OpenAI({ apiKey });
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (request.systemInstruction) {
      messages.push({ role: 'system', content: request.systemInstruction });
    }
    messages.push({ role: 'user', content: request.prompt });

    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature: request.temperature ?? 0.2,
      max_tokens: request.maxTokens ?? 2048,
      stream: true,
    });

    let streamedTokens = 0;
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        streamedTokens += Math.round(text.length / 4) || 1;
        yield { text, isComplete: false, tokensStreamed: streamedTokens };
      }
    }

    yield { text: '', isComplete: true, tokensStreamed: streamedTokens };
  }
}
