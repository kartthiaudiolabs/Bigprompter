import React, { useState, useMemo } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Layers,
  Sparkles,
  ExternalLink,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import {
  TargetSDK,
  ExportFormat,
  sdkGenerator,
  exportService,
} from '@/modules/export';

interface DeployStudioPanelProps {
  promptText: string;
  promptTitle: string;
  versionNumber: number;
  level: string;
  domain: string;
  defaultModel: string;
}

export const DeployStudioPanel: React.FC<DeployStudioPanelProps> = ({
  promptText,
  promptTitle,
  versionNumber,
  level,
  domain,
  defaultModel,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('typescript');
  const [selectedSdk, setSelectedSdk] = useState<TargetSDK>(
    defaultModel.includes('claude')
      ? 'anthropic'
      : defaultModel.includes('gpt')
      ? 'openai'
      : 'google'
  );
  const [streaming, setStreaming] = useState(true);
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [copied, setCopied] = useState(false);

  // Generate code dynamically based on current configuration
  const bundle = useMemo(() => {
    return exportService.createExportBundle({
      promptText,
      title: promptTitle,
      version: versionNumber,
      level,
      domain,
      targetModel: defaultModel,
      format: selectedFormat,
      options: {
        targetSdk: selectedSdk,
        streaming,
        temperature,
        maxTokens,
      },
    });
  }, [
    promptText,
    promptTitle,
    versionNumber,
    level,
    domain,
    defaultModel,
    selectedFormat,
    selectedSdk,
    streaming,
    temperature,
    maxTokens,
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(bundle.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([bundle.content], { type: bundle.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = bundle.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formats: { id: ExportFormat; label: string; icon: any }[] = [
    { id: 'typescript', label: 'TypeScript SDK', icon: Code2 },
    { id: 'python', label: 'Python SDK', icon: Terminal },
    { id: 'nextjs_route', label: 'Next.js Edge Route', icon: FileCode },
    { id: 'curl', label: 'cURL Command', icon: Terminal },
    { id: 'yaml_langchain', label: 'PromptFoo / LangChain YAML', icon: Layers },
    { id: 'json', label: 'JSON Config', icon: FileCode },
    { id: 'markdown', label: 'Markdown (.md)', icon: FileCode },
  ];

  const sdks: { id: TargetSDK; label: string; icon: string }[] = [
    { id: 'anthropic', label: 'Anthropic Claude', icon: '🟣' },
    { id: 'google', label: 'Google Gemini', icon: '🔵' },
    { id: 'openai', label: 'OpenAI GPT-4o', icon: '🟢' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto overflow-y-auto custom-scrollbar">
      {/* Header Card */}
      <div className="p-5 rounded-2xl bg-surface-200 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Multi-Language Deployment & Integration Generator</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                L1–L4 Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy-pasteable production clients pre-configured with input containment delimiters and streaming adapters.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Snippet!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-300 hover:bg-surface-100 border border-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {bundle.filename}</span>
            </button>
          </div>
        </div>

        {/* Integration Options Toolbar */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Target SDK Selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Target AI Provider SDK</span>
            <div className="flex items-center gap-1.5">
              {sdks.map((sdk) => (
                <button
                  key={sdk.id}
                  onClick={() => setSelectedSdk(sdk.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    selectedSdk === sdk.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-surface-300 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{sdk.icon}</span>
                  <span>{sdk.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Streaming Toggle */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Response Mode</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStreaming(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  streaming
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-surface-300 text-slate-400'
                }`}
              >
                ⚡ Live Streaming (SSE)
              </button>
              <button
                onClick={() => setStreaming(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !streaming
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-surface-300 text-slate-400'
                }`}
              >
                Blocking (Unary)
              </button>
            </div>
          </div>

          {/* Temperature & Token parameters */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>Temperature: {temperature}</span>
              <span>Max Tokens: {maxTokens}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-surface-300 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Format Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs custom-scrollbar">
        {formats.map((fmt) => {
          const Icon = fmt.icon;
          const isActive = selectedFormat === fmt.id;
          return (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-surface-200 text-slate-400 hover:text-slate-200 hover:bg-surface-300 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{fmt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Code Display Container */}
      <div className="rounded-2xl bg-surface-200 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-5 py-3 border-b border-slate-800 bg-surface-300/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-slate-300 font-semibold ml-2">{bundle.filename}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase">{bundle.mimeType}</span>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-white transition-colors"
              title="Copy code to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <pre className="p-5 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto custom-scrollbar max-h-[500px] bg-[#05070b]">
          {bundle.content}
        </pre>
      </div>
    </div>
  );
};
