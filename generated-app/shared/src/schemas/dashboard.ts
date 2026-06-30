import { z } from 'zod';

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

export const DashboardDataSchema = z.object({
  statusDistribution: z.record(z.string(), z.number()),
  priorityDistribution: z.record(z.string(), z.number()),
  burndown: z.array(BurndownDataPointSchema),
  velocity: z.array(VelocityDataPointSchema),
  totalIssues: z.number(),
  completedIssues: z.number(),
  activeSprint: z.object({
    id: z.string().uuid(),
    name: z.string(),
    progress: z.number(),
    daysRemaining: z.number(),
  }).nullable(),
  recentActivity: z.array(z.object({
    id: z.string(),
    type: z.enum(['issue_created', 'issue_updated', 'issue_moved', 'comment_added', 'sprint_started', 'sprint_completed']),
    description: z.string(),
    timestamp: z.string().datetime(),
    userId: z.string().uuid(),
  })),
});
