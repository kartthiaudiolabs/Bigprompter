import { NextRequest, NextResponse } from 'next/server';
import { templateService, TemplateDomain } from '@/modules/templates';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = (searchParams.get('domain') || 'all') as TemplateDomain | 'all';
    const level = (searchParams.get('level') || 'all') as 'L1' | 'L2' | 'L3' | 'L4' | 'all';
    const searchQuery = searchParams.get('q') || searchParams.get('searchQuery') || '';

    const templates = templateService.listTemplates({
      domain,
      level,
      searchQuery,
    });

    return NextResponse.json({
      total: templates.length,
      templates,
    });
  } catch (err: any) {
    console.error('[API /api/templates Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Template Retrieval Error' },
      { status: 500 }
    );
  }
}
