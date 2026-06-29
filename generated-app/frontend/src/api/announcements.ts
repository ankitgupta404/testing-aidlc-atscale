import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';
import { mockAnnouncements } from './mockData';
import type { Announcement, CreateAnnouncementInput, UpdateAnnouncementInput } from '@canopy/shared';

async function fetchAnnouncements(): Promise<Announcement[]> {
  try {
    const res = await api.get<{ announcements: Announcement[] }>('/api/announcements');
    return res.announcements;
  } catch {
    return mockAnnouncements;
  }
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAnnouncementInput) =>
      api.post<{ announcement: Announcement }>('/api/announcements', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateAnnouncementInput & { id: string }) =>
      api.put<{ announcement: Announcement }>(`/api/announcements/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}
