import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Announcement, CreateAnnouncement, UpdateAnnouncement } from '@canopy/shared';

interface AnnouncementsResponse {
  announcements: Announcement[];
}

/**
 * Normalize announcement from API response.
 * The deployed Lambda uses `type` and `author` fields while the schema uses `priority` and `authorId`.
 */
function normalizeAnnouncement(raw: any): Announcement {
  return {
    ...raw,
    priority: raw.priority || raw.type || 'info',
    authorId: raw.authorId || raw.author || '',
  };
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const data = await api.get<AnnouncementsResponse | { success: boolean; data: { items: Announcement[] } }>('/api/announcements');
      let items: any[];
      if ('announcements' in data) items = data.announcements;
      else if ('data' in data && data.data && 'items' in data.data) items = data.data.items;
      else items = [];
      return items.map(normalizeAnnouncement);
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncement) => {
      // Send both new-style and legacy fields for deployed Lambda compatibility
      const payload = {
        ...data,
        type: data.priority, // Legacy field name
        author: data.authorId, // Legacy field name
      };
      return api.post<unknown>('/api/announcements', payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncement }) => {
      const payload = {
        ...data,
        ...(data.priority ? { type: data.priority } : {}),
        ...(data.authorId ? { author: data.authorId } : {}),
      };
      return api.put<unknown>(`/api/announcements/${id}`, payload);
    },
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
