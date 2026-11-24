import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequestSchema } from '@/validation';
import { detectDomain } from '@/modules/discovery';
import { extractRequirementBaseline } from '@/modules/requirements';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = AnalyzeRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { rawInput, domain: userDomain } = parsed.data;
    const domain = userDomain || detectDomain(rawInput);
    const baseline = extractRequirementBaseline(rawInput, domain);

    return NextResponse.json({
      success: true,
      domain,
      baseline,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
