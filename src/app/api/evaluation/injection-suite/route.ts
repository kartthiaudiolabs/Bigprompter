import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adversarialSuiteRunner } from '@/modules/evaluation';

const InjectionSuiteSchema = z.object({
  promptText: z.string().min(1, 'Prompt text is required'),
  provider: z.enum(['deterministic', 'google', 'anthropic', 'openai']).optional(),
  apiKey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = InjectionSuiteSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid injection suite parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const report = await adversarialSuiteRunner.runSuite(parsed.data.promptText, {
      provider: parsed.data.provider,
      apiKey: parsed.data.apiKey,
    });

    return NextResponse.json(report);
  } catch (err: any) {
    console.error('[API /api/evaluation/injection-suite Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Adversarial Injection Suite Error' },
      { status: 500 }
    );
  }
}
