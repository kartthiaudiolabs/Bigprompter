import {
  ContractAssertion,
  ContractAssertionResult,
  ContractValidationReport,
} from './types';

export class ContractValidator {
  validate(outputText: string, assertions: ContractAssertion[]): ContractValidationReport {
    const results: ContractAssertionResult[] = [];

    for (const assertion of assertions) {
      const res = this.evaluateSingleAssertion(outputText, assertion);
      results.push(res);
    }

    const totalAssertions = results.length;
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = totalAssertions - passedCount;
    const score = totalAssertions > 0 ? Math.round((passedCount / totalAssertions) * 100) : 100;
    const valid = failedCount === 0;

    return {
      valid,
      totalAssertions,
      passedCount,
      failedCount,
      score,
      results,
    };
  }

  inferDefaultAssertions(promptText: string): ContractAssertion[] {
    const assertions: ContractAssertion[] = [];

    // 1. Infer required Markdown headings
    const headingMatches = promptText.match(/###\s+[0-9]+\.\s+([^\n\r]+)/g);
    if (headingMatches) {
      headingMatches.forEach((heading, idx) => {
        const cleanHeading = heading.replace(/###\s+[0-9]+\.\s+/, '').trim();
        assertions.push({
          id: `sec-${idx + 1}`,
          type: 'required_section',
          target: cleanHeading,
          severity: 'critical',
        });
      });
    }

    // 2. Infer JSON Schema validity if requested
    if (
      promptText.toLowerCase().includes('json schema') ||
      promptText.toLowerCase().includes('json format') ||
      promptText.toLowerCase().includes('output as json')
    ) {
      assertions.push({
        id: 'json-valid-1',
        type: 'json_validity',
        target: 'Parseable JSON Root',
        severity: 'critical',
      });
    }

    // 3. Infer standard negative constraints
    assertions.push({
      id: 'no-preamble-1',
      type: 'banned_word',
      target: 'Certainly!',
      severity: 'warning',
    });
    assertions.push({
      id: 'no-sycophancy-2',
      type: 'banned_word',
      target: 'As an AI language model',
      severity: 'critical',
    });

    return assertions;
  }

  private evaluateSingleAssertion(
    output: string,
    assertion: ContractAssertion
  ): ContractAssertionResult {
    switch (assertion.type) {
      case 'json_validity': {
        const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, output];
        const candidate = (jsonMatch[1] || output).trim();
        try {
          JSON.parse(candidate);
          return {
            assertionId: assertion.id,
            type: 'json_validity',
            passed: true,
            message: 'Valid parseable JSON payload detected.',
          };
        } catch (e: any) {
          return {
            assertionId: assertion.id,
            type: 'json_validity',
            passed: false,
            message: `JSON parse failed: ${e.message}`,
            evidenceSnippet: candidate.slice(0, 100),
          };
        }
      }

      case 'required_section': {
        const found = output.toLowerCase().includes(assertion.target.toLowerCase());
        return {
          assertionId: assertion.id,
          type: 'required_section',
          passed: found,
          message: found
            ? `Required section "${assertion.target}" verified.`
            : `Missing mandatory section: "${assertion.target}".`,
          evidenceSnippet: found ? `Matched section header "${assertion.target}"` : undefined,
        };
      }

      case 'banned_word': {
        const lowerOutput = output.toLowerCase();
        const lowerTarget = assertion.target.toLowerCase();
        const containsBanned = lowerOutput.includes(lowerTarget);
        return {
          assertionId: assertion.id,
          type: 'banned_word',
          passed: !containsBanned,
          message: containsBanned
            ? `Output contained banned phrase: "${assertion.target}".`
            : `Banned phrase "${assertion.target}" successfully avoided.`,
          evidenceSnippet: containsBanned ? `Found: "${assertion.target}"` : undefined,
        };
      }

      case 'regex_match': {
        try {
          const regex = new RegExp(assertion.target, 'i');
          const matched = regex.test(output);
          return {
            assertionId: assertion.id,
            type: 'regex_match',
            passed: matched,
            message: matched
              ? `Output satisfies regex pattern: /${assertion.target}/`
              : `Output failed regex validation: /${assertion.target}/`,
          };
        } catch (e: any) {
          return {
            assertionId: assertion.id,
            type: 'regex_match',
            passed: false,
            message: `Invalid regex pattern: ${e.message}`,
          };
        }
      }

      case 'length_range': {
        const words = output.trim().split(/\s+/).length;
        const min = assertion.min ?? 0;
        const max = assertion.max ?? Infinity;
        const inRange = words >= min && words <= max;
        return {
          assertionId: assertion.id,
          type: 'length_range',
          passed: inRange,
          message: inRange
            ? `Word count (${words}) is within required bounds [${min}, ${max}].`
            : `Word count (${words}) violates range bounds [${min}, ${max}].`,
        };
      }

      default:
        return {
          assertionId: assertion.id,
          type: assertion.type,
          passed: true,
          message: 'Unknown assertion passed by default.',
        };
    }
  }
}

export const contractValidator = new ContractValidator();
