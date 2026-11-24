import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { orchestratorService } from '@/modules/agents';

const OrchestrateSchema = z.object({
  promptText: z.string().min(1, 'Prompt text is required'),
  level: z.enum(['L1', 'L2', 'L3', 'L4']).optional(),
  domain: z.string().optional(),
  targetModel: z.string().optional(),
  activeAgents: z
    .array(
      z.enum([
        'security_auditor',
        'domain_specialist',
        'quality_evaluator',
        'architecture_reviewer',
      ])
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = OrchestrateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid orchestration parameters',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const report = await orchestratorService.orchestrate(parsed.data);
    return NextResponse.json(report);
  } catch (err: any) {
    console.error('[API /api/agents/orchestrate Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Agent Orchestration Error' },
      { status: 500 }
    );
  }
}
