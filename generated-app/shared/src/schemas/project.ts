import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  key: z.string().min(2).max(10).regex(/^[A-Z]+$/),
  description: z.string().max(2000).optional(),
  lead: z.string().min(1),
  avatarColor: z.string().optional(),
  issueCounter: z.number().int().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateProjectInputSchema = z.object({
  name: z.string().min(1).max(100),
  key: z.string().min(2).max(10).regex(/^[A-Z]+$/),
  description: z.string().max(2000).optional(),
  lead: z.string().min(1),
  avatarColor: z.string().optional(),
});

export const UpdateProjectInputSchema = CreateProjectInputSchema.partial();

export type Project = z.infer<typeof ProjectSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;
