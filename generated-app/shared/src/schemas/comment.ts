import { z } from 'zod';

export const CommentSchema = z.object({
  id: z.string().uuid(),
  issueId: z.string().uuid(),
  projectId: z.string().uuid(),
  author: z.string().min(1),
  body: z.string().min(1).max(5000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateCommentInputSchema = z.object({
  author: z.string().min(1),
  body: z.string().min(1).max(5000),
});

export type Comment = z.infer<typeof CommentSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentInputSchema>;
