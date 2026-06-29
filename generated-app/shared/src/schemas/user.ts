import { z } from 'zod';

export const UserRoleEnum = z.enum(['admin', 'member', 'viewer']);

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  role: UserRoleEnum,
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleEnum>;
