import React, { useState } from 'react';
import {
  X,
  FolderKanban,
  Plus,
  Trash2,
  Archive,
  Check,
  FileText,
  Target,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Project, ProjectService } from '@/modules/projects';

interface ProjectWorkspaceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject: Project;
  onSelectProject: (project: Project) => void;
  onProjectsChange?: () => void;
}

export const ProjectWorkspaceDrawer: React.FC<ProjectWorkspaceDrawerProps> = ({
  isOpen,
  onClose,
  activeProject,
  onSelectProject,
  onProjectsChange,
}) => {
  const [projects, setProjects] = useState<Project[]>(() => ProjectService.getProjects());
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newObjective, setNewObjective] = useState('');

  if (!isOpen) return null;

  const refreshProjects = () => {
    const list = ProjectService.getProjects();
    setProjects(list);
    if (onProjectsChange) onProjectsChange();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = ProjectService.createProject({
      userId: activeProject.userId,
      title: newTitle,
      description: newDesc,
      objectives: newObjective.trim() ? [newObjective.trim()] : undefined,
    });

    setNewTitle('');
    setNewDesc('');
    setNewObjective('');
    setIsCreating(false);
    refreshProjects();
    onSelectProject(created);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this project and all isolated session memory?')) {
      ProjectService.deleteProject(id);
      refreshProjects();
      const remaining = ProjectService.getProjects();
      if (remaining.length > 0) {
        onSelectProject(remaining[0]);
      }
    }
  };

  const handleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    ProjectService.archiveProject(id);
    refreshProjects();
    const remaining = ProjectService.getProjects();
    if (remaining.length > 0) {
      onSelectProject(remaining[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#090c13] border-l border-surface-100 flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-surface-100 flex items-center justify-between bg-surface-300/80">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Project Workspace Management</h3>
              <p className="text-[11px] text-slate-400">Isolated project memory & objectives</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          {/* Active Project Highlight Card */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                Active Project
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Created {new Date(activeProject.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white">{activeProject.title}</h4>
            {activeProject.description && (
              <p className="text-xs text-slate-400 leading-relaxed">{activeProject.description}</p>
            )}

            {/* Objectives */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" /> Project Objectives:
              </span>
              <ul className="space-y-1 pl-4 text-xs text-slate-400 list-disc">
                {activeProject.objectives?.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Create New Project Form */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="p-4 rounded-xl bg-surface-200 border border-slate-800 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-bold text-white">Create Isolated Project</span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Project Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Fintech Risk Assessment Agent"
                  className="w-full text-xs bg-surface-300 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Briefly describe the domain, scope, or goal..."
                  className="w-full text-xs bg-surface-300 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Primary Objective</label>
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="e.g. Zero-hallucination compliance audits"
                  className="w-full text-xs bg-surface-300 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Create Project Scope
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors bg-surface-300/40"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project Scope</span>
            </button>
          )}

          {/* Project List */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
              All Projects ({projects.length})
            </span>

            <div className="space-y-2">
              {projects.map((proj) => {
                const isCurrent = proj.id === activeProject.id;
                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                      isCurrent
                        ? 'bg-cyan-950/30 border-cyan-500 text-white shadow-sm'
                        : 'bg-surface-200 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-surface-100'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate">{proj.title}</span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {proj.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {proj.id !== 'proj-default' && (
                        <>
                          <button
                            title="Archive Project"
                            onClick={(e) => handleArchive(proj.id, e)}
                            className="p-1.5 rounded hover:bg-surface-50 text-slate-400 hover:text-amber-400"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Project"
                            onClick={(e) => handleDelete(proj.id, e)}
                            className="p-1.5 rounded hover:bg-surface-50 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
