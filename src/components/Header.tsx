import React from 'react';
import {
  Sparkles,
  Key,
  BookOpen,
  RotateCcw,
  FolderKanban,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { UserMode } from '../types';
import { Project } from '@/modules/projects';
import { AuthUser } from '@/modules/auth';

interface HeaderProps {
  userMode: UserMode;
  onUserModeChange: (mode: UserMode) => void;
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  onNewSession: () => void;
  hasApiKey: boolean;
  activeProject: Project;
  onOpenProjects: () => void;
  authUser: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userMode,
  onUserModeChange,
  onOpenTemplates,
  onOpenSettings,
  onNewSession,
  hasApiKey,
  activeProject,
  onOpenProjects,
  authUser,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="border-b border-surface-100 bg-[#07090e]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-violet-600 shadow-lg shadow-cyan-500/20 text-white font-bold text-lg">
            <Sparkles className="w-4 h-4 animate-pulse-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                PROMPTEXA
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wide bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                v1.0 OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xl:block">
              Think Bigger. Prompt Better. <span className="text-slate-600">|</span> L1–L4 Multi-Model Engineering
            </p>
          </div>
        </div>

        {/* Center: Active Project Scope Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProjects}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-100 border border-slate-800 hover:border-cyan-500/60 transition-all text-xs text-left"
            title="Switch or Manage Isolated Project Scopes"
          >
            <FolderKanban className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="hidden sm:block">
              <div className="text-[10px] text-slate-500 font-mono leading-none">PROJECT SCOPE</div>
              <div className="font-semibold text-slate-200 truncate max-w-[150px] leading-tight">
                {activeProject?.title || 'Core Workspace'}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500 ml-1" />
          </button>
        </div>

        {/* Right / Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Mode Switcher */}
          <div className="hidden lg:flex items-center bg-surface-200 p-0.5 rounded-lg border border-slate-800 text-xs">
            {(['beginner', 'professional', 'expert'] as UserMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onUserModeChange(mode)}
                className={`px-2 py-1 rounded-md capitalize transition-all font-medium text-[11px] ${
                  userMode === mode
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Templates */}
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-surface-100 hover:bg-surface-50 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
            title="Browse Starter Blueprints"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          {/* Settings / API Key */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              hasApiKey
                ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-surface-100 hover:bg-surface-50 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title="Configure Gemini API Key / BYOK"
          >
            <Key className={`w-3.5 h-3.5 ${hasApiKey ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">{hasApiKey ? 'Live Gemini' : 'BYOK'}</span>
          </button>

          {/* User Auth Menu */}
          {authUser ? (
            <div className="flex items-center gap-1.5 bg-surface-200 border border-slate-800 rounded-lg p-1 pr-2">
              <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold text-[10px] flex items-center justify-center">
                {authUser.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-slate-300 hidden md:inline truncate max-w-[100px]">
                {authUser.fullName}
              </span>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="text-slate-500 hover:text-red-400 p-0.5 ml-1"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* Reset Session */}
          <button
            onClick={onNewSession}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg bg-surface-100 hover:bg-surface-50 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="New Prompt Session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
