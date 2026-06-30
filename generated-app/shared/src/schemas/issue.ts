import { z } from 'zod';

export const IssuePrioritySchema = z.enum(['critical', 'high', 'medium', 'low', 'trivial']);
export const IssueTypeSchema = z.enum(['story', 'bug', 'task', 'subtask', 'epic']);
export const IssueStatusSchema = z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']);

export const IssueSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  key: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  type: IssueTypeSchema,
  status: IssueStatusSchema,
  priority: IssuePrioritySchema,
  assigneeId: z.string().uuid().optional(),
  reporterId: z.string().uuid(),
  epicId: z.string().uuid().optional(),
  sprintId: z.string().uuid().optional(),
  storyPoints: z.number().int().min(0).max(100).optional(),
  labels: z.array(z.string()).default([]),
  order: z.number().int(),
  parentIssueId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateIssueSchema = IssueSchema.omit({
  id: true,
  key: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateIssueSchema = CreateIssueSchema.partial();

export const MoveIssueSchema = z.object({
  status: IssueStatusSchema.optional(),
  sprintId: z.string().uuid().nullable().optional(),
  order: z.number().int(),
});

export const IssueFilterSchema = z.object({
  status: z.array(IssueStatusSchema).optional(),
  priority: z.array(IssuePrioritySchema).optional(),
  type: z.array(IssueTypeSchema).optional(),
  assigneeId: z.string().uuid().optional(),
  sprintId: z.string().uuid().nullable().optional(),
  epicId: z.string().uuid().optional(),
  labels: z.array(z.string()).optional(),
  q: z.string().optional(),
});
