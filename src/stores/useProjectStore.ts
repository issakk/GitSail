import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, RepoStatus, Branch, Commit } from '@/types';

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  repoStatus: Record<string, RepoStatus>;
  branches: Record<string, Branch[]>;
  commits: Record<string, Commit[]>;

  // Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  removeProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  setRepoStatus: (projectId: string, status: RepoStatus) => void;
  setBranches: (projectId: string, branches: Branch[]) => void;
  setCommits: (projectId: string, commits: Commit[]) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [],
      activeProjectId: null,
      repoStatus: {},
      branches: {},
      commits: {},

      addProject: (project) => {
        const newProject: Project = {
          ...project,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        set((state) => ({
          projects: [...state.projects, newProject],
        }));
      },

      removeProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        }));
      },

      setActiveProject: (id) => {
        set((state) => {
          if (id) {
            const project = state.projects.find((p) => p.id === id);
            if (project) {
              return {
                activeProjectId: id,
                projects: state.projects.map((p) =>
                  p.id === id ? { ...p, lastOpenedAt: Date.now() } : p
                ),
              };
            }
          }
          return { activeProjectId: id };
        });
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      setRepoStatus: (projectId, status) => {
        set((state) => ({
          repoStatus: { ...state.repoStatus, [projectId]: status },
        }));
      },

      setBranches: (projectId, branches) => {
        set((state) => ({
          branches: { ...state.branches, [projectId]: branches },
        }));
      },

      setCommits: (projectId, commits) => {
        set((state) => ({
          commits: { ...state.commits, [projectId]: commits },
        }));
      },
    }),
    {
      name: 'gitsail-projects',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);
