import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Comment, CreateComment, UpdateComment } from '@canopy/shared';

interface CommentsResponse {
  comments?: Comment[];
  success?: boolean;
  data?: { items: Comment[] };
}

export function useComments(issueId: string | undefined) {
  return useQuery({
    queryKey: ['comments', issueId],
    queryFn: async () => {
      try {
        const data = await api.get<CommentsResponse>(`/api/issues/${issueId}/comments`);
        if ('comments' in data && Array.isArray(data.comments)) return data.comments;
        if ('data' in data && data.data && 'items' in data.data) return data.data.items;
        if (Array.isArray(data)) return data;
        return [];
      } catch {
        // Comments endpoint may not exist yet - return empty array gracefully
        return [];
      }
    },
    enabled: !!issueId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, data }: { issueId: string; data: { authorId: string; body: string } }) =>
      api.post<unknown>(`/api/issues/${issueId}/comments`, data),
    onSuccess: (_, { issueId }) => queryClient.invalidateQueries({ queryKey: ['comments', issueId] }),
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateComment }) =>
      api.put<unknown>(`/api/comments/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments'] }),
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<unknown>(`/api/comments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments'] }),
  });
}
