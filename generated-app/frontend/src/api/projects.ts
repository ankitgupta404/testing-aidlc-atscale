import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { isApiConfigured } from './client';
import { localStore } from './localStore';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@canopy/shared';

async function fetchProjects(): Promise<Project[]> {
  if (!isApiConfigured) return localStore.getProjects();
  try {
    const res = await api.get<{ projects: Project[] }>('/api/projects');
    return res.projects;
  } catch {
    return localStore.getProjects();
  }
}

async function fetchProject(projectId: string): Promise<Project> {
  if (!isApiConfigured) {
    const project = localStore.getProject(projectId);
    if (!project) throw new Error('Project not found');
    return project;
  }
  try {
    const res = await api.get<{ project: Project }>(`/api/projects/${projectId}`);
    return res.project;
  } catch {
    const project = localStore.getProject(projectId);
    if (!project) throw new Error('Project not found');
    return project;
  }
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      if (!isApiConfigured) {
        return { project: localStore.createProject(input as any) };
      }
      return api.post<{ project: Project }>('/api/projects', input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateProjectInput & { id: string }) => {
      if (!isApiConfigured) {
        // localStore doesn't have update, but we could add it
        return { project: localStore.getProject(id)! };
      }
      return api.put<{ project: Project }>(`/api/projects/${id}`, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isApiConfigured) {
        localStore.deleteProject(id);
        return {};
      }
      return api.delete(`/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
