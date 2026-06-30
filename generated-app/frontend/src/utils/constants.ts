import type { User } from '@canopy/shared';

export const SEED_USERS: User[] = [
  { id: '10000000-0000-0000-0000-000000000001', name: 'Alice Chen', email: 'alice@canopy.dev', role: 'admin', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '10000000-0000-0000-0000-000000000002', name: 'Bob Martinez', email: 'bob@canopy.dev', role: 'member', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '10000000-0000-0000-0000-000000000003', name: 'Carol Williams', email: 'carol@canopy.dev', role: 'member', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '10000000-0000-0000-0000-000000000004', name: 'David Park', email: 'david@canopy.dev', role: 'member', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '10000000-0000-0000-0000-000000000005', name: 'Eva Thompson', email: 'eva@canopy.dev', role: 'member', createdAt: '2024-01-01T00:00:00.000Z' },
  // Legacy seed users (deployed Lambda v1)
  { id: '11111111-1111-1111-1111-111111111112', name: 'Sarah Chen', email: 'sarah@canopy.dev', role: 'admin', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '11111111-1111-1111-1111-111111111113', name: 'Marcus Johnson', email: 'marcus@canopy.dev', role: 'member', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '11111111-1111-1111-1111-111111111114', name: 'Alex Rivera', email: 'alex@canopy.dev', role: 'member', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '11111111-1111-1111-1111-111111111115', name: 'Priya Patel', email: 'priya@canopy.dev', role: 'member', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: '11111111-1111-1111-1111-111111111116', name: 'Maya Wong', email: 'maya@canopy.dev', role: 'member', createdAt: '2024-01-01T00:00:00.000Z' },
];

export const STATUS_COLORS: Record<string, string> = {
  backlog: 'bg-bark-300 text-bark-700',
  todo: 'bg-sky/20 text-sky',
  in_progress: 'bg-amber/20 text-amber',
  in_review: 'bg-plum/20 text-plum',
  done: 'bg-canopy-100 text-canopy-700',
  cancelled: 'bg-rust/20 text-rust',
};

export const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const PRIORITY_COLORS: Record<string, string> = {
  critical: 'text-rust',
  high: 'text-amber',
  medium: 'text-bark-600',
  low: 'text-sky',
  trivial: 'text-bark-400',
};

export const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  trivial: 'Trivial',
};

export const TYPE_LABELS: Record<string, string> = {
  story: 'Story',
  bug: 'Bug',
  task: 'Task',
  subtask: 'Subtask',
  epic: 'Epic',
};

export const DEFAULT_PROJECT_ID = '11111111-1111-1111-1111-111111111111';
