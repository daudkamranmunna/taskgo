import { ok, fail } from '../utils/response.js';

// The columns we send back to the app
const PROFILE_COLUMNS = 'id, display_name, daily_goal_minutes';

// GET /api/profile -> the logged-in user's profile
export async function getProfile(req, res) {
  const { data, error } = await req.supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', req.user.id)
    .maybeSingle();

  if (error) throw error; // the error handler turns this into a 500
  if (!data) return fail(res, 404, 'Profile not found');

  return ok(res, data);
}

// PUT /api/profile  body: { display_name?, daily_goal_minutes? }
export async function updateProfile(req, res) {
  const body = req.body || {};
  const changes = {}; // only the fields the app actually sent

  if (body.display_name !== undefined) {
    const name =
      typeof body.display_name === 'string' ? body.display_name.trim() : '';
    if (name.length < 1 || name.length > 50) {
      return fail(res, 400, 'display_name must be 1 to 50 characters');
    }
    changes.display_name = name;
  }

  if (body.daily_goal_minutes !== undefined) {
    const minutes = body.daily_goal_minutes;
    if (!Number.isInteger(minutes) || minutes < 5 || minutes > 720) {
      return fail(
        res,
        400,
        'daily_goal_minutes must be a whole number from 5 to 720'
      );
    }
    changes.daily_goal_minutes = minutes;
  }

  if (Object.keys(changes).length === 0) {
    return fail(
      res,
      400,
      'Nothing to update. Send display_name and/or daily_goal_minutes'
    );
  }

  const { data, error } = await req.supabase
    .from('profiles')
    .update(changes)
    .eq('id', req.user.id)
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (error) throw error;
  if (!data) return fail(res, 404, 'Profile not found');

  return ok(res, data);
}