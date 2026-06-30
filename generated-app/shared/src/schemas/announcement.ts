import { z } from 'zod';

export const AnnouncementSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  priority: z.enum(['info', 'warning', 'critical']),
  authorId: z.string().uuid(),
  pinned: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateAnnouncementSchema = AnnouncementSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateAnnouncementSchema = CreateAnnouncementSchema.partial();
