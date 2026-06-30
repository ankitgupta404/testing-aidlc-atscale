import { z } from 'zod';

export const CommentSchema = z.object({
  id: z.string().uuid(),
  issueId: z.string().uuid(),
  authorId: z.string().uuid(),
  body: z.string().min(1).max(5000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateCommentSchema = CommentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCommentSchema = z.object({
  body: z.string().min(1).max(5000),
});
