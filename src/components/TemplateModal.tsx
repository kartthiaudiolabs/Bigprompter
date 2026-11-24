import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Sliders,
  Sparkles,
  Layers,
  Shield,
  FileCode,
} from 'lucide-react';
import { PromptTemplate, TemplateDomain, templateService, TEMPLATE_LIBRARY } from '@/modules/templates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PromptTemplate, instantiatedText?: string) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<TemplateDomain | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'L1' | 'L2' | 'L3' | 'L4'>('all');
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const filteredTemplates = useMemo(() => {
    return templateService.listTemplates({
      domain: selectedDomain,
      level: selectedLevel,
      searchQuery,
    });
  }, [selectedDomain, selectedLevel, searchQuery]);

  if (!isOpen) return null;

  const handleOpenConfigurator = (template: PromptTemplate) => {
    setActiveTemplate(template);
    const initialVars: Record<string, string> = {};
    template.variables.forEach((v) => {
      initialVars[v.id] = v.defaultValue || '';
    });
    setVariableValues(initialVars);
  };

  const handleInstantiate = () => {
    if (!activeTemplate) return;
    const result = templateService.instantiateTemplate({
      templateId: activeTemplate.id,
      variableValues,
    });

    onSelectTemplate(activeTemplate, result.promptText);
    onClose();
  };

  const handleQuickLoad = (template: PromptTemplate) => {
    const initialVars: Record<string, string> = {};
    template.variables.forEach((v) => {
      initialVars[v.id] = v.defaultValue || '';
    });
    const result = templateService.instantiateTemplate({
      templateId: template.id,
      variableValues: initialVars,
    });

    onSelectTemplate(template, result.promptText);
    onClose();
  };

  const domains: { id: TemplateDomain | 'all'; label: string }[] = [
    { id: 'all', label: 'All Domains' },
    { id: 'software', label: 'Software Spec' },
    { id: 'cloud_devops', label: 'Cloud & IaC' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'legal_finance', label: 'Legal & Finance' },
    { id: 'data_sql', label: 'Data & SQL' },
    { id: 'cybersecurity', label: 'Cybersecurity' },
    { id: 'creative', label: 'Creative Writing' },
    { id: 'customer_support', label: 'Support & Care' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-surface-200 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-surface-300/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Adaptive Production Template Library</h3>
              <p className="text-xs text-slate-400">
                Pre-engineered L1–L4 prompt architectures with validated domain guardrails.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-surface-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search templates by keyword, domain, or technology tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-300 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            {/* Level selection */}
            <div className="flex items-center gap-1 self-start sm:self-center">
              {(['all', 'L1', 'L2', 'L3', 'L4'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                    selectedLevel === lvl
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl === 'all' ? 'All' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Domain pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
            {domains.map((dom) => (
              <button
                key={dom.id}
                onClick={() => setSelectedDomain(dom.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedDomain === dom.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-surface-300 text-slate-400 hover:text-slate-200 hover:bg-surface-100'
                }`}
              >
                {dom.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Templates Grid OR Variable Configurator */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTemplate ? (
            /* Variable Configurator Drawer / View */
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <button
                    onClick={() => setActiveTemplate(null)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mb-1"
                  >
                    ← Back to Template Library
                  </button>
                  <h4 className="text-base font-bold text-white">{activeTemplate.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{activeTemplate.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded font-mono font-bold text-xs bg-indigo-950 border border-indigo-700 text-indigo-300">
                  {activeTemplate.level}
                </span>
              </div>

              {/* Schematic Preview */}
              <div className="p-4 rounded-xl bg-surface-300/60 border border-slate-800 space-y-2 text-xs">
                <span className="font-semibold text-slate-300">Architecture Schematic:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-surface-200 border border-slate-800">
                    <span className="text-slate-500 block">System Role:</span>
                    <span className="text-indigo-300 font-medium">{activeTemplate.architectureSchematic.role}</span>
                  </div>
                  <div className="p-2 rounded bg-surface-200 border border-slate-800">
                    <span className="text-slate-500 block">Sections:</span>
                    <span className="text-slate-300">{activeTemplate.architectureSchematic.sections.join(' • ')}</span>
                  </div>
                  <div className="p-2 rounded bg-surface-200 border border-slate-800">
                    <span className="text-slate-500 block">Guardrails:</span>
                    <span className="text-emerald-400">{activeTemplate.architectureSchematic.guardrails.join(' • ')}</span>
                  </div>
                </div>
              </div>

              {/* Variable Inputs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Template Parameters ({activeTemplate.variables.length})
                  </h5>
                  <span className="text-[11px] text-slate-500">Pre-filled with validated defaults</span>
                </div>

                <div className="space-y-3">
                  {activeTemplate.variables.map((variable) => (
                    <div key={variable.id} className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>{variable.label} {variable.required && <span className="text-rose-400">*</span>}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{variable.description}</span>
                      </label>
                      <input
                        type="text"
                        placeholder={variable.placeholder}
                        value={variableValues[variable.id] || ''}
                        onChange={(e) =>
                          setVariableValues((prev) => ({
                            ...prev,
                            [variable.id]: e.target.value,
                          }))
                        }
                        className="w-full bg-surface-300 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveTemplate(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInstantiate}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Instantiate into Workspace
                </button>
              </div>
            </div>
          ) : (
            /* Templates Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded-xl bg-surface-300/80 hover:bg-surface-100/90 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface-200 border border-slate-700 text-slate-300 uppercase">
                        {template.domain.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono font-extrabold text-indigo-400">
                        {template.level}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {template.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-surface-200 text-slate-400 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      {template.variables.length} parameters
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickLoad(template)}
                        className="px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white bg-surface-200 hover:bg-slate-700 transition-colors"
                      >
                        Quick Load
                      </button>
                      <button
                        onClick={() => handleOpenConfigurator(template)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 transition-all flex items-center gap-1"
                      >
                        <Sliders className="w-3 h-3" />
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
