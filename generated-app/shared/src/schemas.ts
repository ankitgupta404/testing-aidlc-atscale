import { z } from 'zod';

// AWS service categories
export const AwsServiceEnum = z.enum([
  'Lambda',
  'S3',
  'DynamoDB',
  'Bedrock',
  'EC2',
  'ECS',
  'CloudFront',
  'API Gateway',
  'Step Functions',
  'EventBridge',
  'SQS',
  'SNS',
  'RDS',
  'Aurora',
  'EKS',
  'IAM',
  'CloudWatch',
  'CodePipeline',
  'SageMaker',
  'Other'
]);

// Full announcement schema (as stored in DB and returned by API)
export const AnnouncementSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(2000),
  service: AwsServiceEnum,
  date: z.string().datetime(),
  link: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Input schema for creating an announcement
export const CreateAnnouncementInputSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(2000),
  service: AwsServiceEnum,
  date: z.string().datetime(),
  link: z.string().url().optional(),
});

// Input schema for updating an announcement (all fields optional)
export const UpdateAnnouncementInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().min(1).max(2000).optional(),
  service: AwsServiceEnum.optional(),
  date: z.string().datetime().optional(),
  link: z.string().url().optional(),
});

// List response schema
export const ListAnnouncementsResponseSchema = z.object({
  announcements: z.array(AnnouncementSchema),
  nextToken: z.string().nullable(),
});

// Query parameters schema
export const ListAnnouncementsQuerySchema = z.object({
  service: AwsServiceEnum.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  nextToken: z.string().optional(),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
});
