import { AIProvider, GenerationRequest, GenerationResult, CostEstimate } from './types';

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
      estimatedCostUSD,
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
      throw new Error('Google Gemini API Key is missing. Provide a valid key in settings or environment.');
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
}
