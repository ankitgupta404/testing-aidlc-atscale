import { formatDistanceToNow, format } from 'date-fns';
import { SEED_USERS } from './constants';

export function getRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function getUserName(userId: string | undefined): string {
  if (!userId) return 'Unassigned';
  const user = SEED_USERS.find(u => u.id === userId);
  return user?.name || 'Unknown';
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
