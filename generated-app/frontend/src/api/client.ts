import type {
  Announcement,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  ListAnnouncementsResponse,
} from '@aws-news-hub/shared';

const API_URL = import.meta.env.VITE_API_URL || '';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error('API URL not configured');
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
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  listAnnouncements: (params?: {
    service?: string;
    search?: string;
    limit?: number;
    nextToken?: string;
  }): Promise<ListAnnouncementsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.service) searchParams.set('service', params.service);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.nextToken) searchParams.set('nextToken', params.nextToken);
    const query = searchParams.toString();
    return fetchApi<ListAnnouncementsResponse>(`/announcements${query ? `?${query}` : ''}`);
  },

  getAnnouncement: (id: string): Promise<Announcement> =>
    fetchApi<Announcement>(`/announcements/${id}`),

  createAnnouncement: (data: CreateAnnouncementInput): Promise<Announcement> =>
    fetchApi<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAnnouncement: (id: string, data: UpdateAnnouncementInput): Promise<Announcement> =>
    fetchApi<Announcement>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAnnouncement: (id: string): Promise<void> =>
    fetchApi<void>(`/announcements/${id}`, { method: 'DELETE' }),
};
