import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { ApiResponse } from '@canopy/shared';

export function useSeedData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<ApiResponse<{ message: string; itemCount: number }>>('/api/seed', {}),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
