import type { Announcement, CreateAnnouncementInput, UpdateAnnouncementInput, ListAnnouncementsResponse } from '@aws-news-hub/shared';

const API_URL = import.meta.env.VITE_API_URL || '';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error('API URL not configured. Set VITE_API_URL environment variable.');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  listAnnouncements: (params?: { service?: string; search?: string; limit?: number; nextToken?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.service) searchParams.set('service', params.service);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.nextToken) searchParams.set('nextToken', params.nextToken);
    const query = searchParams.toString();
    return fetchApi<ListAnnouncementsResponse>(`/announcements${query ? `?${query}` : ''}`);
  },

  getAnnouncement: (id: string) => fetchApi<Announcement>(`/announcements/${id}`),

  createAnnouncement: (data: CreateAnnouncementInput) =>
    fetchApi<Announcement>('/announcements', { method: 'POST', body: JSON.stringify(data) }),

  updateAnnouncement: (id: string, data: UpdateAnnouncementInput) =>
    fetchApi<Announcement>(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteAnnouncement: (id: string) =>
    fetchApi<void>(`/announcements/${id}`, { method: 'DELETE' }),
};
