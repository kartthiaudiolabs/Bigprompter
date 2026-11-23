import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Sliders,
  Cpu,
  Layers,
  Wand2,
  AlertCircle,
  RefreshCw,
  Zap,
  ChevronRight
} from 'lucide-react';
import {
  EngineeringLevel,
  TargetModel,
  UserMode,
  DiscoveryQuestion,
  DomainCategory,
  PromptProjectSession
} from '../types';

interface ConversationalWorkspaceProps {
  session: PromptProjectSession;
  onRawInputChange: (text: string) => void;
  onLevelChange: (level: EngineeringLevel) => void;
  onTargetModelChange: (model: TargetModel) => void;
  onStartDiscovery: () => void;
  onSelectOption: (questionId: string, optionId: string) => void;
  onCustomAnswerChange: (questionId: string, text: string) => void;
  onApplyAllDefaults: () => void;
  onCompilePrompt: () => void;
  onResetToDiscovery: () => void;
  userMode: UserMode;
}

export const ConversationalWorkspace: React.FC<ConversationalWorkspaceProps> = ({
  session,
  onRawInputChange,
  onLevelChange,
  onTargetModelChange,
  onStartDiscovery,
  onSelectOption,
  onCustomAnswerChange,
  onApplyAllDefaults,
  onCompilePrompt,
  onResetToDiscovery,
  userMode,
}) => {
  const [activeCustomInputs, setActiveCustomInputs] = useState<Record<string, boolean>>({});

  const toggleCustomInput = (qId: string) => {
    setActiveCustomInputs(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const levelDetails: Record<EngineeringLevel, { title: string; desc: string; badgeColor: string }> = {
    L1: { title: 'Basic', desc: 'Clean, structured instructions for straightforward tasks', badgeColor: 'border-slate-700 text-slate-300' },
    L2: { title: 'Advanced', desc: 'Context, strict constraints, input contracts & examples', badgeColor: 'border-cyan-800 text-cyan-300' },
    L3: { title: 'Professional', desc: 'Full architecture, conditional logic, edge cases & verification', badgeColor: 'border-indigo-800 text-indigo-300' },
    L4: { title: 'Production', desc: 'Injection defense, XML schemas, state handling & CI/CD deployment', badgeColor: 'border-emerald-700 text-emerald-300' },
  };

  const quickStarters = [
    { label: 'Code Reviewer', prompt: 'I want an autonomous code review bot that finds security flaws and suggests clean refactors.' },
    { label: 'SaaS Copywriter', prompt: 'Write high-converting B2B SaaS landing page copy with objection handling.' },
    { label: 'SQL Synthesizer', prompt: 'Translate plain English business questions into indexed, fast PostgreSQL queries.' },
    { label: 'Customer Triage', prompt: 'Create an intelligent customer support triage agent that classifies complaints and handles refunds.' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#090c13] border-r border-surface-100 overflow-y-auto custom-scrollbar">
      {/* Step Progress Tracker */}
      <div className="px-5 py-4 border-b border-surface-100/70 bg-surface-300/60 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${
                session.stage === 'input'
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'bg-surface-100 text-slate-300'
              }`}
            >
              1
            </span>
            <span className={session.stage === 'input' ? 'text-cyan-300 font-semibold' : ''}>
              Input & Scope
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${
                session.stage === 'discovery'
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : session.stage === 'compiled'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-surface-100 text-slate-300'
              }`}
            >
              2
            </span>
            <span className={session.stage === 'discovery' ? 'text-cyan-300 font-semibold' : ''}>
              Discovery Questionnaire
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${
                session.stage === 'compiled'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-surface-100 text-slate-300'
              }`}
            >
              3
            </span>
            <span className={session.stage === 'compiled' ? 'text-emerald-300 font-semibold' : ''}>
              L1–L4 Output
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* =========================================================
            STAGE 1: RAW INPUT & ARCHITECTURE SETTINGS
        ========================================================= */}
        {session.stage === 'input' && (
          <div className="space-y-6 animate-fade-in">
            {/* Input Heading */}
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm mb-1.5">
                <Wand2 className="w-4 h-4" />
                <span>Senior Prompt Engineer Ingestion</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                What prompt or agent do you want to engineer?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Bring any rough idea, task description, or raw draft. Promptexa will analyze intent, discover missing requirements, and compile it to production grade.
              </p>
            </div>

            {/* Quick Starters */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-mono text-slate-400 font-semibold">
                Quick Starters
              </label>
              <div className="flex flex-wrap gap-2">
                {quickStarters.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => onRawInputChange(item.prompt)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-100 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-800/60 transition-all text-left"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Raw Text Input */}
            <div className="relative">
              <textarea
                value={session.rawInput}
                onChange={(e) => onRawInputChange(e.target.value)}
                placeholder="Example: I need a system prompt for a code review assistant that catches security flaws, enforces clean architecture, and produces structured markdown reports with severity tags..."
                rows={5}
                className="w-full rounded-xl bg-surface-200 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 text-sm p-4 placeholder-slate-500 outline-none transition-all resize-none font-sans leading-relaxed"
              />
              {session.rawInput.length > 0 && (
                <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-500">
                  {session.rawInput.length} chars
                </div>
              )}
            </div>

            {/* Target Model Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Target AI Architecture & Model
                </label>
                <span className="text-[11px] text-slate-500">Optimizes syntax & delimiters</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 / 3.5 Sonnet', desc: 'XML tags & thinking blocks' },
                  { id: 'gemini-2-5-pro', name: 'Google Gemini 2.5 Pro', desc: 'Calibrated schema & reasoning' },
                  { id: 'gpt-4o', name: 'OpenAI GPT-4o / o3-mini', desc: 'Role delimiters & markdown' },
                  { id: 'deepseek-r1', name: 'DeepSeek R1 / V3', desc: 'Rigorous chain-of-thought' },
                  { id: 'universal', name: 'Universal Agnostic', desc: 'High compatibility cross-platform' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onTargetModelChange(m.id as TargetModel)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      session.targetModel === m.id
                        ? 'bg-cyan-950/40 border-cyan-500/80 text-cyan-200 shadow-sm shadow-cyan-950'
                        : 'bg-surface-200/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold leading-tight">{m.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Engineering Level Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Product Engineering Level
                </label>
                <span className="text-[11px] text-slate-500">L1 to L4 depth</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['L1', 'L2', 'L3', 'L4'] as EngineeringLevel[]).map((lvl) => {
                  const detail = levelDetails[lvl];
                  const isSelected = session.level === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => onLevelChange(lvl)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500/80 text-indigo-200 shadow-sm shadow-indigo-950'
                          : 'bg-surface-200/80 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs">{lvl}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${detail.badgeColor}`}>
                          {detail.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                        {detail.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Button: Start Discovery */}
            <button
              onClick={onStartDiscovery}
              disabled={!session.rawInput.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
              <span>Analyze Intent & Start Discovery Questionnaire</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =========================================================
            STAGE 2: DISCOVERY QUESTIONNAIRE (INTERACTIVE MULTIPLE CHOICE)
        ========================================================= */}
        {session.stage === 'discovery' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header info */}
            <div className="p-4 rounded-xl bg-surface-200/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Domain: {session.domain.replace('-', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Level: {session.level}
                  </span>
                </div>
                <button
                  onClick={onApplyAllDefaults}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  Auto-Select All Recommended
                </button>
              </div>

              <p className="text-xs text-slate-300 font-medium">
                Initial Idea: <span className="text-slate-400 italic font-normal">"{session.rawInput}"</span>
              </p>
            </div>

            {/* Instructions */}
            <div className="text-xs text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                To engineer a production-ready prompt, confirm the following requirements. Select the best match or type custom parameters.
              </span>
            </div>

            {/* Questions List */}
            <div className="space-y-5">
              {session.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-surface-200 border border-slate-800/90 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-surface-100 border border-slate-700 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                          {q.category.replace('_', ' ')}: {q.question}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-7">
                        <span className="text-cyan-500 font-medium">Why this matters:</span> {q.rationale}
                      </p>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pl-7">
                    {q.options.map((opt) => {
                      const isSelected = q.selectedOptionId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => onSelectOption(q.id, opt.id)}
                          className={`w-full p-3 rounded-lg border text-left transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-sm'
                              : 'bg-surface-300/80 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-surface-100/50'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                                  : 'border-slate-600 bg-surface-200'
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="w-3 h-3 text-slate-950" />}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">{opt.label}</span>
                              {opt.isRecommended && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                  Recommended
                                </span>
                              )}
                            </div>
                            {opt.description && (
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                {opt.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {/* Custom Input Toggle */}
                    <div className="pt-1">
                      {!activeCustomInputs[q.id] ? (
                        <button
                          onClick={() => toggleCustomInput(q.id)}
                          className="text-[11px] text-slate-500 hover:text-cyan-400 font-medium"
                        >
                          + Or specify custom answer...
                        </button>
                      ) : (
                        <div className="space-y-1.5 animate-fade-in">
                          <label className="text-[11px] text-slate-400">Custom specification:</label>
                          <input
                            type="text"
                            value={q.customAnswer || ''}
                            onChange={(e) => onCustomAnswerChange(q.id, e.target.value)}
                            placeholder="Enter specific requirement or constraints..."
                            className="w-full text-xs bg-surface-300 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onCompilePrompt}
                className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Sparkles className="w-4 h-4 fill-current text-slate-950" />
                <span>Compile Production Prompt ({session.level})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onResetToDiscovery}
                className="px-4 py-3 rounded-xl bg-surface-200 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Back to Input
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            STAGE 3: COMPILED STATE (SUMMARY & QUICK RE-TUNE)
        ========================================================= */}
        {session.stage === 'compiled' && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Prompt Compilation Complete</span>
              </div>
              <p className="text-xs text-slate-300">
                Engineered at <span className="font-bold text-white font-mono">{session.level}</span> for{' '}
                <span className="font-bold text-white font-mono">{session.targetModel.toUpperCase()}</span>.
                The full deliverable and test sandbox are active in the Studio on the right.
              </p>
            </div>

            {/* Quick Adjustment Bar */}
            <div className="p-4 rounded-xl bg-surface-200 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  Quick Re-Tune
                </span>
                <button
                  onClick={onCompilePrompt}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Re-Compile
                </button>
              </div>

              {/* Level Tweak */}
              <div>
                <label className="text-[11px] font-mono text-slate-400">Engineering Level:</label>
                <div className="flex gap-2 mt-1">
                  {(['L1', 'L2', 'L3', 'L4'] as EngineeringLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        onLevelChange(lvl);
                        setTimeout(onCompilePrompt, 50);
                      }}
                      className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                        session.level === lvl
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-surface-300 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Tweak */}
              <div>
                <label className="text-[11px] font-mono text-slate-400">Target AI Model:</label>
                <select
                  value={session.targetModel}
                  onChange={(e) => {
                    onTargetModelChange(e.target.value as TargetModel);
                    setTimeout(onCompilePrompt, 50);
                  }}
                  className="w-full mt-1 bg-surface-300 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="claude-3-7-sonnet">Claude 3.7 / 3.5 Sonnet (XML tags)</option>
                  <option value="gemini-2-5-pro">Google Gemini 2.5 Pro (Schema)</option>
                  <option value="gpt-4o">OpenAI GPT-4o / o3-mini (Delimiters)</option>
                  <option value="deepseek-r1">DeepSeek R1 / V3 (Reasoning)</option>
                  <option value="universal">Universal Agnostic</option>
                </select>
              </div>
            </div>

            {/* Revisit Questionnaire */}
            <button
              onClick={() => {
                // switch back to discovery mode
                onResetToDiscovery();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-200 hover:bg-surface-100 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Modify Discovery Questions & Answers
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
