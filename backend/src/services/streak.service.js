// Streak rules. This file only does maths on data it is given,
// it never talks to the database.
import { addDays } from '../utils/dates.js';

// A day counts as "active" when you studied at least this many minutes
export const MIN_STREAK_MINUTES = 10;

export function isActiveDay(minutes) {
  return minutes >= MIN_STREAK_MINUTES;
}

// dailyMinutes is a Map like { "2026-11-11" => 30, "2026-11-10" => 5 }
// today is "YYYY-MM-DD" (sent by the app)
export function calculateStreaks(dailyMinutes, today) {
  // Collect the active days (ignoring days in the future)
  const activeDates = [];
  for (const [date, minutes] of dailyMinutes) {
    if (date <= today && isActiveDay(minutes)) activeDates.push(date);
  }
  activeDates.sort(); // "YYYY-MM-DD" text sorts in date order
  const activeSet = new Set(activeDates);
  const activeToday = activeSet.has(today);

  // Longest streak: the longest run of consecutive active days ever
  let longest = 0;
  let run = 0;
  let previous = null;
  for (const date of activeDates) {
    run = previous !== null && addDays(previous, 1) === date ? run + 1 : 1;
    if (run > longest) longest = run;
    previous = date;
  }

  // Current streak: count back from today. If today is not active yet,
  // start from yesterday, so the streak is not broken until the day passes.
  let current = 0;
  let day = activeToday ? today : addDays(today, -1);
  while (activeSet.has(day)) {
    current += 1;
    day = addDays(day, -1);
  }

  return {
    current_streak: current,
    longest_streak: longest,
    active_today: activeToday,
  };
}

// The last 28 days (oldest first) for the streak calendar
export function buildLast28Days(dailyMinutes, today) {
  const days = [];
  for (let back = 27; back >= 0; back -= 1) {
    const date = addDays(today, -back);
    const minutes = dailyMinutes.get(date) || 0;
    days.push({ date, minutes, active: isActiveDay(minutes) });
  }
  return days;
}