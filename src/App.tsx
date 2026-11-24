'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  PromptProjectSession,
  EngineeringLevel,
  TargetModel,
  UserMode,
  DiscoveryQuestion,
  PromptVersion,
  StarterTemplate
} from './types';
import {
  detectDomain,
  generateDiscoveryQuestions,
  compileProductionPrompt
} from './services/promptEngine';
import { Header } from './components/Header';
import { ConversationalWorkspace } from './components/ConversationalWorkspace';
import { ArtefactStudio } from './components/ArtefactStudio';
import { SettingsModal } from './components/SettingsModal';
import { TemplateModal } from './components/TemplateModal';
import { AuthModal } from './components/AuthModal';
import { ProjectWorkspaceDrawer } from './components/ProjectWorkspaceDrawer';
import { Project, ProjectService } from '@/modules/projects';
import { AuthUser, AuthService } from '@/modules/auth';

const INITIAL_RAW_PROMPT = 'I want an autonomous code review bot that finds security flaws and suggests clean refactors.';

const DEFAULT_PROJECT: Project = {
  id: 'proj-default',
  userId: 'default-user',
  title: 'Core AI Engineering Workspace',
  description: 'Primary isolated scope for enterprise prompt architectures and evaluation.',
  objectives: [
    'Design deterministic prompt contracts',
    'Enforce prompt injection boundaries',
    'Benchmark multi-model outputs'
  ],
  requirements: [],
  references: [],
  isArchived: false,
  createdAt: '2026-11-24T00:00:00.000Z',
  updatedAt: '2026-11-24T00:00:00.000Z',
};

