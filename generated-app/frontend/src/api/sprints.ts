import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { isApiConfigured } from './client';
import { localStore } from './localStore';
import type { Sprint, CreateSprintInput, UpdateSprintInput } from '@canopy/shared';

async function fetchSprints(projectId: string): Promise<Sprint[]> {
  if (!isApiConfigured) return localStore.getSprints(projectId);
  try {
    const res = await api.get<{ sprints: Sprint[] }>(`/api/projects/${projectId}/sprints`);
    return res.sprints;
  } catch {
    return localStore.getSprints(projectId);
  }
}

export function useSprints(projectId: string | undefined) {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => fetchSprints(projectId!),
    enabled: !!projectId,
  });
}

export function useCreateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, ...input }: CreateSprintInput & { projectId: string }) => {
      if (!isApiConfigured) {
        return { sprint: localStore.createSprint(projectId, input as any) };
      }
      return api.post<{ sprint: Sprint }>(`/api/projects/${projectId}/sprints`, input);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['sprints', vars.projectId] });
    },
  });
}

export function useUpdateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, sprintId, ...input }: UpdateSprintInput & { projectId: string; sprintId: string }) =>
      api.put<{ sprint: Sprint }>(`/api/projects/${projectId}/sprints/${sprintId}`, input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['sprints', vars.projectId] });
    },
  });
}

export function useStartSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, sprintId }: { projectId: string; sprintId: string }) =>
      api.post<{ sprint: Sprint }>(`/api/projects/${projectId}/sprints/${sprintId}/start`),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['sprints', vars.projectId] });
    },
  });
}

export function useCompleteSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, sprintId }: { projectId: string; sprintId: string }) =>
      api.post<{ sprint: Sprint }>(`/api/projects/${projectId}/sprints/${sprintId}/complete`),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['sprints', vars.projectId] });
      queryClient.invalidateQueries({ queryKey: ['issues', vars.projectId] });
    },
  });
}

export function useDeleteSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, sprintId }: { projectId: string; sprintId: string }) =>
      api.delete(`/api/projects/${projectId}/sprints/${sprintId}`),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['sprints', vars.projectId] });
    },
  });
}
