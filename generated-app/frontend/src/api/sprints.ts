import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Sprint, CreateSprint, UpdateSprint } from '@canopy/shared';

interface SprintsResponse {
  sprints: Sprint[];
}

export function useSprints(projectId: string | undefined) {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      const data = await api.get<SprintsResponse | { success: boolean; data: { items: Sprint[] } }>(`/api/projects/${projectId}/sprints`);
      if ('sprints' in data) return data.sprints;
      if ('data' in data && data.data && 'items' in data.data) return data.data.items;
      return [];
    },
    enabled: !!projectId,
  });
}

export function useSprint(id: string | undefined) {
  return useQuery({
    queryKey: ['sprints', 'detail', id],
    queryFn: async () => {
      const data = await api.get<{ sprint?: Sprint; data?: Sprint }>(`/api/sprints/${id}`);
      return data.sprint || data.data || null;
    },
    enabled: !!id,
  });
}

export function useCreateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<CreateSprint> }) =>
      api.post<unknown>(`/api/projects/${projectId}/sprints`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sprints'] }),
  });
}

export function useUpdateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSprint }) =>
      api.put<unknown>(`/api/sprints/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sprints'] }),
  });
}

export function useStartSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put<unknown>(`/api/sprints/${id}/start`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sprints'] }),
  });
}

export function useCompleteSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put<unknown>(`/api/sprints/${id}/complete`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sprints'] }),
  });
}
