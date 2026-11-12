// Decides which badges a user has just earned, and saves them.
// The supabase client passed in is the user's own (Row Level Security applies).
import { getDailyMinutes } from './stats.service.js';
import { calculateStreaks } from './streak.service.js';

// Which kinds of badges to check after each action
export const SESSION_BADGE_TYPES = [
  'sessions_count',
  'streak',
  'total_hours',
  'goal_days',
];
export const TASK_BADGE_TYPES = ['tasks_done'];

// Runs a "count only" query and returns the number
async function countRows(query) {
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

// Works out the user's current numbers, but only for the requested types
// (so we do not run database queries we do not need).
// types is a Set like Set { 'streak', 'tasks_done' }
async function getProgress(supabase, userId, today, types) {
  const progress = {};

  if (types.has('sessions_count')) {
    progress.sessions_count = await countRows(
      supabase.from('study_sessions').select('id', { count: 'exact', head: true })
    );
  }

  if (types.has('tasks_done')) {
    progress.tasks_done = await countRows(
      supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('is_done', true)
    );
  }

  // These three all need the studied minutes of every day
  const needsDaily =
    types.has('streak') || types.has('total_hours') || types.has('goal_days');

  if (needsDaily) {
    const dailyMinutes = await getDailyMinutes(supabase);

    if (types.has('streak')) {
      progress.streak = calculateStreaks(dailyMinutes, today).longest_streak;
    }

    if (types.has('total_hours')) {
      let totalMinutes = 0;
      for (const minutes of dailyMinutes.values()) totalMinutes += minutes;
      progress.total_hours = totalMinutes / 60;
    }

    if (types.has('goal_days')) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('daily_goal_minutes')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;

      const goalMinutes = profile ? profile.daily_goal_minutes : 60;
      let daysMet = 0;
      for (const minutes of dailyMinutes.values()) {
        if (minutes >= goalMinutes) daysMet += 1;
      }
      progress.goal_days = daysMet;
    }
  }

  return progress;
}

// Checks the given badge types, saves any newly earned badges, and returns
// them as [{ code, name, description, icon }].
//   types: e.g. SESSION_BADGE_TYPES
//   today: "YYYY-MM-DD", needed for the 'streak' type
export async function checkAndAwardBadges(supabase, userId, { today, types }) {
  // 1. The badges of the requested types
  const { data: catalog, error: catalogError } = await supabase
    .from('badges')
    .select('code, name, description, icon, requirement_type, requirement_value')
    .in('requirement_type', types)
    .order('sort_order', { ascending: true });
  if (catalogError) throw catalogError;

  // 2. The ones this user already has
  const { data: earnedRows, error: earnedError } = await supabase
    .from('user_badges')
    .select('badge_code');
  if (earnedError) throw earnedError;
  const alreadyEarned = new Set(earnedRows.map((row) => row.badge_code));

  const notYetEarned = catalog.filter((badge) => !alreadyEarned.has(badge.code));
  if (notYetEarned.length === 0) return [];

  // 3. The user's current numbers (only for the types we still need)
  const neededTypes = new Set(notYetEarned.map((b) => b.requirement_type));
  const progress = await getProgress(supabase, userId, today, neededTypes);

  // 4. Which badges are now reached?
  const reached = notYetEarned.filter(
    (badge) => progress[badge.requirement_type] >= badge.requirement_value
  );
  if (reached.length === 0) return [];

  // 5. Save them. "ignoreDuplicates" means: if a badge was saved a moment ago
  // by another request, skip it. Only truly new rows come back.
  const { data: inserted, error: insertError } = await supabase
    .from('user_badges')
    .upsert(
      reached.map((badge) => ({ user_id: userId, badge_code: badge.code })),
      { onConflict: 'user_id,badge_code', ignoreDuplicates: true }
    )
    .select('badge_code');
  if (insertError) throw insertError;

  const newCodes = new Set((inserted || []).map((row) => row.badge_code));
  return reached
    .filter((badge) => newCodes.has(badge.code))
    .map(({ code, name, description, icon }) => ({ code, name, description, icon }));
}