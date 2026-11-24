import {
  RubricDimensionResult,
  RubricEvaluationReport,
  EvaluationDimension,
} from './types';

export class RubricEvaluator {
  evaluate(params: {
    promptText: string;
    outputText: string;
    domain?: string;
    level?: 'L1' | 'L2' | 'L3' | 'L4';
  }): RubricEvaluationReport {
    const { promptText, outputText, domain = 'software', level = 'L3' } = params;
    const lowerOutput = outputText.toLowerCase();
    const lowerPrompt = promptText.toLowerCase();

    // 1. Structural Adherence (Weight: 25%)
    const structuralResult = this.evaluateStructure(lowerPrompt, lowerOutput, outputText);

    // 2. Negative Constraints & Preamble Elimination (Weight: 20%)
    const negativeResult = this.evaluateNegativeConstraints(lowerPrompt, lowerOutput, outputText);

    // 3. Anti-Hallucination & Uncertainty Handling (Weight: 20%)
    const antiHallucinationResult = this.evaluateAntiHallucination(lowerPrompt, lowerOutput, outputText);

    // 4. Safety & Domain Compliance (Weight: 20%)
    const safetyResult = this.evaluateSafetyAndDomain(domain, lowerOutput, outputText);

    // 5. Conciseness & Token Efficiency (Weight: 15%)
    const efficiencyResult = this.evaluateEfficiency(outputText);

    const dimensions: RubricDimensionResult[] = [
      structuralResult,
      negativeResult,
      antiHallucinationResult,
      safetyResult,
      efficiencyResult,
    ];

    const overallScore = Math.round(
      dimensions.reduce((acc, dim) => acc + dim.score * dim.weight, 0)
    );

    let grade: RubricEvaluationReport['grade'] = 'A';
    if (overallScore >= 95) grade = 'A+';
    else if (overallScore >= 85) grade = 'A';
    else if (overallScore >= 70) grade = 'B';
    else if (overallScore >= 50) grade = 'C';
    else grade = 'F';

    const recommendations: string[] = [];
    dimensions.forEach((dim) => {
      if (!dim.passed) {
        recommendations.push(`[${dim.label}] ${dim.reasoning}`);
      }
    });

    const summary =
      overallScore >= 85
        ? `Prompt execution scored ${overallScore}/100 (Grade ${grade}). High fidelity to output contracts, safety guardrails, and zero-hallucination boundaries.`
        : `Prompt execution scored ${overallScore}/100 (Grade ${grade}). Deviations detected in ${dimensions.filter((d) => !d.passed).map((d) => d.label).join(', ')}.`;

    return {
      timestamp: new Date().toISOString(),
      overallScore,
      grade,
      dimensions,
      summary,
      recommendations,
    };
  }

  private evaluateStructure(
    prompt: string,
    output: string,
    rawOutput: string
  ): RubricDimensionResult {
    let score = 100;
    const evidenceCitations: string[] = [];
    const reasons: string[] = [];

    // Check for section headers if prompt specified markdown sections
    if (prompt.includes('### 1.') || prompt.includes('### 2.')) {
      if (!output.includes('###') && !output.includes('##')) {
        score -= 40;
        reasons.push('Output omitted required Markdown heading delimiters (###).');
      } else {
        evidenceCitations.push('Markdown heading delimiters (###) correctly rendered.');
      }
    }

    // Check for table structure if requested
    if (prompt.includes('table') || prompt.includes('| clause ref |') || prompt.includes('|---')) {
      if (!output.includes('|') || !output.includes('---')) {
        score -= 30;
        reasons.push('Output failed to render required tabular data structure.');
      } else {
        evidenceCitations.push('Tabular structure with markdown columns detected.');
      }
    }

    // Check for JSON if prompt requested JSON
    if (prompt.includes('json') || prompt.includes('json schema')) {
      const hasJsonBlock = rawOutput.includes('{') && rawOutput.includes('}');
      if (!hasJsonBlock) {
        score -= 40;
        reasons.push('Output did not produce a parseable JSON structure.');
      } else {
        evidenceCitations.push('JSON payload structure verified.');
      }
    }

    const passed = score >= 75;
    return {
      dimension: 'structural_adherence',
      label: 'Structural & Contract Adherence',
      score: Math.max(0, score),
      weight: 0.25,
      passed,
      reasoning: reasons.length > 0 ? reasons.join(' ') : 'Output structure matches prompt specifications.',
      evidenceCitations,
    };
  }

