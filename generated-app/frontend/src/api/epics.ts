import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';
import { mockEpics } from './mockData';
import type { Epic, CreateEpicInput, UpdateEpicInput } from '@canopy/shared';

async function fetchEpics(projectId: string): Promise<Epic[]> {
  try {
    const res = await api.get<{ epics: Epic[] }>(`/api/projects/${projectId}/epics`);
    return res.epics;
  } catch {
    return mockEpics[projectId] || [];
  }
}

export function useEpics(projectId: string | undefined) {
  return useQuery({
    queryKey: ['epics', projectId],
    queryFn: () => fetchEpics(projectId!),
    enabled: !!projectId,
  });
}

export function useCreateEpic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...input }: CreateEpicInput & { projectId: string }) =>
      api.post<{ epic: Epic }>(`/api/projects/${projectId}/epics`, input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['epics', vars.projectId] });
    },
  });
}

export function useUpdateEpic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, epicId, ...input }: UpdateEpicInput & { projectId: string; epicId: string }) =>
      api.put<{ epic: Epic }>(`/api/projects/${projectId}/epics/${epicId}`, input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['epics', vars.projectId] });
    },
  });
}

export function useDeleteEpic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, epicId }: { projectId: string; epicId: string }) =>
      api.delete(`/api/projects/${projectId}/epics/${epicId}`),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['epics', vars.projectId] });
    },
  });
}
