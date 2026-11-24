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
    const aiProvider = getAIProvider(provider);

    const fullPrompt = `${compiledPrompt}\n\n[USER INPUT INSTANTIATION]:\n${sampleInput}`;
    const startTime = Date.now();

    const stream = aiProvider.stream({
      prompt: fullPrompt,
      apiKey,
      maxTokens: 1500,
      temperature: 0.2,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let totalStreamedTokens = 0;
        try {
          for await (const chunk of stream) {
            totalStreamedTokens = chunk.tokensStreamed || totalStreamedTokens + 1;
            const data = JSON.stringify({
              text: chunk.text,
              isComplete: chunk.isComplete,
              tokensStreamed: totalStreamedTokens,
              elapsedMs: Date.now() - startTime,
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          controller.close();
        } catch (err: any) {
          const errData = JSON.stringify({ error: err.message || 'Stream error', isComplete: true });
          controller.enqueue(encoder.encode(`data: ${errData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
