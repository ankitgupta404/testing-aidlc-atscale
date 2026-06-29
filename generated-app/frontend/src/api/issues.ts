import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';
import { mockIssues } from './mockData';
import type { Issue, CreateIssueInput, UpdateIssueInput, MoveIssueInput, Comment, CreateCommentInput } from '@canopy/shared';

async function fetchIssues(projectId: string, filters?: Record<string, string>): Promise<{ issues: Issue[]; total: number }> {
  try {
    const params = new URLSearchParams(filters || {});
    const query = params.toString() ? `?${params}` : '';
    return await api.get<{ issues: Issue[]; total: number }>(`/api/projects/${projectId}/issues${query}`);
  } catch {
    const issues = mockIssues[projectId] || [];
    return { issues, total: issues.length };
  }
}

async function fetchIssue(projectId: string, issueId: string): Promise<{ issue: Issue; comments: Comment[] }> {
  try {
    return await api.get<{ issue: Issue; comments: Comment[] }>(`/api/projects/${projectId}/issues/${issueId}`);
  } catch {
    const issues = mockIssues[projectId] || [];
    const issue = issues.find(i => i.id === issueId);
    if (!issue) throw new Error('Issue not found');
    return { issue, comments: [] };
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
    mutationFn: ({ projectId, ...input }: CreateIssueInput & { projectId: string }) =>
      api.post<{ issue: Issue }>(`/api/projects/${projectId}/issues`, input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['issues', vars.projectId] });
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, issueId, ...input }: UpdateIssueInput & { projectId: string; issueId: string }) =>
      api.put<{ issue: Issue }>(`/api/projects/${projectId}/issues/${issueId}`, input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['issues', vars.projectId] });
    },
  });
}

export function useMoveIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, issueId, ...input }: MoveIssueInput & { projectId: string; issueId: string }) =>
      api.patch<{ issue: Issue }>(`/api/projects/${projectId}/issues/${issueId}/move`, input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['issues', vars.projectId] });
    },
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, issueId }: { projectId: string; issueId: string }) =>
      api.delete(`/api/projects/${projectId}/issues/${issueId}`),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['issues', vars.projectId] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, issueId, ...input }: CreateCommentInput & { projectId: string; issueId: string }) =>
      api.post<{ comment: Comment }>(`/api/projects/${projectId}/issues/${issueId}/comments`, input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['issues', vars.projectId, vars.issueId] });
    },
  });
}
