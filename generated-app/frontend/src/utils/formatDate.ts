import { format, parseISO } from 'date-fns';

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateForInput(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

export function toISODateTime(dateString: string): string {
  // Convert a date input value (YYYY-MM-DD) to ISO datetime
  return `${dateString}T00:00:00.000Z`;
}
