import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  key: z.string().min(2).max(10).regex(/^[A-Z]+$/),
  description: z.string().max(2000).optional(),
  leadUserId: z.string().uuid().optional(),
  status: z.enum(['active', 'archived', 'completed']),
  issueCounter: z.number().int().min(0).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  issueCounter: true,
});

export const UpdateProjectSchema = CreateProjectSchema.partial();
