import { z } from 'zod';

export const BoardColumnSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  status: z.string(),
  order: z.number().int(),
  wipLimit: z.number().int().min(0).optional(),
});

export const BoardSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(100),
  columns: z.array(BoardColumnSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
