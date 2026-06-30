import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Comment, CreateComment, UpdateComment, ApiResponse, PaginatedResponse } from '@canopy/shared';

export function useComments(issueId: string | undefined) {
  return useQuery({
    queryKey: ['comments', issueId],
    queryFn: () => api.get<PaginatedResponse<Comment>>(`/api/issues/${issueId}/comments`),
    enabled: !!issueId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, data }: { issueId: string; data: Omit<CreateComment, 'issueId'> }) =>
      api.post<ApiResponse<Comment>>(`/api/issues/${issueId}/comments`, data),
    onSuccess: (_, { issueId }) => queryClient.invalidateQueries({ queryKey: ['comments', issueId] }),
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateComment }) =>
      api.put<ApiResponse<Comment>>(`/api/comments/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments'] }),
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<ApiResponse<null>>(`/api/comments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments'] }),
  });
}
