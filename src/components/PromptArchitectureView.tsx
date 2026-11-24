import React from 'react';
import {
  Layers,
  ShieldAlert,
  Terminal,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Sliders,
  AlertTriangle,
  Info
} from 'lucide-react';
import { PromptArchitectureSchematic, ArchitectureBlock } from '@/modules/architecture';

interface PromptArchitectureViewProps {
  schematic: PromptArchitectureSchematic;
  onToggleBlock: (blockId: string) => void;
  onProceedToCompile: () => void;
  onBackToDiscovery: () => void;
}

export const PromptArchitectureView: React.FC<PromptArchitectureViewProps> = ({
  schematic,
  onToggleBlock,
  onProceedToCompile,
  onBackToDiscovery,
}) => {
  const enabledCount = schematic.blocks.filter(b => b.isEnabled).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Schematic Header */}
      <div className="p-4 rounded-xl bg-surface-200 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Prompt Architecture Schematic
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            {enabledCount} / {schematic.blocks.length} Blocks Active
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Before compiling your production deliverable, inspect the structural architecture below. You can toggle optional modules on or off according to your operational environment.
        </p>
      </div>

      {/* Visual Pipeline Data Flow */}
      <div className="p-4 rounded-xl bg-surface-300/80 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          Data Flow Sequence
        </div>
        <div className="bg-surface-400/80 p-3 rounded-lg border border-slate-800/80 text-cyan-300 whitespace-pre leading-relaxed overflow-x-auto">
          {schematic.dataFlowDiagram}
        </div>
      </div>

      {/* Architecture Blocks Interactive Grid */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center justify-between">
          <span>Component Blocks</span>
          <span className="text-[10px] text-slate-500">Target Model: {schematic.targetModel.toUpperCase()}</span>
        </div>

        <div className="space-y-2">
          {schematic.blocks.map((block) => (
            <div
              key={block.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                block.isEnabled
                  ? 'bg-surface-200/90 border-slate-700/80 text-white'
                  : 'bg-surface-300/40 border-slate-800/60 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{block.tagPattern}</span>
                  <span className="text-xs font-semibold text-slate-200">{block.title}</span>
                  {block.isMandatory && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      Required
                    </span>
                  )}
                  {block.category === 'security' && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Security
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {block.description}
                </p>
              </div>

              {!block.isMandatory ? (
                <button
                  onClick={() => onToggleBlock(block.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all shrink-0 ${
                    block.isEnabled
                      ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                      : 'bg-surface-100 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {block.isEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              ) : (
                <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0 px-2 py-1">
                  LOCKED
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onProceedToCompile}
          className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
        >
          <span>Compile Production Prompt Deliverable ({schematic.level})</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onBackToDiscovery}
          className="px-4 py-3 rounded-xl bg-surface-200 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
        >
          Back to Questions
        </button>
      </div>
    </div>
  );
};
