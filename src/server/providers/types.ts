export interface GenerationChunk {
  text: string;
  isComplete: boolean;
  tokensStreamed?: number;
}

export interface GenerationRequest {
  prompt: string;
  systemInstruction?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  apiKey?: string;
}

export interface CostEstimate {
  estimatedCostUSD: number;
  inputTokens: number;
  outputTokens: number;
  ratePerMillionUSD: number;
}

export interface GenerationResult {
  outputText: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  provider: string;
  model: string;
  cost: CostEstimate;
  status: 'success' | 'fallback' | 'error';
}

export interface AIProvider {
  readonly providerId: 'google' | 'anthropic' | 'openai' | 'deterministic';
  generate(request: GenerationRequest): Promise<GenerationResult>;
  stream(request: GenerationRequest): AsyncIterable<GenerationChunk>;
  estimateCost(request: GenerationRequest): Promise<CostEstimate>;
  validateConfiguration(): Promise<boolean>;
}
