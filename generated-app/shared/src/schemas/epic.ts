import { z } from 'zod';

export const EpicStatusEnum = z.enum(['not_started', 'in_progress', 'done']);

export const EpicSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: EpicStatusEnum,
  color: z.string(),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateEpicInputSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  color: z.string().optional(),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
});

export const UpdateEpicInputSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: EpicStatusEnum.optional(),
  color: z.string().optional(),
  startDate: z.string().datetime().nullable().optional(),
  targetDate: z.string().datetime().nullable().optional(),
});

export type Epic = z.infer<typeof EpicSchema>;
export type EpicStatus = z.infer<typeof EpicStatusEnum>;
export type CreateEpicInput = z.infer<typeof CreateEpicInputSchema>;
export type UpdateEpicInput = z.infer<typeof UpdateEpicInputSchema>;
