import { z } from 'zod';

export const DashboardStatsSchema = z.object({
  totalIssues: z.number(),
  openIssues: z.number(),
  completedIssues: z.number(),
  inProgressIssues: z.number(),
  totalStoryPoints: z.number(),
  completedStoryPoints: z.number(),
  issuesByType: z.record(z.string(), z.number()),
  issuesByPriority: z.record(z.string(), z.number()),
  recentActivity: z.array(z.object({
    id: z.string(),
    type: z.enum(['created', 'updated', 'completed', 'commented']),
    issueKey: z.string(),
    issueTitle: z.string(),
    actor: z.string(),
    timestamp: z.string().datetime(),
  })),
});

export const BurndownDataPointSchema = z.object({
  date: z.string(),
  ideal: z.number(),
  actual: z.number(),
});

export const VelocityDataPointSchema = z.object({
  sprintName: z.string(),
  committed: z.number(),
  completed: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type BurndownDataPoint = z.infer<typeof BurndownDataPointSchema>;
export type VelocityDataPoint = z.infer<typeof VelocityDataPointSchema>;
