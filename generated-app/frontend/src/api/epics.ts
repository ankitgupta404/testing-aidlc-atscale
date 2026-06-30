import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Epic, CreateEpic, UpdateEpic } from '@canopy/shared';

interface EpicsResponse {
  epics: Epic[];
}

export function useEpics(projectId: string | undefined) {
  return useQuery({
    queryKey: ['epics', projectId],
    queryFn: async () => {
      const data = await api.get<EpicsResponse | { success: boolean; data: { items: Epic[] } }>(`/api/projects/${projectId}/epics`);
      if ('epics' in data) return data.epics;
      if ('data' in data && data.data && 'items' in data.data) return data.data.items;
      return [];
    },
    enabled: !!projectId,
  });
}

export function useCreateEpic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<CreateEpic> }) =>
      api.post<unknown>(`/api/projects/${projectId}/epics`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['epics'] }),
  });
}

export function useUpdateEpic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEpic }) =>
      api.put<unknown>(`/api/epics/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['epics'] }),
  });
}

export function useDeleteEpic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<unknown>(`/api/epics/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['epics'] }),
  });
}
