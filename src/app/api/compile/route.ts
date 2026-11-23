import { NextRequest, NextResponse } from 'next/server';
import { CompileRequestSchema } from '@/validation';
import { compileProductionPrompt } from '@/modules/compiler';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = CompileRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { rawInput, domain, level, targetModel, answers } = parsed.data;

    const result = compileProductionPrompt({
      rawPrompt: rawInput,
      domain,
      level,
      targetModel,
      answers,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
