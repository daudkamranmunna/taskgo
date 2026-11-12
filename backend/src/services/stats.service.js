// Reads study data from the database and builds the numbers for the app.
// The supabase client passed in is the user's own, so Row Level Security
// guarantees we only ever see that user's sessions.
import { addDays } from '../utils/dates.js';
import { calculateStreaks, buildLast28Days } from './streak.service.js';

const PAGE_SIZE = 1000; // Supabase returns at most 1000 rows per request

// We always round DOWN to whole minutes, everywhere, so numbers always agree
function secondsToMinutes(seconds) {
  return Math.floor(seconds / 60);
}

// Total studied minutes per day, as a Map { "2026-11-12" => 45, ... }
// fromDate / toDate (YYYY-MM-DD) are optional limits.
export async function getDailyMinutes(supabase, fromDate = null, toDate = null) {
  const secondsPerDay = new Map();
  let offset = 0;

  // Read the sessions page by page, so more than 1000 sessions still work
  while (true) {
    let query = supabase
      .from('study_sessions')
      .select('session_date, duration_seconds')
      .order('session_date', { ascending: true })
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (fromDate) query = query.gte('session_date', fromDate);
    if (toDate) query = query.lte('session_date', toDate);

    const { data, error } = await query;
    if (error) throw error;

    for (const row of data) {
      const before = secondsPerDay.get(row.session_date) || 0;
      secondsPerDay.set(row.session_date, before + row.duration_seconds);
    }

    if (data.length < PAGE_SIZE) break; // that was the last page
    offset += PAGE_SIZE;
  }

  const minutesPerDay = new Map();
  for (const [date, seconds] of secondsPerDay) {
    minutesPerDay.set(date, secondsToMinutes(seconds));
  }
  return minutesPerDay;
}

// GET /api/stats/today
export async function getTodayStats(supabase, userId, today) {
  const [profileResult, sessionsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('daily_goal_minutes')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('study_sessions')
      .select('duration_seconds')
      .eq('session_date', today),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (sessionsResult.error) throw sessionsResult.error;

  const goalMinutes = profileResult.data
    ? profileResult.data.daily_goal_minutes
    : 60; // the default goal, in case the profile is missing

  const sessions = sessionsResult.data;
  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration_seconds, 0);
  const minutesToday = secondsToMinutes(totalSeconds);

  return {
    minutes_today: minutesToday,
    goal_minutes: goalMinutes,
    goal_met: minutesToday >= goalMinutes,
    sessions_today: sessions.length,
  };
}

// GET /api/stats/streak
export async function getStreakStats(supabase, today) {
  const dailyMinutes = await getDailyMinutes(supabase); // all time
  const streaks = calculateStreaks(dailyMinutes, today);

  return {
    ...streaks,
    last_28_days: buildLast28Days(dailyMinutes, today),
  };
}

// GET /api/stats/weekly  (the 7 days ending today)
export async function getWeeklyStats(supabase, today) {
  const firstDay = addDays(today, -6);
  const dailyMinutes = await getDailyMinutes(supabase, firstDay, today);

  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const date = addDays(firstDay, i);
    days.push({ date, minutes: dailyMinutes.get(date) || 0 });
  }

  const totalMinutes = days.reduce((sum, day) => sum + day.minutes, 0);

  // Best day = the day with the most minutes. If nothing was studied,
  // there is no best day, so date is null and minutes is 0.
  let bestDay = { date: null, minutes: 0 };
  for (const day of days) {
    if (day.minutes > bestDay.minutes) bestDay = day;
  }

  return {
    days,
    total_minutes: totalMinutes,
    average_minutes: Math.round(totalMinutes / 7),
    best_day: bestDay,
  };
}