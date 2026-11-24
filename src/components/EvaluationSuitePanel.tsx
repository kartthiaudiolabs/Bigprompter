import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Flame,
  FileCheck,
  Lock,
  ChevronDown,
  ChevronRight,
  Terminal,
  Play,
  Award,
} from 'lucide-react';
import {
  AdversarialSuiteReport,
  adversarialSuiteRunner,
  RubricEvaluationReport,
  rubricEvaluator,
  ContractValidationReport,
  contractValidator,
} from '@/modules/evaluation';

interface EvaluationSuitePanelProps {
  promptText: string;
  sampleOutput?: string;
  domain: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  apiKey?: string;
}

export const EvaluationSuitePanel: React.FC<EvaluationSuitePanelProps> = ({
  promptText,
  sampleOutput,
  domain,
  level,
  apiKey,
}) => {
  const [subView, setSubView] = useState<'adversarial' | 'rubric' | 'assertions'>('adversarial');

  // Adversarial Suite State
  const [advReport, setAdvReport] = useState<AdversarialSuiteReport | null>(null);
  const [advLoading, setAdvLoading] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // Rubric State
  const [rubricReport, setRubricReport] = useState<RubricEvaluationReport | null>(null);
  const [rubricOutputText, setRubricOutputText] = useState(
    sampleOutput ||
      `### 1. Architecture Overview\nThe system uses event-driven microservices with Redis stream ingestion.\n\n### 2. Typed Interfaces\n\`\`\`typescript\nexport interface IngestPayload { id: string; timestamp: number; }\n\`\`\`\n\n### 3. Failure Matrix\nGraceful fallbacks are implemented for network partition errors.`
  );
  const [rubricLoading, setRubricLoading] = useState(false);

  // Contract Assertions State
  const [assertionReport, setAssertionReport] = useState<ContractValidationReport | null>(null);

  // Run Adversarial Test Suite
  const runAdversarialSuite = async () => {
    if (!promptText) return;
    setAdvLoading(true);
    try {
      const res = await adversarialSuiteRunner.runSuite(promptText, {
        provider: apiKey ? 'google' : 'deterministic',
        apiKey,
      });
      setAdvReport(res);
    } catch (err) {
      console.error('Failed to run adversarial test suite:', err);
    } finally {
      setAdvLoading(false);
    }
  };

  // Run Rubric Evaluation
  const runRubricEvaluation = () => {
    if (!promptText || !rubricOutputText) return;
    setRubricLoading(true);
    try {
      const res = rubricEvaluator.evaluate({
        promptText,
        outputText: rubricOutputText,
        domain,
        level,
      });
      setRubricReport(res);
    } catch (err) {
      console.error('Failed to run rubric evaluation:', err);
    } finally {
      setRubricLoading(false);
    }
  };

  // Run Assertions Validation
  const runAssertionsValidation = () => {
    if (!promptText || !rubricOutputText) return;
    const defaultAssertions = contractValidator.inferDefaultAssertions(promptText);
    const res = contractValidator.validate(rubricOutputText, defaultAssertions);
    setAssertionReport(res);
  };

  useEffect(() => {
    if (promptText) {
      runAdversarialSuite();
      runRubricEvaluation();
      runAssertionsValidation();
    }
  }, [promptText, domain, level]);

  // Sync external sample output when it updates from Sandbox
  useEffect(() => {
    if (sampleOutput && sampleOutput.trim().length > 0) {
      setRubricOutputText(sampleOutput);
    }
  }, [sampleOutput]);

  if (!promptText) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center p-6 text-slate-500">
        <ShieldAlert className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
        <p className="text-sm font-medium text-slate-400">No prompt compiled yet</p>
        <p className="text-xs text-slate-600 mt-1">
          Compile a prompt to run adversarial injection suites and evidence-based rubric evaluation.
        </p>
      </div>
    );
  }

  const getSecurityBadge = (grade: AdversarialSuiteReport['securityGrade']) => {
    switch (grade) {
      case 'FORTIFIED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" /> FORTIFIED (100% DEFENDED)
          </span>
        );
      case 'ACCEPTABLE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 border border-cyan-700 text-cyan-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> ACCEPTABLE RESILIENCE
          </span>
        );
      case 'VULNERABLE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-950 border border-amber-700 text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> VULNERABLE VECTORS
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-950 border border-rose-700 text-rose-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" /> CRITICAL RISK
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto overflow-y-auto custom-scrollbar">
      {/* Sub-view Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubView('adversarial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              subView === 'adversarial'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Adversarial Injection Suite
          </button>

          <button
            onClick={() => setSubView('rubric')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              subView === 'rubric'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Evidence-Based Rubric
          </button>

          <button
            onClick={() => setSubView('assertions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              subView === 'assertions'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Contract Assertions
          </button>
        </div>

        {subView === 'adversarial' && (
          <button
            onClick={runAdversarialSuite}
            disabled={advLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-300 hover:bg-surface-100 border border-slate-700 text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${advLoading ? 'animate-spin text-rose-400' : ''}`} />
            Run Security Battery
          </button>
        )}
      </div>

      {/* =========================================================
          VIEW A: ADVERSARIAL PROMPT INJECTION BATTERY
      ========================================================= */}
      {subView === 'adversarial' && advReport && (
        <div className="space-y-5 animate-fade-in">
          {/* Header Card */}
          <div className="p-5 rounded-2xl bg-surface-200 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Adversarial Prompt Injection Defense Battery</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-300 text-slate-300 border border-slate-700">
                    5 Attack Vectors
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated security harness testing instruction overrides, system extraction, and breakout delimiters.
                </p>
              </div>

              {getSecurityBadge(advReport.securityGrade)}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-surface-300/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block">Defense Rate</span>
                <span className="text-xl font-mono font-extrabold text-emerald-400">{advReport.defenseRate}%</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {advReport.defendedCount} of {advReport.totalTests} attacks repelled
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-300/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block">Breached Vectors</span>
                <span className={`text-xl font-mono font-extrabold ${advReport.breachedCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {advReport.breachedCount}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {advReport.breachedCount === 0 ? 'Zero vulnerabilities' : 'Action required'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-300/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block">Execution Mode</span>
                <span className="text-sm font-semibold text-indigo-300 block mt-1">
                  {apiKey ? 'Live Model Probing' : 'Deterministic Containment'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Automated test harness</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 p-3 rounded-xl bg-surface-300 border border-slate-800">
              💡 <span className="font-semibold text-slate-200">Defense Summary: </span>{advReport.summary}
            </p>
          </div>

          {/* Test Case Results Accordion */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Attack Vector Execution Results
            </h4>

            {advReport.results.map((res) => {
              const isExpanded = expandedTestId === res.testCaseId;
              const isDefended = res.status === 'defended';

              return (
                <div
                  key={res.testCaseId}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isDefended ? 'bg-surface-200/90 border-slate-800' : 'bg-rose-950/20 border-rose-900/60'
                  }`}
                >
                  <button
                    onClick={() => setExpandedTestId(isExpanded ? null : res.testCaseId)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isDefended ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{res.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-surface-300 text-slate-400 uppercase">
                            {res.attackType.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{res.defenseExplanation}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isDefended
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {isDefended ? 'DEFENDED' : 'BREACHED'}
                      </span>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-surface-300/40 space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block mb-1">Adversarial Payload Injected:</span>
                        <pre className="p-2.5 rounded-lg bg-surface-200 border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto whitespace-pre-wrap">
                          {res.payload}
                        </pre>
                      </div>

                      <div className="pt-1">
                        <span className="text-slate-500 font-semibold block mb-0.5">Verification Evidence:</span>
                        <p className="font-mono text-[11px] text-cyan-400">{res.evidence}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW B: EVIDENCE-BASED RUBRIC EVALUATOR
      ========================================================= */}
      {subView === 'rubric' && (
        <div className="space-y-5 animate-fade-in">
          {/* Rubric Scorecard */}
          {rubricReport && (
            <div className="p-5 rounded-2xl bg-surface-200 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-cyan-500/20">
                    {rubricReport.grade}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Multi-Dimensional Rubric Scorecard</h3>
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        {rubricReport.overallScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{rubricReport.summary}</p>
                  </div>
                </div>

                <button
                  onClick={runRubricEvaluation}
                  disabled={rubricLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950 transition-colors self-start sm:self-center"
                >
                  Re-evaluate Output
                </button>
              </div>

              {/* Rubric Dimensions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {rubricReport.dimensions.map((dim) => (
                  <div
                    key={dim.dimension}
                    className="p-3.5 rounded-xl bg-surface-300/80 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{dim.label}</span>
                      <span
                        className={`text-xs font-mono font-extrabold ${
                          dim.score >= 80 ? 'text-emerald-400' : dim.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        {dim.score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{dim.reasoning}</p>

                    {dim.evidenceCitations.length > 0 && (
                      <div className="pt-1 space-y-1">
                        {dim.evidenceCitations.map((cite, idx) => (
                          <div key={idx} className="text-[10px] font-mono text-cyan-300/90 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                            <span>{cite}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Output for Rubric Inspection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Output Under Evaluation (Editable for What-If Testing)
              </label>
              <span className="text-[11px] text-slate-500">Live text synchronization from sandbox</span>
            </div>
            <textarea
              rows={6}
              value={rubricOutputText}
              onChange={(e) => setRubricOutputText(e.target.value)}
              className="w-full bg-surface-300 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500/60 custom-scrollbar"
              placeholder="Paste or run sandbox output to evaluate against the multi-dimensional rubric..."
            />
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW C: OUTPUT CONTRACT ASSERTION VALIDATOR
      ========================================================= */}
      {subView === 'assertions' && (
        <div className="space-y-5 animate-fade-in">
          {assertionReport && (
            <div className="p-5 rounded-2xl bg-surface-200 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Output Contract Assertion Checklist</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Deterministic validation of structural headers, JSON syntax, and negative constraints.
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                    assertionReport.valid
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {assertionReport.passedCount} / {assertionReport.totalAssertions} ASSERTIONS PASSED
                </span>
              </div>

              {/* Assertions list */}
              <div className="space-y-2 pt-2">
                {assertionReport.results.map((res) => (
                  <div
                    key={res.assertionId}
                    className="p-3 rounded-xl bg-surface-300 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {res.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-200 block">{res.message}</span>
                        {res.evidenceSnippet && (
                          <span className="text-[10px] font-mono text-cyan-400 block mt-0.5">
                            {res.evidenceSnippet}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-200 text-slate-400 uppercase">
                      {res.type.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
