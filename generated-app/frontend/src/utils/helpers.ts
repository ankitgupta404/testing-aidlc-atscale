import { SEED_USERS } from './constants';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `about ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
    return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
  } catch {
    return dateStr;
  }
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export function getUserName(userId: string | undefined): string {
  if (!userId) return 'Unassigned';
  const user = SEED_USERS.find(u => u.id === userId);
  return user?.name || userId; // Return the raw value if not found (might be a name)
}

/**
 * Resolve assignee from issue data. The API may return:
 * - assigneeId as UUID → look up in SEED_USERS
 * - assignee as name string → find user by name
 * Returns the user object or undefined if unassigned.
 */
export function resolveAssignee(issue: { assigneeId?: string; assignee?: string }): typeof SEED_USERS[0] | undefined {
  if (issue.assigneeId) {
    return SEED_USERS.find(u => u.id === issue.assigneeId);
  }
  if ((issue as any).assignee) {
    const name = (issue as any).assignee;
    return SEED_USERS.find(u => u.name === name || u.name.toLowerCase() === name.toLowerCase());
  }
  return undefined;
}

export function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-canopy-500', 'bg-sky', 'bg-plum', 'bg-amber', 'bg-rust',
    'bg-moss', 'bg-bark-600', 'bg-canopy-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
