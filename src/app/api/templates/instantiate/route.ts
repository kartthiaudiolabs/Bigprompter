import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { templateService } from '@/modules/templates';

const InstantiateSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  variableValues: z.record(z.string(), z.string()).default({}),
  projectId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = InstantiateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid template instantiation parameters',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const result = templateService.instantiateTemplate(parsed.data);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error('[API /api/templates/instantiate Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Template Instantiation Error' },
      { status: 500 }
    );
  }
}
