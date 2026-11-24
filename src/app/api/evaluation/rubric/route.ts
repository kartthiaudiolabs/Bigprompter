import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rubricEvaluator } from '@/modules/evaluation';

const RubricSchema = z.object({
  promptText: z.string().min(1, 'Prompt text is required'),
  outputText: z.string().min(1, 'Output text is required for rubric evaluation'),
  domain: z.string().optional(),
  level: z.enum(['L1', 'L2', 'L3', 'L4']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = RubricSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid rubric parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const report = rubricEvaluator.evaluate(parsed.data);
    return NextResponse.json(report);
  } catch (err: any) {
    console.error('[API /api/evaluation/rubric Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Rubric Evaluation Error' },
      { status: 500 }
    );
  }
}
