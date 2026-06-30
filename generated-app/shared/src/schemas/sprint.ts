import { z } from 'zod';

export const SprintStatusSchema = z.enum(['planning', 'active', 'completed']);

export const SprintSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(100),
  goal: z.string().max(500).optional(),
  status: SprintStatusSchema,
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateSprintSchema = SprintSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateSprintSchema = CreateSprintSchema.partial();
