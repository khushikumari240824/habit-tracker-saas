/**
 * All dates in this app are stored and compared as plain "YYYY-MM-DD" strings.
 * This avoids timezone bugs entirely — we never convert to UTC or use Date
 * objects for storage/comparison of "which day" a habit was completed.
 */

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false;

  // Reject impossible dates like "2024-02-30"
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Returns the date string that is exactly one day before the given date.
 * e.g. "2026-06-15" -> "2026-06-14"
 * e.g. "2026-01-01" -> "2025-12-31"
 */
export function getPreviousDateString(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);

  // Use UTC to avoid any local-timezone shifting during arithmetic
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);

  return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

/**
 * Compares two "YYYY-MM-DD" strings.
 * Returns negative if a < b, positive if a > b, 0 if equal.
 * Safe because lexicographic string comparison works correctly
 * for zero-padded ISO date strings.
 */
export function compareDateStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}