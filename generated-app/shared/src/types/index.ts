import { z } from 'zod';
import { ProjectSchema, CreateProjectSchema, UpdateProjectSchema } from '../schemas/project';
import {
  IssueSchema, CreateIssueSchema, UpdateIssueSchema,
  MoveIssueSchema, IssueFilterSchema,
  IssuePrioritySchema, IssueTypeSchema, IssueStatusSchema,
} from '../schemas/issue';
import { SprintSchema, CreateSprintSchema, UpdateSprintSchema, SprintStatusSchema } from '../schemas/sprint';
import { EpicSchema, CreateEpicSchema, UpdateEpicSchema, EpicStatusSchema } from '../schemas/epic';
import { CommentSchema, CreateCommentSchema, UpdateCommentSchema } from '../schemas/comment';
import { AnnouncementSchema, CreateAnnouncementSchema, UpdateAnnouncementSchema } from '../schemas/announcement';
import { UserSchema } from '../schemas/user';
import { BoardSchema, BoardColumnSchema } from '../schemas/board';
import { DashboardDataSchema, BurndownDataPointSchema, VelocityDataPointSchema } from '../schemas/dashboard';

// Project types
export type Project = z.infer<typeof ProjectSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;

// Issue types
export type Issue = z.infer<typeof IssueSchema>;
export type CreateIssue = z.infer<typeof CreateIssueSchema>;
export type UpdateIssue = z.infer<typeof UpdateIssueSchema>;
export type MoveIssue = z.infer<typeof MoveIssueSchema>;
export type IssueFilter = z.infer<typeof IssueFilterSchema>;
export type IssuePriority = z.infer<typeof IssuePrioritySchema>;
export type IssueType = z.infer<typeof IssueTypeSchema>;
export type IssueStatus = z.infer<typeof IssueStatusSchema>;

// Sprint types
export type Sprint = z.infer<typeof SprintSchema>;
export type CreateSprint = z.infer<typeof CreateSprintSchema>;
export type UpdateSprint = z.infer<typeof UpdateSprintSchema>;
export type SprintStatus = z.infer<typeof SprintStatusSchema>;

// Epic types
export type Epic = z.infer<typeof EpicSchema>;
export type CreateEpic = z.infer<typeof CreateEpicSchema>;
export type UpdateEpic = z.infer<typeof UpdateEpicSchema>;
export type EpicStatus = z.infer<typeof EpicStatusSchema>;

// Comment types
export type Comment = z.infer<typeof CommentSchema>;
export type CreateComment = z.infer<typeof CreateCommentSchema>;
export type UpdateComment = z.infer<typeof UpdateCommentSchema>;

// Announcement types
export type Announcement = z.infer<typeof AnnouncementSchema>;
export type CreateAnnouncement = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateAnnouncement = z.infer<typeof UpdateAnnouncementSchema>;

// User types
export type User = z.infer<typeof UserSchema>;

// Board types
export type Board = z.infer<typeof BoardSchema>;
export type BoardColumn = z.infer<typeof BoardColumnSchema>;

// Dashboard types
export type DashboardData = z.infer<typeof DashboardDataSchema>;
export type BurndownDataPoint = z.infer<typeof BurndownDataPointSchema>;
export type VelocityDataPoint = z.infer<typeof VelocityDataPointSchema>;

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    cursor: string | null;
    total?: number;
  };
}
