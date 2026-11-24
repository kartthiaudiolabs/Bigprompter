import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { contractValidator, ContractAssertion } from '@/modules/evaluation';

const AssertionSchema = z.object({
  outputText: z.string().min(1, 'Output text is required for contract validation'),
  promptText: z.string().optional(),
  assertions: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum([
          'json_validity',
          'required_section',
          'banned_word',
          'regex_match',
          'length_range',
        ]),
        target: z.string(),
        expected: z.string().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        severity: z.enum(['critical', 'warning']).optional(),
      })
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = AssertionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid assertion parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    let assertions: ContractAssertion[] = parsed.data.assertions || [];
    if (assertions.length === 0 && parsed.data.promptText) {
      assertions = contractValidator.inferDefaultAssertions(parsed.data.promptText);
    }

    const report = contractValidator.validate(parsed.data.outputText, assertions);
    return NextResponse.json(report);
  } catch (err: any) {
    console.error('[API /api/evaluation/assertions Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Contract Assertion Error' },
      { status: 500 }
    );
  }
}
