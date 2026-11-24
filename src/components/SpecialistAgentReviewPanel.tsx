import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Sparkles,
  RefreshCw,
  Sliders,
  ChevronRight,
  HelpCircle,
  FileText,
  Lock,
} from 'lucide-react';
import {
  OrchestrationReport,
  AgentRole,
  orchestratorService,
  AgentDisagreement,
} from '@/modules/agents';

interface SpecialistAgentReviewPanelProps {
  promptText: string;
  domain: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  targetModel: string;
}

export const SpecialistAgentReviewPanel: React.FC<SpecialistAgentReviewPanelProps> = ({
  promptText,
  domain,
  level,
  targetModel,
}) => {
  const [report, setReport] = useState<OrchestrationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAgentRole, setSelectedAgentRole] = useState<AgentRole | 'all'>('all');
  const [resolvedDisagreements, setResolvedDisagreements] = useState<Record<string, boolean>>({});

  const runOrchestration = async () => {
    if (!promptText || promptText.trim().length === 0) return;
    setLoading(true);
    try {
      // Use direct service call for zero latency in client component
      const res = await orchestratorService.orchestrate({
        promptText,
        domain,
        level,
        targetModel,
      });
      setReport(res);
    } catch (err) {
      console.error('Failed to run agent orchestration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (promptText) {
      runOrchestration();
    }
  }, [promptText, domain, level, targetModel]);

  const toggleResolveDisagreement = (id: string) => {
    setResolvedDisagreements((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!promptText) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center p-6 text-slate-500">
        <Users className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
        <p className="text-sm font-medium text-slate-400">No prompt compiled yet</p>
        <p className="text-xs text-slate-600 mt-1">
          Complete the discovery questionnaire or select a template to run specialist agent reviews.
        </p>
      </div>
    );
  }

  const getVerdictBadge = (verdict: OrchestrationReport['readinessVerdict']) => {
    switch (verdict) {
      case 'ready':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center gap-1.5 shadow-sm shadow-emerald-950">
            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED FOR PRODUCTION
          </span>
        );
      case 'conditional':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 border border-amber-700 text-amber-400 flex items-center gap-1.5 shadow-sm shadow-amber-950">
            <AlertTriangle className="w-3.5 h-3.5" /> CONDITIONAL PASS
          </span>
        );
      case 'blocked':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 border border-rose-700 text-rose-400 flex items-center gap-1.5 shadow-sm shadow-rose-950">
            <ShieldAlert className="w-3.5 h-3.5" /> BLOCKED — CRITICAL RISKS
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-950 border border-orange-700 text-orange-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> REVISION RECOMMENDED
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto overflow-y-auto custom-scrollbar">
      {/* Top Banner: Orchestrator Summary */}
      <div className="p-5 rounded-2xl bg-surface-200/90 border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Senior Prompt Engineer Orchestrator</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
                  4 Active Specialists
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Hierarchical multi-agent audit, boundary validation, and consensus synthesis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            {report && getVerdictBadge(report.readinessVerdict)}
            <button
              onClick={runOrchestration}
              disabled={loading}
              className="p-2 rounded-lg bg-surface-300 hover:bg-surface-100 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Re-run Specialist Agent Review"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Score & Synthesis metrics */}
        {report && (
          <div className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-300/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Consensus Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-white">{report.overallScore}</span>
                <span className="text-xs text-slate-500 font-mono">/ 100</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    report.overallScore >= 80 ? 'bg-emerald-500' : report.overallScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${report.overallScore}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-300/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Critical Risks</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-extrabold ${report.criticalIssuesCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {report.criticalIssuesCount}
                </span>
                <span className="text-xs text-slate-500">Unresolved</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2">
                {report.criticalIssuesCount === 0 ? 'Zero critical blockers' : 'Requires immediate patch'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-300/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Warnings & Standards</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-amber-400">{report.warningsCount}</span>
                <span className="text-xs text-slate-500">Notices</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2">Best-practice deviations</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-300/80 border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Active Conflicts</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-indigo-400">{report.disagreements.length}</span>
                <span className="text-xs text-slate-500">Trade-offs</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2">Multi-agent disagreements</span>
            </div>
          </div>
        )}

        {report && (
          <div className="mt-4 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-900/60 text-xs text-indigo-200 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-300">Synthesis Narrative: </span>
              {report.orchestratorSynthesis}
            </div>
          </div>
        )}
      </div>

      {/* Disagreements & Consensus Gate (if any) */}
      {report && report.disagreements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Multi-Agent Architectural Disagreements ({report.disagreements.length})
            </h4>
          </div>

          <div className="space-y-3">
            {report.disagreements.map((disagree) => {
              const isResolved = resolvedDisagreements[disagree.id];
              return (
                <div
                  key={disagree.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isResolved
                      ? 'bg-surface-300/50 border-emerald-900/50 opacity-80'
                      : 'bg-amber-950/20 border-amber-900/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-400">
                        {disagree.agentsInvolved[0].replace('_', ' ').toUpperCase()} vs{' '}
                        {disagree.agentsInvolved[1].replace('_', ' ').toUpperCase()}
                      </span>
                      {disagree.requiresUserApproval && (
                        <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-rose-950 border border-rose-800 text-rose-300">
                          HUMAN APPROVAL GATE
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleResolveDisagreement(disagree.id)}
                      className={`text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors self-start sm:self-center ${
                        isResolved
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {isResolved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Accepted
                        </>
                      ) : (
                        <>
                          <Sliders className="w-3.5 h-3.5" /> Accept Recommended Trade-off
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-2.5 space-y-1.5 text-xs">
                    <p className="text-slate-300">
                      <span className="text-slate-500 font-semibold">Conflict: </span>
                      {disagree.conflictDescription}
                    </p>
                    <p className="text-slate-400">
                      <span className="text-slate-500 font-semibold">Trade-off Analysis: </span>
                      {disagree.tradeoffAnalysis}
                    </p>
                    <div className="p-2 rounded-lg bg-surface-200 border border-slate-800 text-emerald-300 font-mono text-[11px] flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{disagree.recommendedResolution}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Specialist Agent Tabs / Filter */}
      {report && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Specialist Intelligence Deep-Dives
            </h4>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setSelectedAgentRole('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedAgentRole === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Specialists
              </button>
              {report.agentReviews.map((rev) => (
                <button
                  key={rev.agentRole}
                  onClick={() => setSelectedAgentRole(rev.agentRole)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedAgentRole === rev.agentRole
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rev.agentRole === 'security_auditor'
                    ? 'Security'
                    : rev.agentRole === 'domain_specialist'
                    ? 'Domain'
                    : rev.agentRole === 'quality_evaluator'
                    ? 'Quality'
                    : 'Architecture'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.agentReviews
              .filter((rev) => selectedAgentRole === 'all' || selectedAgentRole === rev.agentRole)
              .map((rev) => (
                <div
                  key={rev.agentRole}
                  className="p-4 rounded-xl bg-surface-200 border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        {rev.agentRole === 'security_auditor' ? (
                          <Lock className="w-4 h-4 text-rose-400" />
                        ) : rev.agentRole === 'domain_specialist' ? (
                          <FileText className="w-4 h-4 text-cyan-400" />
                        ) : rev.agentRole === 'quality_evaluator' ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Cpu className="w-4 h-4 text-indigo-400" />
                        )}
                        <span className="text-xs font-bold text-white">{rev.agentName}</span>
                      </div>
                      <span className="text-xs font-mono font-extrabold text-cyan-400">
                        {rev.score}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{rev.summary}</p>

                    {/* Findings list */}
                    {rev.findings.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {rev.findings.map((finding) => (
                          <div
                            key={finding.id}
                            className="p-2.5 rounded-lg bg-surface-300/80 border border-slate-800 text-[11px] space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-200">{finding.category}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                                  finding.severity === 'critical'
                                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                    : finding.severity === 'high'
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {finding.severity}
                              </span>
                            </div>
                            <p className="text-slate-300">{finding.message}</p>
                            <p className="text-cyan-400/90 font-mono text-[10px]">
                              💡 {finding.recommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
