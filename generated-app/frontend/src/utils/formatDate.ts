import { formatDistanceToNow, format, parseISO } from "date-fns";

export function relativeDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function fullDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, "MMMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function shortDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}
