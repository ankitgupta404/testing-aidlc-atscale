import { z } from 'zod';

export const EpicStatusSchema = z.enum(['draft', 'in_progress', 'done']);

export const EpicSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: EpicStatusSchema,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateEpicSchema = EpicSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateEpicSchema = CreateEpicSchema.partial();
