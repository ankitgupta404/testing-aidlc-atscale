import { z } from 'zod';
import {
  AnnouncementSchema,
  CreateAnnouncementInputSchema,
  UpdateAnnouncementInputSchema,
  ListAnnouncementsResponseSchema,
  ListAnnouncementsQuerySchema,
  AwsServiceEnum,
} from './schemas';

export type Announcement = z.infer<typeof AnnouncementSchema>;
export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementInputSchema>;
export type UpdateAnnouncementInput = z.infer<typeof UpdateAnnouncementInputSchema>;
export type ListAnnouncementsResponse = z.infer<typeof ListAnnouncementsResponseSchema>;
export type ListAnnouncementsQuery = z.infer<typeof ListAnnouncementsQuerySchema>;
export type AwsService = z.infer<typeof AwsServiceEnum>;
