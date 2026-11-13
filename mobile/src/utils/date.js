// Date helpers. Dates are plain text like "2026-11-12" (YYYY-MM-DD).
// The app sends its own local date to the backend, so time zones never cause bugs.

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(number) {
  return String(number).padStart(2, '0');
}

// Today's date on the phone, as "YYYY-MM-DD"
export function todayString(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Turns "2026-11-12" into a Date at local midnight
function parseDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// "2026-11-12" -> "Thu"
export function shortWeekday(dateString) {
  return WEEKDAYS[parseDate(dateString).getDay()];
}

// "2026-11-12" -> "Nov 12"
export function formatShortDate(dateString) {
  const date = parseDate(dateString);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

// The deadline text for a task. daysLeft comes from the backend:
// 0 = today, 5 = in 5 days, -2 = overdue by 2 days, null = no due date.
export function deadlineLabel(daysLeft) {
  if (daysLeft === null || daysLeft === undefined) return null;
  if (daysLeft < 0) {
    const days = -daysLeft;
    return `Overdue by ${days} ${days === 1 ? 'day' : 'days'}`;
  }
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return 'Due tomorrow';
  return `Due in ${daysLeft} days`;
}

export function isOverdue(daysLeft) {
  return daysLeft !== null && daysLeft !== undefined && daysLeft < 0;
}