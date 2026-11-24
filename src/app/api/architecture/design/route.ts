import { NextRequest, NextResponse } from 'next/server';
import { DesignArchitectureRequestSchema } from '@/validation';
import { designPromptArchitecture } from '@/modules/architecture';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = DesignArchitectureRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { rawInput, domain, level, targetModel } = parsed.data;
    const schematic = designPromptArchitecture(rawInput, domain, level, targetModel);

    return NextResponse.json({
      success: true,
      schematic,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
