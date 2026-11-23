import { NextRequest, NextResponse } from 'next/server';
import { SandboxExecutionRequestSchema } from '@/validation';
import { getAIProvider } from '@/server/providers';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = SandboxExecutionRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { compiledPrompt, sampleInput, provider, apiKey } = parsed.data;

    // Use selected provider or fall back to deterministic container
    const aiProvider = getAIProvider(provider);

    const result = await aiProvider.generate({
      prompt: `${compiledPrompt}\n\n[USER INPUT INSTANTIATION]:\n${sampleInput}`,
      apiKey,
      maxTokens: 1500,
      temperature: 0.2,
    });

    return NextResponse.json({
      success: true,
      output: result.outputText,
      latencyMs: result.latencyMs,
      tokensUsed: result.totalTokens,
      providerUsed: result.provider,
      status: result.status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
