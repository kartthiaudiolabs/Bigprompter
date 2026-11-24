export type ExportFormat =
  | 'markdown'
  | 'json'
  | 'yaml_langchain'
  | 'typescript'
  | 'python'
  | 'curl'
  | 'nextjs_route';

export type TargetSDK = 'anthropic' | 'google' | 'openai';

export interface SDKGeneratorOptions {
  promptText: string;
  targetSdk: TargetSDK;
  language: 'typescript' | 'python';
  streaming?: boolean;
  temperature?: number;
  maxTokens?: number;
  promptName?: string;
  modelName?: string;
}

export interface GeneratedCodeArtifact {
  filename: string;
  language: 'typescript' | 'python' | 'bash' | 'yaml' | 'json' | 'markdown';
  code: string;
  description: string;
  dependencies: string[];
  installCommand: string;
}

export interface ExportBundleRequest {
  promptText: string;
  title: string;
  version: number;
  level: string;
  domain: string;
  targetModel: string;
  format: ExportFormat;
  options?: Partial<SDKGeneratorOptions>;
}

export interface ExportBundleResult {
  filename: string;
  mimeType: string;
  content: string;
}
