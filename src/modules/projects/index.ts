export interface ProjectReference {
  id: string;
  name: string;
  type: 'document' | 'url' | 'api_spec' | 'notes';
  content: string;
  createdAt: string;
}

export interface ProjectRequirementItem {
  id: string;
  key: string;
  description: string;
  priority: 'must' | 'should' | 'could';
  isConfirmed: boolean;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  objectives: string[];
  requirements: ProjectRequirementItem[];
  references: ProjectReference[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

const LOCAL_STORAGE_PROJECTS_KEY = 'big_prompter_projects_store';

export class ProjectService {
  private static getStore(): Project[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
    if (!raw) {
      // Default starter project
      const initial: Project = {
        id: 'proj-default',
        userId: 'default-user',
        title: 'Core AI Engineering Workspace',
        description: 'Primary isolated scope for enterprise prompt architectures and evaluation.',
        objectives: [
          'Design deterministic prompt contracts',
          'Enforce prompt injection boundaries',
          'Benchmark multi-model outputs'
        ],
        requirements: [
          { id: 'req-1', key: 'Output Contract', description: 'Strict semantic Markdown with XML section tags', priority: 'must', isConfirmed: true },
          { id: 'req-2', key: 'Security', description: 'Isolate user runtime payload in untrusted boundary tags', priority: 'must', isConfirmed: true },
        ],
        references: [
          { id: 'ref-1', name: 'Prompt Architecture Guidelines', type: 'notes', content: 'Follow L1 to L4 hierarchy standards.', createdAt: new Date().toISOString() }
        ],
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify([initial]));
      return [initial];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private static setStore(projects: Project[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  }

  static getProjects(userId?: string): Project[] {
    const list = this.getStore();
    if (!userId) return list.filter(p => !p.isArchived);
    return list.filter(p => (!userId || p.userId === userId || p.userId === 'default-user') && !p.isArchived);
  }

  static getProjectById(id: string): Project | null {
    const list = this.getStore();
    return list.find(p => p.id === id) || null;
  }

  static createProject(params: {
    userId: string;
    title: string;
    description?: string;
    objectives?: string[];
  }): Project {
    const list = this.getStore();
    const newProj: Project = {
      id: 'proj-' + Date.now(),
      userId: params.userId,
      title: params.title.trim(),
      description: params.description?.trim(),
      objectives: params.objectives || ['Establish production-grade prompt specifications'],
      requirements: [],
      references: [],
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(newProj);
    this.setStore(list);
    return newProj;
  }

  static updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Project {
    const list = this.getStore();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Project with ID ${id} not found.`);

    const updated: Project = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.setStore(list);
    return updated;
  }

  static archiveProject(id: string): boolean {
    const list = this.getStore();
    const target = list.find(p => p.id === id);
    if (!target) return false;
    target.isArchived = true;
    target.updatedAt = new Date().toISOString();
    this.setStore(list);
    return true;
  }

  static deleteProject(id: string): boolean {
    const list = this.getStore();
    const filtered = list.filter(p => p.id !== id);
    if (filtered.length === list.length) return false;
    this.setStore(filtered);
    return true;
  }

  static addReference(projectId: string, ref: Omit<ProjectReference, 'id' | 'createdAt'>): ProjectReference {
    const project = this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const newRef: ProjectReference = {
      id: 'ref-' + Date.now(),
      ...ref,
      createdAt: new Date().toISOString(),
    };

    project.references = project.references || [];
    project.references.push(newRef);
    this.updateProject(projectId, { references: project.references });
    return newRef;
  }
}
