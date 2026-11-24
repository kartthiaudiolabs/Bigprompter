export type TemplateDomain =
  | 'software'
  | 'cloud_devops'
  | 'healthcare'
  | 'legal_finance'
  | 'data_sql'
  | 'cybersecurity'
  | 'creative'
  | 'customer_support';

export interface TemplateVariable {
  id: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  description: string;
  required: boolean;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  domain: TemplateDomain;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  tags: string[];
  recommendedModel: string;
  variables: TemplateVariable[];
  rawPromptTemplate: string;
  compiledPreview: string;
  architectureSchematic: {
    role: string;
    sections: string[];
    guardrails: string[];
  };
}

export interface TemplateFilterOptions {
  domain?: TemplateDomain | 'all';
  level?: 'L1' | 'L2' | 'L3' | 'L4' | 'all';
  searchQuery?: string;
}

export interface TemplateInstantiateRequest {
  templateId: string;
  variableValues: Record<string, string>;
  projectId?: string;
}

export interface TemplateInstantiateResult {
  promptText: string;
  domain: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  templateTitle: string;
}
