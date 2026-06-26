import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import type {
  Announcement,
  AnnouncementListResponse,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  ServicesResponse,
} from "@aws-news-hub/shared";

const API_URL = import.meta.env.VITE_API_URL || "";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
  }
  return res.json();
}

// Hooks
export function useAnnouncements(filters: {
  service?: string;
  search?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters.service) params.set("service", filters.service);
  if (filters.search) params.set("search", filters.search);
  if (filters.limit) params.set("limit", String(filters.limit));

  return useInfiniteQuery<AnnouncementListResponse>({
    queryKey: ["announcements", filters],
    queryFn: async ({ pageParam }) => {
      const p = new URLSearchParams(params);
      if (pageParam) p.set("nextToken", pageParam as string);
      return fetchApi<AnnouncementListResponse>(`/announcements?${p.toString()}`);
    },
    getNextPageParam: (lastPage) => lastPage.nextToken ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useAnnouncement(id: string) {
  return useQuery<Announcement>({
    queryKey: ["announcement", id],
    queryFn: () => fetchApi<Announcement>(`/announcements/${id}`),
    enabled: !!id,
  });
}

export function useServices() {
  return useQuery<ServicesResponse>({
    queryKey: ["services"],
    queryFn: () => fetchApi<ServicesResponse>("/services"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAnnouncementInput) =>
      fetchApi<Announcement>("/announcements", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateAnnouncementInput & { id: string }) =>
      fetchApi<Announcement>(`/announcements/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.setQueryData(["announcement", data.id], data);
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<{ deleted: true }>(`/announcements/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}
