import { NextRequest, NextResponse } from 'next/server';
import { CreateProjectSchema } from '@/validation';

export async function GET() {
  // Returns demo project baseline for API consumers
  return NextResponse.json({
    success: true,
    projects: [
      {
        id: 'proj-default',
        title: 'Core AI Engineering Workspace',
        description: 'Primary isolated scope for enterprise prompt architectures and evaluation.',
        objectives: [
          'Design deterministic prompt contracts',
          'Enforce prompt injection boundaries',
          'Benchmark multi-model outputs'
        ],
        isArchived: false,
        createdAt: new Date().toISOString(),
      }
    ]
  });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = CreateProjectSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { title, description, objectives } = parsed.data;

    const newProject = {
      id: 'proj-' + Date.now(),
      title,
      description: description || '',
      objectives: objectives || ['Establish production-grade prompt specifications'],
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      project: newProject,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
