import { ok } from '../utils/response.js';

// GET /api/badges -> every badge, marked earned or not
export async function listBadges(req, res) {
  const [badgesResult, earnedResult] = await Promise.all([
    req.supabase
      .from('badges')
      .select('code, name, description, icon, requirement_type, requirement_value, sort_order')
      .order('sort_order', { ascending: true }),
    req.supabase.from('user_badges').select('badge_code, earned_at'),
  ]);

  if (badgesResult.error) throw badgesResult.error;
  if (earnedResult.error) throw earnedResult.error;

  const earnedAt = new Map(
    earnedResult.data.map((row) => [row.badge_code, row.earned_at])
  );

  const badges = badgesResult.data.map((badge) => ({
    ...badge,
    earned: earnedAt.has(badge.code),
    earned_at: earnedAt.get(badge.code) || null,
  }));

  return ok(res, badges);
}