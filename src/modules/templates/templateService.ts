import {
  PromptTemplate,
  TemplateFilterOptions,
  TemplateInstantiateRequest,
  TemplateInstantiateResult,
} from './types';
import { TEMPLATE_LIBRARY } from './templateLibrary';

export class TemplateService {
  private templates: PromptTemplate[] = [...TEMPLATE_LIBRARY];

  listTemplates(options?: TemplateFilterOptions): PromptTemplate[] {
    let result = this.templates;

    if (options?.domain && options.domain !== 'all') {
      result = result.filter((t) => t.domain === options.domain);
    }

    if (options?.level && options.level !== 'all') {
      result = result.filter((t) => t.level === options.level);
    }

    if (options?.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return result;
  }

  getTemplateById(id: string): PromptTemplate | undefined {
    return this.templates.find((t) => t.id === id);
  }

  instantiateTemplate(request: TemplateInstantiateRequest): TemplateInstantiateResult {
    const template = this.getTemplateById(request.templateId);
    if (!template) {
      throw new Error(`[TemplateService] Template not found with ID: ${request.templateId}`);
    }

    let instantiatedText = template.rawPromptTemplate;

    template.variables.forEach((variable) => {
      const userValue = request.variableValues[variable.id];
      const replacement =
        userValue !== undefined && userValue.trim().length > 0
          ? userValue.trim()
          : variable.defaultValue || '';

      const regex = new RegExp(`\\{\\{${variable.id}\\}\\}`, 'g');
      instantiatedText = instantiatedText.replace(regex, replacement);
    });

    return {
      promptText: instantiatedText,
      domain: template.domain,
      level: template.level,
      templateTitle: template.title,
    };
  }
}

export const templateService = new TemplateService();
