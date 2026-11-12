// Date helpers. All dates are plain text like "2026-11-12" (YYYY-MM-DD).
// We calculate in UTC so the server's time zone can never shift a day.

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// True only for real dates in YYYY-MM-DD format (2026-02-31 is rejected)
export function isValidDateString(value) {
  if (typeof value !== 'string' || !DATE_REGEX.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && formatDate(date) === value;
}

// Turns a Date object into "YYYY-MM-DD"
export function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

// addDays("2026-11-12", 3) -> "2026-11-15"   (negative numbers go back)
export function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}

// daysBetween("2026-11-12", "2026-11-17") -> 5   (negative if "to" is earlier)
export function daysBetween(fromDate, toDate) {
  const from = new Date(`${fromDate}T00:00:00Z`);
  const to = new Date(`${toDate}T00:00:00Z`);
  return Math.round((to - from) / 86400000); // 86400000 ms in one day
}