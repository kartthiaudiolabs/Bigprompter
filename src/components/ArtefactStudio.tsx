import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  Terminal,
  ShieldCheck,
  Play,
  History,
  Code2,
  FileCode,
  Sparkles,
  Zap,
  Clock,
  RotateCcw,
  Cpu,
  Coins,
  Layers,
  CheckCircle2,
  Activity,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PromptProjectSession, PromptVersion } from '../types';
import { recommendTargetModel, MODEL_CATALOG, ModelProfile } from '@/modules/providers/modelRecommender';
import { UsageTracker, AggregateUsageStats } from '@/modules/billing/usageTracker';

interface ArtefactStudioProps {
  session: PromptProjectSession;
  onRestoreVersion: (version: PromptVersion) => void;
  apiKey?: string;
}

export const ArtefactStudio: React.FC<ArtefactStudioProps> = ({
  session,
  onRestoreVersion,
  apiKey,
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'audit' | 'sandbox' | 'models' | 'history' | 'deploy'>('prompt');
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('raw');
  const [copied, setCopied] = useState(false);

  // Sandbox state with live streaming
  const [sandboxInput, setSandboxInput] = useState(
    'Please review this sample input or task using the compiled prompt.'
  );
  const [sandboxProvider, setSandboxProvider] = useState<'deterministic' | 'google' | 'anthropic' | 'openai'>('deterministic');
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [streamedOutput, setStreamedOutput] = useState('');
  const [streamTokens, setStreamTokens] = useState(0);
  const [streamLatency, setStreamLatency] = useState(0);

  // Model Recommendation & Usage (Phase 3)
  const recommendation = useMemo(() => {
    return recommendTargetModel(session.domain, session.level, 'quality');
  }, [session.domain, session.level]);

  const usageStats: AggregateUsageStats = useMemo(() => {
    return UsageTracker.getStats(session.id);
  }, [sandboxRunning, session.id]);

  const currentVersion = session.currentVersion;
  const compiledPrompt = currentVersion?.compiledPrompt || '';
  const metrics = currentVersion?.metrics;

  const handleCopy = () => {
    if (!compiledPrompt) return;
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'md' | 'json') => {
    if (!compiledPrompt) return;
    let content = compiledPrompt;
    let filename = `promptexa-${session.level.toLowerCase()}-${session.targetModel}.md`;
    let type = 'text/markdown';

    if (format === 'json') {
      const jsonObj = {
        name: session.title,
        version: currentVersion?.versionNumber || 1,
        level: session.level,
        model: session.targetModel,
        system_prompt: compiledPrompt,
        parameters: {
          temperature: 0.2,
          max_tokens: 4096,
        },
      };
      content = JSON.stringify(jsonObj, null, 2);
      filename = `promptexa-${session.level.toLowerCase()}-${session.targetModel}.json`;
      type = 'application/json';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Live SSE Streaming Test Runner (Phase 3)
  const handleRunStreamingSandbox = async () => {
    if (!compiledPrompt) return;
    setSandboxRunning(true);
    setStreamedOutput('');
    setStreamTokens(0);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/sandbox/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiledPrompt,
          sampleInput: sandboxInput,
          provider: sandboxProvider,
          apiKey,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let tokens = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.text) {
                fullText += data.text;
                setStreamedOutput(fullText);
              }
              if (data.tokensStreamed) {
                tokens = data.tokensStreamed;
                setStreamTokens(tokens);
              }
              if (data.elapsedMs) {
                setStreamLatency(data.elapsedMs);
              }
            } catch {
              // ignore parse errors on partial chunks
            }
          }
        }
      }

      // Record in UsageTracker
      UsageTracker.record({
        projectId: session.id,
        provider: sandboxProvider,
        model: session.targetModel,
        inputTokens: Math.round((compiledPrompt.length + sandboxInput.length) / 4),
        outputTokens: tokens || Math.round(fullText.length / 4),
        totalTokens: Math.round((compiledPrompt.length + sandboxInput.length) / 4) + tokens,
        estimatedCostUSD: 0.0001,
        latencyMs: Date.now() - startTime,
      });
    } catch (e) {
      console.error('Streaming failed:', e);
      setStreamedOutput('Execution failed. Verify API credentials or use Deterministic container.');
    } finally {
      setSandboxRunning(false);
      setStreamLatency(Date.now() - startTime);
    }
  };

  if (!currentVersion || !compiledPrompt) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#07090e]">
        <div className="w-16 h-16 rounded-2xl bg-surface-200 border border-slate-800 flex items-center justify-center text-cyan-400 mb-4 shadow-xl shadow-cyan-950/20">
          <Terminal className="w-8 h-8 opacity-80" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">Contextual Artefact Studio</h3>
        <p className="text-xs text-slate-400 max-w-md mt-1.5 leading-relaxed">
          The Senior Prompt Engineer workspace is active. Input your raw idea or select a template on the left, complete the Discovery Questionnaire, and your production-ready prompt deliverable will render here.
        </p>
        <div className="flex items-center gap-2 mt-6 text-[11px] font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          Awaiting Discovery Baseline...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090e] overflow-hidden">
      {/* Studio Header & Navigation Tabs */}
      <div className="border-b border-surface-100 bg-surface-300/80 backdrop-blur-md px-4 sm:px-6 pt-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          {/* Metadata */}
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-indigo-950 border border-indigo-700 text-indigo-300">
              {currentVersion.level}
            </span>
            <span className="px-2 py-0.5 rounded font-mono text-xs bg-surface-200 border border-slate-700 text-slate-300 uppercase">
              {currentVersion.targetModel}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              v{currentVersion.versionNumber}.0
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm shadow-cyan-500/20"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
            </button>

            <button
              onClick={() => handleDownload('md')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-surface-200 hover:bg-surface-100 border border-slate-800 text-slate-300 transition-colors"
              title="Download Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">.md</span>
            </button>

            <button
              onClick={() => handleDownload('json')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-surface-200 hover:bg-surface-100 border border-slate-800 text-slate-300 transition-colors"
              title="Download JSON Config"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">.json</span>
            </button>
          </div>
        </div>

        {/* Studio Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'prompt' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Compiled Prompt
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Quality & Security Audit
            {metrics && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                {metrics.overallScore}%
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'sandbox' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Live Streaming Sandbox
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'models' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Model Matrix & Cost
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'history' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Versions ({session.history.length})
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'deploy' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            SDK Snippets
          </button>
        </div>
      </div>

      {/* Studio Body Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        {/* =========================================================
            TAB 1: COMPILED PROMPT STUDIO
        ========================================================= */}
        {activeTab === 'prompt' && (
          <div className="space-y-4 animate-fade-in">
            {/* View switcher */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-slate-500">
                  {metrics?.estimatedTokens} estimated tokens
                </span>
                <span className="text-slate-700">|</span>
                <span className="font-mono text-[11px] text-slate-500">
                  Estimated cost: {metrics?.estimatedCostPer1kRuns} / 1k runs
                </span>
              </div>

              <div className="flex items-center gap-1 bg-surface-200 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                    viewMode === 'raw'
                      ? 'bg-surface-50 text-cyan-300 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw Code
                </button>
                <button
                  onClick={() => setViewMode('rendered')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                    viewMode === 'rendered'
                      ? 'bg-surface-50 text-cyan-300 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Formatted Preview
                </button>
              </div>
            </div>

            {/* Prompt Display Box */}
            <div className="rounded-xl bg-surface-300 border border-slate-800/90 shadow-2xl overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-800 bg-surface-200/60 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                  <span className="ml-2 text-slate-300 font-semibold">
                    {session.level}_PRODUCTION_SPEC.{session.targetModel === 'claude-3-7-sonnet' ? 'xml' : 'prompt'}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="p-4 sm:p-5 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
                {compiledPrompt}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: QUALITY & SECURITY AUDIT
        ========================================================= */}
        {activeTab === 'audit' && metrics && (
          <div className="space-y-6 animate-fade-in">
            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Intent Fidelity', score: metrics.intentFidelityScore, color: 'text-cyan-400', bar: 'bg-cyan-500' },
                { label: 'Structural Depth', score: metrics.structuralDepthScore, color: 'text-indigo-400', bar: 'bg-indigo-500' },
                { label: 'Injection Resistance', score: metrics.securityResistanceScore, color: 'text-emerald-400', bar: 'bg-emerald-500' },
                { label: 'Model Compatibility', score: metrics.modelCompatibilityScore, color: 'text-violet-400', bar: 'bg-violet-500' },
              ].map((m) => (
                <div key={m.label} className="p-4 rounded-xl bg-surface-200 border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">{m.label}</div>
                  <div className={`text-2xl font-black mt-1 ${m.color}`}>{m.score}%</div>
                  <div className="w-full bg-surface-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className={`h-full ${m.bar}`} style={{ width: `${m.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Summary Card */}
            <div className="p-5 rounded-xl bg-surface-200 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Quality Audit Verdict</h4>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Score: {metrics.overallScore} / 100
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {metrics.auditNotes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{note.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: LIVE STREAMING TEST SANDBOX (PHASE 3)
        ========================================================= */}
        {activeTab === 'sandbox' && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 rounded-xl bg-surface-200 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase font-mono">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Interactive Streaming Sandbox</span>
                </div>

                {/* Provider Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Provider:</span>
                  <select
                    value={sandboxProvider}
                    onChange={(e: any) => setSandboxProvider(e.target.value)}
                    className="bg-surface-300 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none"
                  >
                    <option value="deterministic">Local Sandbox Container (Zero Key)</option>
                    <option value="google">Google Gemini 2.5 Flash</option>
                    <option value="anthropic">Anthropic Claude 3.7</option>
                    <option value="openai">OpenAI GPT-4o</option>
                  </select>
                </div>
              </div>

              <textarea
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                placeholder="Enter sample user payload to test the compiled prompt..."
                rows={3}
                className="w-full text-xs font-mono bg-surface-300 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-cyan-500 resize-none"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handleRunStreamingSandbox}
                  disabled={sandboxRunning}
                  className="py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {sandboxRunning ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Streaming Response...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Streaming Test Execution</span>
                    </>
                  )}
                </button>

                {streamTokens > 0 && (
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> {streamLatency}ms
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" /> {streamTokens} tokens
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Stream Output Box */}
            {(streamedOutput || sandboxRunning) && (
              <div className="p-4 rounded-xl bg-surface-200 border border-slate-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${sandboxRunning ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`} />
                    <span className="font-semibold text-white">
                      {sandboxRunning ? 'Streaming Live Output...' : 'Execution Stream Completed'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Container: {sandboxProvider}
                  </span>
                </div>

                <div className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-surface-300 p-4 rounded-lg border border-slate-800 max-h-96 overflow-y-auto">
                  {streamedOutput}
                  {sandboxRunning && <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse" />}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 4: MODEL MATRIX & COST TRACKING (PHASE 3)
        ========================================================= */}
        {activeTab === 'models' && (
          <div className="space-y-6 animate-fade-in">
            {/* Recommendation Banner */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold font-mono">
                  <Cpu className="w-4 h-4" />
                  <span>RECOMMENDED TARGET MODEL: {recommendation.recommendedModel.toUpperCase()}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Est. Task Cost: ${recommendation.estimatedCostForTaskUSD}
                </span>
              </div>
              <p className="text-xs text-slate-300">{recommendation.rationale}</p>
            </div>

            {/* Catalog Comparison Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Multi-Model Ecosystem Catalog
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendation.catalog.map((m) => {
                  const isCurrent = m.id === session.targetModel;
                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-cyan-950/30 border-cyan-500 text-white'
                          : 'bg-surface-200 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-white">{m.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 text-slate-400 uppercase">
                          {m.provider}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-2.5 py-2 border-y border-slate-800/80 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-500">Input / 1M:</span> ${m.inputCostPerMillionUSD}
                        </div>
                        <div>
                          <span className="text-slate-500">Output / 1M:</span> ${m.outputCostPerMillionUSD}
                        </div>
                        <div>
                          <span className="text-slate-500">Context:</span> {m.contextWindowTokens.toLocaleString()} tokens
                        </div>
                        <div>
                          <span className="text-slate-500">Best For:</span> L1–L4
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug">{m.bestFor}</p>

                      <div className="mt-2 text-[10px] font-mono text-cyan-400">
                        Syntax: {m.syntaxFlavor}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aggregate Project Usage Stats */}
            <div className="p-4 rounded-xl bg-surface-200 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-white uppercase">Project Usage Metrics</span>
                <span className="text-[11px] font-mono text-slate-400">
                  Total Sandbox Runs: {usageStats.totalCalls}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1 text-center font-mono">
                <div className="p-2.5 rounded-lg bg-surface-300 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Total Tokens</div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">{usageStats.totalTokens}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-300 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Estimated Spend</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">${usageStats.totalCostUSD}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-300 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Active Provider</div>
                  <div className="text-sm font-bold text-indigo-400 mt-0.5">{sandboxProvider}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: VERSION HISTORY & DIFF
        ========================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
              Prompt Iteration History
            </h4>

            <div className="space-y-3">
              {session.history.map((ver) => (
                <div
                  key={ver.id}
                  className={`p-4 rounded-xl border transition-all ${
                    ver.id === currentVersion.id
                      ? 'bg-cyan-950/20 border-cyan-500/70'
                      : 'bg-surface-200 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white">
                        Version {ver.versionNumber}.0
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-surface-100 text-slate-300 border border-slate-700">
                        {ver.level}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(ver.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {ver.id !== currentVersion.id && (
                      <button
                        onClick={() => onRestoreVersion(ver)}
                        className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restore
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    {ver.changeSummary || 'Initial compilation baseline.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 6: DEPLOY & SDK SNIPPETS
        ========================================================= */}
        {activeTab === 'deploy' && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
              Production Code Integration Snippets
            </h4>

            {/* Google Gemini SDK */}
            <div className="rounded-xl bg-surface-200 border border-slate-800 overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-800 bg-surface-100 flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-cyan-300">Google Gemini (@google/genai TypeScript)</span>
              </div>
              <pre className="p-4 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI();

const systemInstruction = \`${compiledPrompt.replace(/`/g, '\\`')}\`;

const response = await ai.models.generateContent({
  model: '${session.targetModel === 'gemini-2-5-pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash'}',
  config: {
    systemInstruction,
    temperature: 0.2,
  },
  contents: 'Process input payload...',
});

console.log(response.text);`}
              </pre>
            </div>

            {/* Anthropic Claude SDK */}
            <div className="rounded-xl bg-surface-200 border border-slate-800 overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-800 bg-surface-100 flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-indigo-300">Anthropic Claude SDK (Python)</span>
              </div>
              <pre className="p-4 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`import anthropic

client = anthropic.Anthropic()

system_prompt = """${compiledPrompt.replace(/"""/g, '\"\"\"')}"""

message = client.messages.create(
    model="claude-3-7-sonnet-20250219",
    max_tokens=4096,
    temperature=0.2,
    system=system_prompt,
    messages=[
        {"role": "user", "content": "{{USER_INPUT}}"}
    ]
)
print(message.content[0].text)`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
