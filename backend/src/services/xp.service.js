// XP and levels. XP is never stored: it is calculated from existing data.
import { getDailyMinutes } from './stats.service.js';
import { isActiveDay } from './streak.service.js';

// The XP rules (change them here only)
export const XP_PER_MINUTE = 1;
export const XP_PER_ACTIVE_DAY = 10;
export const XP_PER_COMPLETED_TASK = 15;
export const XP_PER_BADGE = 25;

// Level = floor(sqrt(xp / 100)) + 1
// So: level 2 at 100 XP, level 3 at 400 XP, level 4 at 900 XP ...
export function levelFromXp(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// Turns a total XP number into everything the app needs to show a level bar
export function buildXpResult(xp) {
  const level = levelFromXp(xp);
  const levelStart = 100 * (level - 1) ** 2; // XP where this level began
  const levelEnd = 100 * level ** 2; // XP needed to reach the next level
  const xpIntoLevel = xp - levelStart;
  const xpForNextLevel = levelEnd - levelStart; // the size of this level

  return {
    xp,
    level,
    xp_into_level: xpIntoLevel,
    xp_for_next_level: xpForNextLevel,
    progress: Math.round((xpIntoLevel / xpForNextLevel) * 1000) / 1000,
  };
}

// Runs a "count only" query and returns the number
async function countRows(query) {
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

// GET /api/stats/xp
export async function getXpStats(supabase) {
  const [dailyMinutes, completedTasks, earnedBadges] = await Promise.all([
    getDailyMinutes(supabase),
    countRows(
      supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('is_done', true)
    ),
    countRows(
      supabase.from('user_badges').select('id:badge_code', { count: 'exact', head: true })
    ),
  ]);

  let studiedMinutes = 0;
  let activeDays = 0;
  for (const minutes of dailyMinutes.values()) {
    studiedMinutes += minutes;
    if (isActiveDay(minutes)) activeDays += 1;
  }

  const xp =
    studiedMinutes * XP_PER_MINUTE +
    activeDays * XP_PER_ACTIVE_DAY +
    completedTasks * XP_PER_COMPLETED_TASK +
    earnedBadges * XP_PER_BADGE;

  return buildXpResult(xp);
}