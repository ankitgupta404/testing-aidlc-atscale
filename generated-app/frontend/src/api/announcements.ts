import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { isApiConfigured } from './client';
import { localStore } from './localStore';
import type { Announcement, CreateAnnouncementInput, UpdateAnnouncementInput } from '@canopy/shared';

async function fetchAnnouncements(): Promise<Announcement[]> {
  if (!isApiConfigured) return localStore.getAnnouncements();
  try {
    const res = await api.get<{ announcements: Announcement[] }>('/api/announcements');
    return res.announcements;
  } catch {
    return localStore.getAnnouncements();
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
    mutationFn: async (input: CreateAnnouncementInput) => {
      if (!isApiConfigured) {
        return { announcement: localStore.createAnnouncement(input as any) };
      }
      return api.post<{ announcement: Announcement }>('/api/announcements', input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateAnnouncementInput & { id: string }) => {
      if (!isApiConfigured) {
        return { announcement: localStore.updateAnnouncement(id, input as any) };
      }
      return api.put<{ announcement: Announcement }>(`/api/announcements/${id}`, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isApiConfigured) {
        localStore.deleteAnnouncement(id);
        return {};
      }
      return api.delete(`/api/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}
