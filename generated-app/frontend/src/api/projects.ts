import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Project, CreateProject, UpdateProject } from '@canopy/shared';

// The existing API returns { projects: [...] } format
interface ProjectsResponse {
  projects: Project[];
}

interface ProjectResponse {
  project?: Project;
  success?: boolean;
  data?: Project;
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const data = await api.get<ProjectsResponse | { success: boolean; data: { items: Project[] } }>('/api/projects');
      // Handle both response formats
      if ('projects' in data) return data.projects;
      if ('data' in data && data.data && 'items' in data.data) return data.data.items;
      return [];
    },
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async (): Promise<Project> => {
      const data = await api.get<ProjectResponse>(`/api/projects/${id}`);
      return (data.project || data.data || data) as Project;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProject) => api.post<unknown>('/api/projects', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProject }) =>
      api.put<unknown>(`/api/projects/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<unknown>(`/api/projects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}
