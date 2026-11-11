export function matchesDateFilter(value: unknown, selectedDate: string): boolean {
  if (typeof value !== "string") return false;

  const normalized = value.trim();
  // Date-only values represent a calendar day, regardless of the time zone.
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized === selectedDate;
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return false;

  // Match the local date used when timestamps are displayed in the table.
  const localDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  return localDate === selectedDate;
}
