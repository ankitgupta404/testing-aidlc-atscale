export const STATUS_CONFIG = {
  todo: { label: 'To Do', color: 'bg-status-todo', textColor: 'text-status-todo' },
  in_progress: { label: 'In Progress', color: 'bg-status-progress', textColor: 'text-status-progress' },
  in_review: { label: 'In Review', color: 'bg-status-review', textColor: 'text-status-review' },
  done: { label: 'Done', color: 'bg-status-done', textColor: 'text-status-done' },
  cancelled: { label: 'Cancelled', color: 'bg-status-cancelled', textColor: 'text-status-cancelled' },
} as const;

export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'bg-priority-critical', textColor: 'text-priority-critical' },
  high: { label: 'High', color: 'bg-priority-high', textColor: 'text-priority-high' },
  medium: { label: 'Medium', color: 'bg-priority-medium', textColor: 'text-priority-medium' },
  low: { label: 'Low', color: 'bg-priority-low', textColor: 'text-priority-low' },
} as const;

export const TYPE_CONFIG = {
  story: { label: 'Story', icon: '📖' },
  bug: { label: 'Bug', icon: '🐛' },
  task: { label: 'Task', icon: '✅' },
  subtask: { label: 'Subtask', icon: '📋' },
} as const;

export const BOARD_COLUMNS = ['todo', 'in_progress', 'in_review', 'done'] as const;
