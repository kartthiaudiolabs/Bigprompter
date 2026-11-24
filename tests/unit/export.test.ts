import { describe, it, expect } from 'vitest';
import { sdkGenerator, exportService } from '@/modules/export';

describe('Deployment & Export Engine Suite (Phase 6)', () => {
  const samplePrompt = '<system_role>Expert Architect</system_role>\nExecute spec.';

  describe('SDKGenerator', () => {
    it('should generate production TypeScript snippet for Anthropic Claude', () => {
      const artifact = sdkGenerator.generate({
        promptText: samplePrompt,
        targetSdk: 'anthropic',
        language: 'typescript',
        streaming: true,
      });

      expect(artifact.language).toBe('typescript');
      expect(artifact.filename).toContain('.ts');
      expect(artifact.code).toContain("import Anthropic from '@anthropic-ai/sdk'");
      expect(artifact.code).toContain('client.messages.stream');
      expect(artifact.code).toContain('<untrusted_user_input>');
      expect(artifact.dependencies).toContain('@anthropic-ai/sdk');
    });

    it('should generate production Python snippet for Google Gemini', () => {
      const artifact = sdkGenerator.generate({
        promptText: samplePrompt,
        targetSdk: 'google',
        language: 'python',
        streaming: false,
      });

      expect(artifact.language).toBe('python');
      expect(artifact.filename).toContain('.py');
      expect(artifact.code).toContain('from google import genai');
      expect(artifact.code).toContain('client.models.generate_content');
      expect(artifact.dependencies).toContain('google-genai');
    });

    it('should generate production Next.js Edge Route Handler with SSE streaming', () => {
      const artifact = sdkGenerator.generateNextJSRoute(samplePrompt, 'anthropic');

      expect(artifact.filename).toBe('route.ts');
      expect(artifact.code).toContain("export const runtime = 'edge'");
      expect(artifact.code).toContain("'Content-Type': 'text/event-stream'");
      expect(artifact.code).toContain('data: [DONE]');
    });

    it('should generate valid cURL command script', () => {
      const artifact = sdkGenerator.generateCurl(samplePrompt, 'anthropic');

      expect(artifact.filename).toBe('execute.sh');
      expect(artifact.code).toContain('curl https://api.anthropic.com/v1/messages');
      expect(artifact.code).toContain('x-api-key: $ANTHROPIC_API_KEY');
    });

    it('should generate LangChain / PromptFoo YAML manifest', () => {
      const artifact = sdkGenerator.generateLangChainYAML(samplePrompt, 'payment_service');

      expect(artifact.filename).toBe('promptfoo.config.yaml');
      expect(artifact.code).toContain('name: "payment_service"');
      expect(artifact.code).toContain('providers:');
      expect(artifact.code).toContain('assert:');
    });
  });

  describe('ExportService', () => {
    it('should create Markdown bundle with YAML frontmatter', () => {
      const bundle = exportService.createExportBundle({
        promptText: samplePrompt,
        title: 'Payment Gateway Spec',
        version: 2,
        level: 'L4',
        domain: 'fintech',
        targetModel: 'claude-3-7-sonnet',
        format: 'markdown',
      });

      expect(bundle.filename).toBe('payment_gateway_spec_v2.md');
      expect(bundle.mimeType).toBe('text/markdown');
      expect(bundle.content).toContain('title: "Payment Gateway Spec"');
      expect(bundle.content).toContain('version: 2.0');
    });

    it('should create structured JSON bundle with metadata and execution parameters', () => {
      const bundle = exportService.createExportBundle({
        promptText: samplePrompt,
        title: 'Payment Gateway Spec',
        version: 1,
        level: 'L3',
        domain: 'software',
        targetModel: 'gpt-4o',
        format: 'json',
      });

      expect(bundle.filename).toBe('payment_gateway_spec_v1.json');
      expect(bundle.mimeType).toBe('application/json');
      const parsed = JSON.parse(bundle.content);
      expect(parsed.schema_version).toBe('big_prompter/v1');
      expect(parsed.metadata.title).toBe('Payment Gateway Spec');
      expect(parsed.config.temperature).toBe(0.2);
    });
  });
});
