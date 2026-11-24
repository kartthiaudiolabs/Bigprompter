import { AIProvider, GenerationRequest, GenerationResult, GenerationChunk, CostEstimate } from './types';

export class GeminiAdapter implements AIProvider {
  readonly providerId = 'google' as const;
  private readonly defaultModel = 'gemini-2.5-flash';

  async validateConfiguration(): Promise<boolean> {
    const key = process.env.GOOGLE_GEMINI_API_KEY;
    return Boolean(key && key.trim().length > 10);
  }

  estimateCost(request: GenerationRequest): Promise<CostEstimate> {
    const inputTokens = Math.round(request.prompt.length / 4);
    const outputTokens = request.maxTokens || 800;
    const ratePerMillionUSD = 0.35; // Gemini Flash blend rate
    const estimatedCostUSD = ((inputTokens + outputTokens) / 1_000_000) * ratePerMillionUSD;

    return Promise.resolve({
      estimatedCostUSD: Number(estimatedCostUSD.toFixed(6)),
      inputTokens,
      outputTokens,
      ratePerMillionUSD,
    });
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    const apiKey = request.apiKey || process.env.GOOGLE_GEMINI_API_KEY;
    const model = request.model || this.defaultModel;

    if (!apiKey) {
      throw new Error('[GeminiAdapter] Google Gemini API Key is missing. Provide a valid key in settings or environment.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

    const body: Record<string, any> = {
      contents: [{ parts: [{ text: request.prompt }] }],
      generationConfig: {
        temperature: request.temperature ?? 0.2,
        maxOutputTokens: request.maxTokens ?? 2048,
      },
    };

    if (request.systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: request.systemInstruction }],
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const msg = errorJson?.error?.message || `Gemini API returned status ${response.status}`;
      throw new Error(`[GeminiAdapter] ${msg}`);
    }

    const data = await response.json();
    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const inputTokens = data.usageMetadata?.promptTokenCount || Math.round(request.prompt.length / 4);
    const outputTokens = data.usageMetadata?.candidatesTokenCount || Math.round(outputText.length / 4);
    const totalTokens = data.usageMetadata?.totalTokenCount || (inputTokens + outputTokens);

    const cost = await this.estimateCost(request);

    return {
      outputText,
      inputTokens,
      outputTokens,
      totalTokens,
      latencyMs,
      provider: 'google',
      model,
      cost,
      status: 'success',
    };
  }

  async *stream(request: GenerationRequest): AsyncIterable<GenerationChunk> {
    const apiKey = request.apiKey || process.env.GOOGLE_GEMINI_API_KEY;
    const model = request.model || this.defaultModel;

    if (!apiKey) {
      throw new Error('[GeminiAdapter] Google Gemini API Key is missing for streaming.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey.trim()}`;

    const body: Record<string, any> = {
      contents: [{ parts: [{ text: request.prompt }] }],
      generationConfig: {
        temperature: request.temperature ?? 0.2,
        maxOutputTokens: request.maxTokens ?? 2048,
      },
    };

    if (request.systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: request.systemInstruction }],
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`[GeminiAdapter] Streaming failed: ${err}`);
    }

    const jsonText = await response.text();
    let streamedTokens = 0;

    try {
      // Parse multi-chunk array
      const chunks = JSON.parse(jsonText);
      if (Array.isArray(chunks)) {
        for (const item of chunks) {
          const text = item.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) {
            streamedTokens += Math.round(text.length / 4) || 1;
            yield { text, isComplete: false, tokensStreamed: streamedTokens };
          }
        }
      }
    } catch {
      // Fallback: yield whole response if non-array
      yield { text: jsonText, isComplete: false, tokensStreamed: Math.round(jsonText.length / 4) };
    }

    yield { text: '', isComplete: true, tokensStreamed: streamedTokens };
  }
}
