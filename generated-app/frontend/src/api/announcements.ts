import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Announcement, CreateAnnouncement, UpdateAnnouncement } from '@canopy/shared';

interface AnnouncementsResponse {
  announcements: Announcement[];
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const data = await api.get<AnnouncementsResponse | { success: boolean; data: { items: Announcement[] } }>('/api/announcements');
      if ('announcements' in data) return data.announcements;
      if ('data' in data && data.data && 'items' in data.data) return data.data.items;
      return [];
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncement) => api.post<unknown>('/api/announcements', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncement }) =>
      api.put<unknown>(`/api/announcements/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<unknown>(`/api/announcements/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });
}
