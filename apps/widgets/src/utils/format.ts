/**
 * Format a date string to a relative time string
 */
export function formatRelativeDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  if (diff < 365) return `${Math.floor(diff / 30)} months ago`;
  return d.toLocaleDateString();
}

/**
 * Format points number with thousands separator
 */
export function formatPoints(points: number): string {
  return new Intl.NumberFormat().format(points);
}
