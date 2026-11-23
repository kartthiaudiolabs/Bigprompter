import React from 'react';
import { Sparkles, Terminal, Key, BookOpen, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { UserMode } from '../types';

interface HeaderProps {
  userMode: UserMode;
  onUserModeChange: (mode: UserMode) => void;
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  onNewSession: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userMode,
  onUserModeChange,
  onOpenTemplates,
  onOpenSettings,
  onNewSession,
  hasApiKey,
}) => {
  return (
    <header className="border-b border-surface-100 bg-[#07090e]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-violet-600 shadow-lg shadow-cyan-500/20 text-white font-bold text-xl">
            <Sparkles className="w-5 h-5 animate-pulse-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                PROMPTEXA
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                BIG PROMPTER v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Think Bigger. Prompt Better. <span className="text-slate-600">|</span> L1–L4 Multi-Model Engineering OS
            </p>
          </div>
        </div>

        {/* Center / Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Mode Switcher */}
          <div className="hidden md:flex items-center bg-surface-200 p-1 rounded-lg border border-slate-800/80 text-xs">
            <button
              onClick={() => onUserModeChange('beginner')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                userMode === 'beginner'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => onUserModeChange('professional')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                userMode === 'professional'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Professional
            </button>
            <button
              onClick={() => onUserModeChange('expert')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                userMode === 'expert'
                  ? 'bg-violet-500/20 text-violet-300 shadow-sm border border-violet-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expert
            </button>
          </div>

          {/* Templates Picker */}
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-100 hover:bg-surface-50 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
            title="Browse Starter Prompt Templates"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          {/* Settings / API Key */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              hasApiKey
                ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-surface-100 hover:bg-surface-50 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title="Configure Gemini API Key / BYOK"
          >
            <Key className={`w-3.5 h-3.5 ${hasApiKey ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">{hasApiKey ? 'Gemini Live' : 'API Keys'}</span>
          </button>

          {/* Reset Session */}
          <button
            onClick={onNewSession}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-100 hover:bg-red-950/30 text-slate-300 hover:text-red-300 border border-slate-800 hover:border-red-900/40 transition-colors"
            title="Reset and Start Fresh"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-400" />
            <span className="hidden sm:inline">New Prompt</span>
          </button>
        </div>
      </div>
    </header>
  );
};
