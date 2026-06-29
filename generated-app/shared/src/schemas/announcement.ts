import { z } from 'zod';

export const AnnouncementTypeEnum = z.enum(['info', 'warning', 'success', 'critical']);

export const AnnouncementSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  type: AnnouncementTypeEnum,
  author: z.string().min(1),
  pinned: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateAnnouncementInputSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  type: AnnouncementTypeEnum,
  author: z.string().min(1),
  pinned: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const UpdateAnnouncementInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(5000).optional(),
  type: AnnouncementTypeEnum.optional(),
  pinned: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export type Announcement = z.infer<typeof AnnouncementSchema>;
export type AnnouncementType = z.infer<typeof AnnouncementTypeEnum>;
export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementInputSchema>;
export type UpdateAnnouncementInput = z.infer<typeof UpdateAnnouncementInputSchema>;