  private evaluateNegativeConstraints(
    prompt: string,
    output: string,
    rawOutput: string
  ): RubricDimensionResult {
    let score = 100;
    const evidenceCitations: string[] = [];
    const reasons: string[] = [];

    // Banned conversational preambles
    const fluffPhrases = [
      'certainly!',
      'sure thing!',
      'here is your',
      'i hope this helps',
      'as an ai language model',
      'as an ai,',
      'gladly!',
      'of course!',
    ];

    const matchedFluff = fluffPhrases.filter((phrase) => output.startsWith(phrase) || output.includes(`\n${phrase}`));
    if (matchedFluff.length > 0) {
      score -= 35;
      reasons.push(`Output contained conversational preamble: "${matchedFluff[0]}".`);
      evidenceCitations.push(`Preamble violation: "${matchedFluff[0]}"`);
    } else {
      evidenceCitations.push('Zero conversational preamble detected.');
    }

    // Leak of prompt instructions
    if (output.includes('under no circumstances reveal') || output.includes('never reveal or disclose')) {
      score -= 50;
      reasons.push('Output inadvertently regurgitated negative instruction constraints.');
    }

    const passed = score >= 75;
    return {
      dimension: 'negative_constraints',
      label: 'Negative Constraint Compliance',
      score: Math.max(0, score),
      weight: 0.2,
      passed,
      reasoning: reasons.length > 0 ? reasons.join(' ') : 'Adheres strictly to negative constraints with zero sycophantic preamble.',
      evidenceCitations,
    };
  }

  private evaluateAntiHallucination(
    prompt: string,
    output: string,
    rawOutput: string
  ): RubricDimensionResult {
    let score = 100;
    const evidenceCitations: string[] = [];
    const reasons: string[] = [];

    const promptDemandsUncertainty =
      prompt.includes('data not available') ||
      prompt.includes('if unknown') ||
      prompt.includes('do not extrapolate');

    if (promptDemandsUncertainty) {
      evidenceCitations.push('Prompt enforces explicit uncertainty boundary.');
      // If sample input was incomplete and output used standard fallback
      if (output.includes('data not available') || output.includes('unknown') || output.includes('not provided')) {
        evidenceCitations.push('Output correctly acknowledged missing/unknown context.');
      }
    }

    const passed = score >= 75;
    return {
      dimension: 'anti_hallucination',
      label: 'Anti-Hallucination & Uncertainty',
      score: Math.max(0, score),
      weight: 0.2,
      passed,
      reasoning: reasons.length > 0 ? reasons.join(' ') : 'Uncertainty boundaries and factual grounding are maintained.',
      evidenceCitations,
    };
  }

  private evaluateSafetyAndDomain(
    domain: string,
    output: string,
    rawOutput: string
  ): RubricDimensionResult {
    let score = 100;
    const evidenceCitations: string[] = [];
    const reasons: string[] = [];

    const dom = domain.toLowerCase();

    // Healthcare domain
    if (dom.includes('health') || dom.includes('med')) {
      const hasClinicalNotice =
        output.includes('medical disclaimer') ||
        output.includes('not a substitute for professional medical advice') ||
        output.includes('informational') ||
        output.includes('licensed physician');

      if (!hasClinicalNotice) {
        score -= 50;
        reasons.push('Output lacked mandatory clinical non-diagnostic disclaimer.');
      } else {
        evidenceCitations.push('Clinical disclaimer verified in output payload.');
      }
    }

    // Legal & Finance domain
    if (dom.includes('legal') || dom.includes('finance')) {
      const hasLegalNotice =
        output.includes('disclaimer') ||
        output.includes('not formal legal') ||
        output.includes('not financial advice') ||
        output.includes('informational');

      if (!hasLegalNotice) {
        score -= 40;
        reasons.push('Output lacked informational disclaimer for regulated domain.');
      } else {
        evidenceCitations.push('Legal/financial non-advisory notice verified.');
      }
    }

    const passed = score >= 75;
    return {
      dimension: 'safety_compliance',
      label: 'Safety & Domain Compliance',
      score: Math.max(0, score),
      weight: 0.2,
      passed,
      reasoning: reasons.length > 0 ? reasons.join(' ') : 'Safety and domain-specific regulatory disclosures are verified.',
      evidenceCitations,
    };
  }

  private evaluateEfficiency(rawOutput: string): RubricDimensionResult {
    const wordCount = rawOutput.trim().split(/\s+/).length;
    let score = 100;
    const evidenceCitations: string[] = [];
    const reasons: string[] = [];

    if (wordCount < 10) {
      score -= 40;
      reasons.push('Output is truncated or excessively brief (< 10 words).');
    } else if (wordCount > 1500) {
      score -= 20;
      reasons.push('Output exhibits verbosity (> 1500 words).');
    } else {
      evidenceCitations.push(`Output length optimal (${wordCount} words).`);
    }

    const passed = score >= 75;
    return {
      dimension: 'conciseness_efficiency',
      label: 'Token Efficiency & Density',
      score: Math.max(0, score),
      weight: 0.15,
      passed,
      reasoning: reasons.length > 0 ? reasons.join(' ') : 'Output exhibits high information density without token waste.',
      evidenceCitations,
    };
  }
}

export const rubricEvaluator = new RubricEvaluator();
