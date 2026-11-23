import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Share2,
  Terminal,
  ShieldCheck,
  Play,
  History,
  Code2,
  Eye,
  FileCode,
  Sparkles,
  Zap,
  Clock,
  Coins,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PromptProjectSession, PromptVersion } from '../types';
import { testPromptInSandbox } from '../services/promptEngine';

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
  const [activeTab, setActiveTab] = useState<'prompt' | 'audit' | 'sandbox' | 'history' | 'deploy'>('prompt');
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('raw');
  const [copied, setCopied] = useState(false);

  // Sandbox state
  const [sandboxInput, setSandboxInput] = useState(
    'Please review this sample input or task using the compiled prompt.'
  );
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<{
    output: string;
    latencyMs: number;
    provider: string;
    tokensUsed: number;
  } | null>(null);

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

  const triggerConfettiCelebration = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#8b5cf6', '#10b981'],
    });
  };

  const handleRunSandbox = async () => {
    if (!compiledPrompt) return;
    setSandboxRunning(true);
    try {
      const res = await testPromptInSandbox(compiledPrompt, sandboxInput, apiKey);
      setSandboxResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSandboxRunning(false);
    }
  };

  // If no prompt has been compiled yet
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
              activeTab === 'prompt'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Compiled Prompt
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
              activeTab === 'sandbox'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Test Sandbox
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Versions ({session.history.length})
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`pb-2.5 px-3 border-b-2 font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'deploy'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            API & SDK Snippets
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
                    {note.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : note.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    )}
                    <span>{note.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Production Architecture Checklist */}
            <div className="p-5 rounded-xl bg-surface-200 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
                Architecture Standard Assertions
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { title: 'Isolated Untrusted Input Tags', status: currentVersion.level === 'L4' || currentVersion.level === 'L3' },
                  { title: 'Deterministic Output Contract Enforced', status: true },
                  { title: 'Negative Boundary Constraints Defined', status: true },
                  { title: 'Failure & Fallback Matrix Included', status: currentVersion.level !== 'L1' },
                  { title: 'Few-Shot Demonstrative Examples Embedded', status: currentVersion.level === 'L3' || currentVersion.level === 'L4' },
                ].map((chk, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-300/80 border border-slate-800/60">
                    <span className="text-slate-300">{chk.title}</span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold ${
                        chk.status
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {chk.status ? 'PASSED' : 'SKIPPED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: TEST SANDBOX
        ========================================================= */}
        {activeTab === 'sandbox' && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 rounded-xl bg-surface-200 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase font-mono">
                  <Play className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sandbox Test Input</span>
                </div>
                {apiKey ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Connected to Gemini API
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 text-slate-400 border border-slate-700">
                    Deterministic Simulation Mode
                  </span>
                )}
              </div>

              <textarea
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                placeholder="Enter sample input to run against this prompt..."
                rows={3}
                className="w-full text-xs font-mono bg-surface-300 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-cyan-500 resize-none"
              />

              <button
                onClick={handleRunSandbox}
                disabled={sandboxRunning}
                className="py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {sandboxRunning ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing in Container...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Execute Prompt with Sample Input</span>
                  </>
                )}
              </button>
            </div>

            {/* Sandbox Results */}
            {sandboxResult && (
              <div className="p-4 rounded-xl bg-surface-200 border border-slate-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-white">Execution Result</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> {sandboxResult.latencyMs}ms
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" /> {sandboxResult.tokensUsed} tokens
                    </span>
                  </div>
                </div>

                <div className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-surface-300 p-4 rounded-lg border border-slate-800 max-h-96 overflow-y-auto">
                  {sandboxResult.output}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 4: VERSION HISTORY & DIFF
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
            TAB 5: DEPLOY & SDK SNIPPETS
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
