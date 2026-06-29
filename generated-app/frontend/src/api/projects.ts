import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';
import { mockProjects } from './mockData';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@canopy/shared';

async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await api.get<{ projects: Project[] }>('/api/projects');
    return res.projects;
  } catch {
    return mockProjects;
  }
}

async function fetchProject(projectId: string): Promise<Project> {
  try {
    const res = await api.get<{ project: Project }>(`/api/projects/${projectId}`);
    return res.project;
  } catch {
    const project = mockProjects.find(p => p.id === projectId);
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
    mutationFn: (input: CreateProjectInput) =>
      api.post<{ project: Project }>('/api/projects', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateProjectInput & { id: string }) =>
      api.put<{ project: Project }>(`/api/projects/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
