import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { exportService } from '@/modules/export';

const ExportSchema = z.object({
  promptText: z.string().min(1, 'Prompt text is required for export'),
  title: z.string().default('Promptexa Prompt'),
  version: z.number().default(1),
  level: z.string().default('L3'),
  domain: z.string().default('software'),
  targetModel: z.string().default('claude-3-7-sonnet'),
  format: z.enum([
    'markdown',
    'json',
    'yaml_langchain',
    'typescript',
    'python',
    'curl',
    'nextjs_route',
  ]),
  options: z
    .object({
      targetSdk: z.enum(['anthropic', 'google', 'openai']).optional(),
      streaming: z.boolean().optional(),
      temperature: z.number().optional(),
      maxTokens: z.number().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = ExportSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid export parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const bundle = exportService.createExportBundle(parsed.data);
    return NextResponse.json({
      success: true,
      bundle,
    });
  } catch (err: any) {
    console.error('[API /api/export/sdk Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Export Generation Error' },
      { status: 500 }
    );
  }
}
