import { z } from 'zod';

export const SprintStatusEnum = z.enum(['planning', 'active', 'completed']);

export const SprintSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(100),
  goal: z.string().max(500).optional(),
  status: SprintStatusEnum,
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateSprintInputSchema = z.object({
  name: z.string().min(1).max(100),
  goal: z.string().max(500).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const UpdateSprintInputSchema = CreateSprintInputSchema.partial();

export type Sprint = z.infer<typeof SprintSchema>;
export type SprintStatus = z.infer<typeof SprintStatusEnum>;
export type CreateSprintInput = z.infer<typeof CreateSprintInputSchema>;
export type UpdateSprintInput = z.infer<typeof UpdateSprintInputSchema>;
