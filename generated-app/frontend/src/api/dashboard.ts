import { useQuery } from '@tanstack/react-query';
import api from './client';
import { getMockDashboardStats } from './mockData';
import type { DashboardStats, BurndownDataPoint, VelocityDataPoint } from '@canopy/shared';

async function fetchDashboard(projectId: string): Promise<DashboardStats> {
  try {
    const res = await api.get<{ stats: DashboardStats }>(`/api/projects/${projectId}/dashboard`);
    return res.stats;
  } catch {
    return getMockDashboardStats(projectId);
  }
}

async function fetchBurndown(projectId: string, sprintId?: string): Promise<BurndownDataPoint[]> {
  try {
    const query = sprintId ? `?sprintId=${sprintId}` : '';
    const res = await api.get<{ data: BurndownDataPoint[] }>(`/api/projects/${projectId}/burndown${query}`);
    return res.data;
  } catch {
    // Generate mock burndown
    const data: BurndownDataPoint[] = [];
    const total = 44;
    for (let day = 0; day <= 13; day++) {
      const date = new Date();
      date.setDate(date.getDate() - 13 + day);
      data.push({
        date: date.toISOString().split('T')[0],
        ideal: Math.round((total - (total / 13) * day) * 10) / 10,
        actual: Math.max(0, total - Math.floor(day * (total / 14) * (0.7 + Math.random() * 0.6))),
      });
    }
    return data;
  }
}

async function fetchVelocity(projectId: string): Promise<VelocityDataPoint[]> {
  try {
    const res = await api.get<{ data: VelocityDataPoint[] }>(`/api/projects/${projectId}/velocity`);
    return res.data;
  } catch {
    return [
      { sprintName: 'Sprint 1', committed: 31, completed: 28 },
      { sprintName: 'Sprint 2', committed: 44, completed: 18 },
    ];
  }
}

export function useDashboard(projectId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard', projectId],
    queryFn: () => fetchDashboard(projectId!),
    enabled: !!projectId,
  });
}

export function useBurndown(projectId: string | undefined, sprintId?: string) {
  return useQuery({
    queryKey: ['burndown', projectId, sprintId],
    queryFn: () => fetchBurndown(projectId!, sprintId),
    enabled: !!projectId,
  });
}

export function useVelocity(projectId: string | undefined) {
  return useQuery({
    queryKey: ['velocity', projectId],
    queryFn: () => fetchVelocity(projectId!),
    enabled: !!projectId,
  });
}
