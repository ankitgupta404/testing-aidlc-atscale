import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Issue, CreateIssue, UpdateIssue, MoveIssue } from '@canopy/shared';

interface IssuesResponse {
  issues: Issue[];
}

export function useIssues(projectId: string | undefined, params?: Record<string, string>) {
  const queryParams = params ? '?' + new URLSearchParams(params).toString() : '';
  return useQuery({
    queryKey: ['issues', projectId, params],
    queryFn: async () => {
      const data = await api.get<IssuesResponse | { success: boolean; data: { items: Issue[] } }>(`/api/projects/${projectId}/issues${queryParams}`);
      if ('issues' in data) return data.issues;
      if ('data' in data && data.data && 'items' in data.data) return data.data.items;
      return [];
    },
    enabled: !!projectId,
  });
}

export function useIssue(id: string | undefined) {
  return useQuery({
    queryKey: ['issues', 'detail', id],
    queryFn: async () => {
      const data = await api.get<{ issue?: Issue; data?: Issue }>(`/api/issues/${id}`);
      return data.issue || data.data || null;
    },
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<CreateIssue> }) => {
      // Send both reporterId and reporter for compatibility with deployed Lambda
      const payload = {
        ...data,
        reporter: data.reporterId || (data as any).reporter,
      };
      return api.post<unknown>(`/api/projects/${projectId}/issues`, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues'] }),
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIssue }) =>
      api.put<unknown>(`/api/issues/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues', 'detail', id] });
    },
  });
}

export function useMoveIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveIssue }) =>
      api.put<unknown>(`/api/issues/${id}/move`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues'] }),
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<unknown>(`/api/issues/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues'] }),
  });
}
