import { NextRequest, NextResponse } from 'next/server';
import { DiscoveryRequestSchema } from '@/validation';
import { detectDomain, generateDiscoveryQuestions } from '@/modules/discovery';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = DiscoveryRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { rawInput } = parsed.data;
    const domain = detectDomain(rawInput);
    const questions = generateDiscoveryQuestions(rawInput, domain);

    return NextResponse.json({
      success: true,
      domain,
      questions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
