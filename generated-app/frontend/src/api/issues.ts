import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { isApiConfigured } from './client';
import { localStore } from './localStore';
import type { Issue, CreateIssueInput, UpdateIssueInput, MoveIssueInput, Comment, CreateCommentInput } from '@canopy/shared';

async function fetchIssues(projectId: string, filters?: Record<string, string>): Promise<{ issues: Issue[]; total: number }> {
  if (!isApiConfigured) return localStore.getIssues(projectId);
  try {
    const params = new URLSearchParams(filters || {});
    const query = params.toString() ? `?${params}` : '';
    return await api.get<{ issues: Issue[]; total: number }>(`/api/projects/${projectId}/issues${query}`);
  } catch {
    return localStore.getIssues(projectId);
  }
}

async function fetchIssue(projectId: string, issueId: string): Promise<{ issue: Issue; comments: Comment[] }> {
  if (!isApiConfigured) return localStore.getIssue(projectId, issueId);
  try {
    return await api.get<{ issue: Issue; comments: Comment[] }>(`/api/projects/${projectId}/issues/${issueId}`);
  } catch {
    return localStore.getIssue(projectId, issueId);
  }
}

export function useIssues(projectId: string | undefined, filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['issues', projectId, filters],
    queryFn: () => fetchIssues(projectId!, filters),
    enabled: !!projectId,
  });
}

export function useIssue(projectId: string | undefined, issueId: string | undefined) {
  return useQuery({
    queryKey: ['issues', projectId, issueId],
    queryFn: () => fetchIssue(projectId!, issueId!),
    enabled: !!projectId && !!issueId,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, ...input }: CreateIssueInput & { projectId: string }) => {
      if (!isApiConfigured) {
        return { issue: localStore.createIssue(projectId, input as any) };
      }
      return api.post<{ issue: Issue }>(`/api/projects/${projectId}/issues`, input);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['issues', vars.projectId] });
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, issueId, ...input }: UpdateIssueInput & { projectId: string; issueId: string }) => {
      if (!isApiConfigured) {
        return { issue: localStore.updateIssue(projectId, issueId, input as any) };
      }
      return api.put<{ issue: Issue }>(`/api/projects/${projectId}/issues/${issueId}`, input);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['issues', vars.projectId] });
      queryClient.invalidateQueries({ queryKey: ['issues', vars.projectId, vars.issueId] });
    },
  });
}

export function useMoveIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, issueId, ...input }: MoveIssueInput & { projectId: string; issueId: string }) => {
      if (!isApiConfigured) {
        return { issue: localStore.moveIssue(projectId, issueId, input.status || 'todo') };
      }
      return api.patch<{ issue: Issue }>(`/api/projects/${projectId}/issues/${issueId}/move`, input);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['issues', vars.projectId] });
    },
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, issueId }: { projectId: string; issueId: string }) => {
      if (!isApiConfigured) {
        localStore.deleteIssue(projectId, issueId);
        return {};
      }
      return api.delete(`/api/projects/${projectId}/issues/${issueId}`);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['issues', vars.projectId] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, issueId, ...input }: CreateCommentInput & { projectId: string; issueId: string }) => {
      if (!isApiConfigured) {
        return { comment: localStore.addComment(issueId, input as any, projectId) };
      }
      return api.post<{ comment: Comment }>(`/api/projects/${projectId}/issues/${issueId}/comments`, input);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['issues', vars.projectId, vars.issueId] });
    },
  });
}
