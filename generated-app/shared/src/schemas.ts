import { z } from "zod";

// AWS Service categories enum
export const AwsServiceSchema = z.enum([
  "Lambda",
  "S3",
  "DynamoDB",
  "Bedrock",
  "EC2",
  "ECS",
  "CloudFront",
  "API Gateway",
  "SQS",
  "SNS",
  "EventBridge",
  "Step Functions",
  "IAM",
  "CloudWatch",
  "CDK",
  "Other",
]);

export type AwsService = z.infer<typeof AwsServiceSchema>;

// Core Announcement entity
export const AnnouncementSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(300),
  summary: z.string().min(1).max(2000),
  service: AwsServiceSchema,
  date: z.string().datetime(), // ISO 8601 date string
  url: z.string().url().optional(), // Optional link to AWS announcement page
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Announcement = z.infer<typeof AnnouncementSchema>;

// Create input (no id, createdAt, updatedAt — server generates these)
export const CreateAnnouncementInputSchema = z.object({
  title: z.string().min(1).max(300),
  summary: z.string().min(1).max(2000),
  service: AwsServiceSchema,
  date: z.string().datetime(),
  url: z.string().url().optional(),
});

export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementInputSchema>;

// Update input (all fields optional except at least one must be provided)
export const UpdateAnnouncementInputSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  summary: z.string().min(1).max(2000).optional(),
  service: AwsServiceSchema.optional(),
  date: z.string().datetime().optional(),
  url: z.string().url().optional(),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: "At least one field must be provided for update" }
);

export type UpdateAnnouncementInput = z.infer<typeof UpdateAnnouncementInputSchema>;

// List response with pagination
export const AnnouncementListResponseSchema = z.object({
  announcements: z.array(AnnouncementSchema),
  nextToken: z.string().nullable(),
});

export type AnnouncementListResponse = z.infer<typeof AnnouncementListResponseSchema>;

// Query params for listing
export const ListAnnouncementsQuerySchema = z.object({
  service: AwsServiceSchema.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  nextToken: z.string().optional(),
});

export type ListAnnouncementsQuery = z.infer<typeof ListAnnouncementsQuerySchema>;

// Services list response
export const ServicesResponseSchema = z.object({
  services: z.array(z.string()),
});

export type ServicesResponse = z.infer<typeof ServicesResponseSchema>;

// Delete response
export const DeleteResponseSchema = z.object({
  deleted: z.literal(true),
});

export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;

// Error response
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.array(z.string()).optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
