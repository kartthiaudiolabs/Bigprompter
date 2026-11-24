import {
  ExportBundleRequest,
  ExportBundleResult,
} from './types';
import { sdkGenerator } from './sdkGenerator';

export class ExportService {
  createExportBundle(request: ExportBundleRequest): ExportBundleResult {
    const {
      promptText,
      title,
      version,
      level,
      domain,
      targetModel,
      format,
      options,
    } = request;

    const baseName = title.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'prompt';

    switch (format) {
      case 'markdown': {
        const content = `---
title: "${title}"
version: ${version}.0
level: "${level}"
domain: "${domain}"
target_model: "${targetModel}"
exported_at: "${new Date().toISOString()}"
system: "Big Prompter OS v1.0"
---

# ${title} (Level ${level})

${promptText}
`;
        return {
          filename: `${baseName}_v${version}.md`,
          mimeType: 'text/markdown',
          content,
        };
      }

      case 'json': {
        const jsonPayload = {
          schema_version: 'big_prompter/v1',
          metadata: {
            title,
            version,
            level,
            domain,
            targetModel,
            exportedAt: new Date().toISOString(),
          },
          config: {
            temperature: options?.temperature ?? 0.2,
            maxTokens: options?.maxTokens ?? 4096,
            streaming: options?.streaming ?? false,
          },
          prompt: {
            systemInstruction: promptText,
            untrustedInputTag: '<untrusted_user_input>',
          },
        };

        return {
          filename: `${baseName}_v${version}.json`,
          mimeType: 'application/json',
          content: JSON.stringify(jsonPayload, null, 2),
        };
      }

      case 'yaml_langchain': {
        const artifact = sdkGenerator.generateLangChainYAML(promptText, baseName);
        return {
          filename: `${baseName}.promptfoo.yaml`,
          mimeType: 'application/x-yaml',
          content: artifact.code,
        };
      }

      case 'typescript': {
        const targetSdk = options?.targetSdk || (targetModel.includes('claude') ? 'anthropic' : targetModel.includes('gpt') ? 'openai' : 'google');
        const artifact = sdkGenerator.generate({
          promptText,
          targetSdk,
          language: 'typescript',
          streaming: options?.streaming ?? false,
          temperature: options?.temperature ?? 0.2,
          maxTokens: options?.maxTokens ?? 4096,
          promptName: baseName,
        });

        return {
          filename: artifact.filename,
          mimeType: 'text/typescript',
          content: artifact.code,
        };
      }

      case 'python': {
        const targetSdk = options?.targetSdk || (targetModel.includes('claude') ? 'anthropic' : targetModel.includes('gpt') ? 'openai' : 'google');
        const artifact = sdkGenerator.generate({
          promptText,
          targetSdk,
          language: 'python',
          streaming: options?.streaming ?? false,
          temperature: options?.temperature ?? 0.2,
          maxTokens: options?.maxTokens ?? 4096,
          promptName: baseName,
        });

        return {
          filename: artifact.filename,
          mimeType: 'text/x-python',
          content: artifact.code,
        };
      }

      case 'nextjs_route': {
        const targetSdk = options?.targetSdk || (targetModel.includes('claude') ? 'anthropic' : targetModel.includes('gpt') ? 'openai' : 'google');
        const artifact = sdkGenerator.generateNextJSRoute(promptText, targetSdk);

        return {
          filename: 'route.ts',
          mimeType: 'text/typescript',
          content: artifact.code,
        };
      }

      case 'curl': {
        const targetSdk = options?.targetSdk || (targetModel.includes('claude') ? 'anthropic' : targetModel.includes('gpt') ? 'openai' : 'google');
        const artifact = sdkGenerator.generateCurl(promptText, targetSdk);

        return {
          filename: 'execute.sh',
          mimeType: 'application/x-sh',
          content: artifact.code,
        };
      }

      default:
        return {
          filename: `${baseName}.txt`,
          mimeType: 'text/plain',
          content: promptText,
        };
    }
  }
}

export const exportService = new ExportService();
