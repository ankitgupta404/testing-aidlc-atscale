import { z } from 'zod';

export const IssueTypeEnum = z.enum(['story', 'bug', 'task', 'subtask']);
export const IssuePriorityEnum = z.enum(['critical', 'high', 'medium', 'low']);
export const IssueStatusEnum = z.enum(['todo', 'in_progress', 'in_review', 'done', 'cancelled']);

export const IssueSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  key: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  type: IssueTypeEnum,
  status: IssueStatusEnum,
  priority: IssuePriorityEnum,
  assignee: z.string().optional(),
  reporter: z.string(),
  epicId: z.string().uuid().optional(),
  sprintId: z.string().uuid().optional(),
  storyPoints: z.number().int().min(0).max(100).optional(),
  labels: z.array(z.string()).default([]),
  order: z.number().int().default(0),
  parentId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateIssueInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  type: IssueTypeEnum,
  priority: IssuePriorityEnum,
  assignee: z.string().optional(),
  reporter: z.string(),
  epicId: z.string().uuid().optional(),
  sprintId: z.string().uuid().optional(),
  storyPoints: z.number().int().min(0).max(100).optional(),
  labels: z.array(z.string()).optional(),
  parentId: z.string().uuid().optional(),
});

export const UpdateIssueInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(10000).optional(),
  type: IssueTypeEnum.optional(),
  status: IssueStatusEnum.optional(),
  priority: IssuePriorityEnum.optional(),
  assignee: z.string().nullable().optional(),
  epicId: z.string().uuid().nullable().optional(),
  sprintId: z.string().uuid().nullable().optional(),
  storyPoints: z.number().int().min(0).max(100).nullable().optional(),
  labels: z.array(z.string()).optional(),
  order: z.number().int().optional(),
});

export const MoveIssueInputSchema = z.object({
  status: IssueStatusEnum.optional(),
  sprintId: z.string().uuid().nullable().optional(),
  order: z.number().int().optional(),
});

export type Issue = z.infer<typeof IssueSchema>;
export type IssueType = z.infer<typeof IssueTypeEnum>;
export type IssuePriority = z.infer<typeof IssuePriorityEnum>;
export type IssueStatus = z.infer<typeof IssueStatusEnum>;
export type CreateIssueInput = z.infer<typeof CreateIssueInputSchema>;
export type UpdateIssueInput = z.infer<typeof UpdateIssueInputSchema>;
export type MoveIssueInput = z.infer<typeof MoveIssueInputSchema>;
