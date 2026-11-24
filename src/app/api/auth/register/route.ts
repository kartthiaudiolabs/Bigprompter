import { NextRequest, NextResponse } from 'next/server';
import { RegisterRequestSchema } from '@/validation';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = RegisterRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, fullName } = parsed.data;

    // Server-side registration response
    return NextResponse.json({
      success: true,
      user: {
        id: 'usr-' + Date.now(),
        email,
        fullName,
        userMode: 'professional',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
