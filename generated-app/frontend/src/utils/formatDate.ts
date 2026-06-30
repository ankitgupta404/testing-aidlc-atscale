import { format, parseISO } from 'date-fns';

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateForInput(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, 'yyyy-MM-dd');
  } catch {
    return dateStr;
  }
}

export function toISODateTime(dateStr: string): string {
  // Convert YYYY-MM-DD to ISO datetime
  return `${dateStr}T00:00:00.000Z`;
}