export const App: React.FC = () => {
  const [userMode, setUserMode] = useState<UserMode>('professional');
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('promptexa_gemini_api_key') || '';
    }
    return '';
  });

  // Auth & Project Management State (Phase 1)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      return AuthService.getStoredUser();
    }
    return null;
  });

  const [activeProject, setActiveProject] = useState<Project>(() => {
    if (typeof window !== 'undefined') {
      const list = ProjectService.getProjects();
      if (list && list.length > 0) return list[0];
    }
    return DEFAULT_PROJECT;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);

  // Core Session State
  const [session, setSession] = useState<PromptProjectSession>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('promptexa_active_session');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }

    return {
      id: 'session-' + Date.now(),
      title: 'Autonomous Code Reviewer',
      rawInput: INITIAL_RAW_PROMPT,
      domain: 'software-engineering',
      level: 'L4',
      targetModel: 'claude-3-7-sonnet',
      userMode: 'professional',
      stage: 'input',
      questions: [],
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('promptexa_active_session', JSON.stringify(session));
  }, [session]);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('promptexa_gemini_api_key', key);
  };

  const handleRawInputChange = (text: string) => {
    setSession(prev => ({ ...prev, rawInput: text }));
  };

  const handleLevelChange = (level: EngineeringLevel) => {
    setSession(prev => ({ ...prev, level }));
  };

  const handleTargetModelChange = (targetModel: TargetModel) => {
    setSession(prev => ({ ...prev, targetModel }));
  };

  // Step 1 -> Step 2: Start Discovery Questionnaire
  const handleStartDiscovery = () => {
    const domain = detectDomain(session.rawInput);
    const questions = generateDiscoveryQuestions(session.rawInput, domain);

    setSession(prev => ({
      ...prev,
      domain,
      stage: 'discovery',
      questions,
      title: session.rawInput.slice(0, 36) + (session.rawInput.length > 36 ? '...' : '')
    }));
  };

  // Select option in Discovery Questionnaire
  const handleSelectOption = (questionId: string, optionId: string) => {
    setSession(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, selectedOptionId: optionId } : q
      )
    }));
  };

  const handleCustomAnswerChange = (questionId: string, text: string) => {
    setSession(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, customAnswer: text } : q
      )
    }));
  };

  // Auto-apply all recommended answers
  const handleApplyAllDefaults = () => {
    setSession(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        const recommended = q.options.find(o => o.isRecommended);
        return {
          ...q,
          selectedOptionId: recommended ? recommended.id : q.options[0]?.id
        };
      })
    }));
  };

  // Step 2 -> Step 3: Compile Production Prompt
  const handleCompilePrompt = () => {
    const { compiledPrompt, components, metrics } = compileProductionPrompt(
      session.rawInput,
      session.domain,
      session.level,
      session.targetModel,
      session.questions
    );

    const versionNum = (session.history.length || 0) + 1;
    const newVersion: PromptVersion = {
      id: 'ver-' + Date.now(),
      versionNumber: versionNum,
      timestamp: new Date().toISOString(),
      level: session.level,
      targetModel: session.targetModel,
      compiledPrompt,
      components,
      metrics,
      changeSummary: `Compiled at ${session.level} for ${session.targetModel.toUpperCase()} via Discovery Questionnaire.`
    };

    // Celebration if L4 compiled!
    if (session.level === 'L4') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#10b981', '#8b5cf6']
      });
    }

    setSession(prev => ({
      ...prev,
      stage: 'compiled',
      currentVersion: newVersion,
      history: [newVersion, ...prev.history]
    }));
  };

  const handleRestoreVersion = (version: PromptVersion) => {
    setSession(prev => ({
      ...prev,
      level: version.level,
      targetModel: version.targetModel,
      currentVersion: version
    }));
  };

  const handleResetToDiscovery = () => {
    setSession(prev => ({ ...prev, stage: 'discovery' }));
  };

  const handleNewSession = () => {
    const emptySession: PromptProjectSession = {
      id: 'session-' + Date.now(),
      title: 'New Prompt',
      rawInput: '',
      domain: 'general-assistant',
      level: 'L3',
      targetModel: 'claude-3-7-sonnet',
      userMode: userMode,
      stage: 'input',
      questions: [],
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSession(emptySession);
  };

  const handleSelectTemplate = (template: StarterTemplate) => {
    const domain = template.category;
    const questions = generateDiscoveryQuestions(template.rawIdea, domain);

    setSession({
      id: 'session-' + Date.now(),
      title: template.title,
      rawInput: template.rawIdea,
      domain,
      level: template.recommendedLevel,
      targetModel: template.recommendedModel,
      userMode: userMode,
      stage: 'discovery',
      questions,
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setAuthUser(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#07090e] text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation */}
      <Header
        userMode={userMode}
        onUserModeChange={setUserMode}
        onOpenTemplates={() => setIsTemplateOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewSession={handleNewSession}
        hasApiKey={Boolean(apiKey)}
        activeProject={activeProject}
        onOpenProjects={() => setIsProjectDrawerOpen(true)}
        authUser={authUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Split Layout: Left Conversational Workspace & Right Artefact Studio */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Conversational Discovery & Refinement */}
        <section className="w-full lg:w-[48%] h-full flex flex-col border-b lg:border-b-0 lg:border-r border-surface-100">
          <ConversationalWorkspace
            session={session}
            onRawInputChange={handleRawInputChange}
            onLevelChange={handleLevelChange}
            onTargetModelChange={handleTargetModelChange}
            onStartDiscovery={handleStartDiscovery}
            onSelectOption={handleSelectOption}
            onCustomAnswerChange={handleCustomAnswerChange}
            onApplyAllDefaults={handleApplyAllDefaults}
            onCompilePrompt={handleCompilePrompt}
            onResetToDiscovery={handleResetToDiscovery}
            userMode={userMode}
          />
        </section>

        {/* Right Pane: Contextual Artefact Studio & Execution Sandbox */}
        <section className="w-full lg:w-[52%] h-full flex flex-col">
          <ArtefactStudio
            session={session}
            onRestoreVersion={handleRestoreVersion}
            apiKey={apiKey}
          />
        </section>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <TemplateModal
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => setAuthUser(user)}
      />

      <ProjectWorkspaceDrawer
        isOpen={isProjectDrawerOpen}
        onClose={() => setIsProjectDrawerOpen(false)}
        activeProject={activeProject}
        onSelectProject={(proj) => setActiveProject(proj)}
        onProjectsChange={() => {
          const list = ProjectService.getProjects();
          if (list.length > 0 && !list.find(p => p.id === activeProject.id)) {
            setActiveProject(list[0]);
          }
        }}
      />
    </div>
  );
};
