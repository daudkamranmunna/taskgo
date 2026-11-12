import { ok, fail } from '../utils/response.js';
import { isValidDateString } from '../utils/dates.js';
import {
  getTodayStats,
  getStreakStats,
  getWeeklyStats,
} from '../services/stats.service.js';
import { getXpStats } from '../services/xp.service.js';

// Reads ?today=YYYY-MM-DD. If it is missing or wrong, sends a 400 reply
// and returns null, so the caller can simply stop.
function readToday(req, res) {
  const today = req.query.today;
  if (!isValidDateString(today)) {
    fail(res, 400, 'today is required and must look like 2026-11-12');
    return null;
  }
  return today;
}

// GET /api/stats/today?today=YYYY-MM-DD
export async function getToday(req, res) {
  const today = readToday(req, res);
  if (!today) return;
  return ok(res, await getTodayStats(req.supabase, req.user.id, today));
}

// GET /api/stats/streak?today=YYYY-MM-DD
export async function getStreak(req, res) {
  const today = readToday(req, res);
  if (!today) return;
  return ok(res, await getStreakStats(req.supabase, today));
}

// GET /api/stats/weekly?today=YYYY-MM-DD
export async function getWeekly(req, res) {
  const today = readToday(req, res);
  if (!today) return;
  return ok(res, await getWeeklyStats(req.supabase, today));
}

// GET /api/stats/xp  (no date needed)
export async function getXp(req, res) {
  return ok(res, await getXpStats(req.supabase));
}