import { ok, fail } from '../utils/response.js';
import { isValidDateString } from '../utils/dates.js';
import {
  checkAndAwardBadges,
  SESSION_BADGE_TYPES,
} from '../services/badges.service.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_NOTE_LENGTH = 1000;

// Returns an error message if the note is not acceptable, otherwise null
function noteError(note) {
  if (note === null || note === undefined) return null;
  if (typeof note !== 'string') return 'note must be text';
  if (note.length > MAX_NOTE_LENGTH) {
    return `note must be at most ${MAX_NOTE_LENGTH} characters`;
  }
  return null;
}

// Trims the note; an empty note is stored as null
function cleanNote(note) {
  if (typeof note !== 'string') return null;
  const trimmed = note.trim();
  return trimmed === '' ? null : trimmed;
}

// POST /api/sessions
// body: { subject, duration_seconds, started_at, session_date, task_id?, note? }
export async function createSession(req, res) {
  const body = req.body || {};

  // --- check every field before touching the database ---
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  if (subject.length < 1 || subject.length > 50) {
    return fail(res, 400, 'subject is required (1 to 50 characters)');
  }

  if (!Number.isInteger(body.duration_seconds) || body.duration_seconds <= 0) {
    return fail(res, 400, 'duration_seconds must be a whole number above 0');
  }

  if (
    typeof body.started_at !== 'string' ||
    Number.isNaN(Date.parse(body.started_at))
  ) {
    return fail(res, 400, 'started_at must be a valid date and time');
  }

  if (!isValidDateString(body.session_date)) {
    return fail(res, 400, 'session_date must be a valid date like 2026-11-12');
  }

  const taskId = body.task_id === undefined ? null : body.task_id;
  if (taskId !== null && (typeof taskId !== 'string' || !UUID_REGEX.test(taskId))) {
    return fail(res, 400, 'task_id must be a valid id');
  }

  const noteProblem = noteError(body.note);
  if (noteProblem) return fail(res, 400, noteProblem);

  // If a task is linked, make sure it exists and belongs to this user.
  // (Row Level Security only lets us see the user's own tasks.)
  if (taskId !== null) {
    const { data: task, error: taskError } = await req.supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .maybeSingle();

    if (taskError) throw taskError;
    if (!task) return fail(res, 400, 'That task was not found');
  }

  // --- save the session ---
  const { data: session, error } = await req.supabase
    .from('study_sessions')
    .insert({
      user_id: req.user.id,
      task_id: taskId,
      subject,
      duration_seconds: body.duration_seconds,
      started_at: body.started_at,
      session_date: body.session_date,
      note: cleanNote(body.note),
    })
    .select()
    .single();

  if (error) throw error;

  // --- check for new badges ---
  // The session is already saved. If the badge check fails, we still
  // answer successfully (with no badges) instead of losing the session.
  let newlyEarnedBadges = [];
  try {
    newlyEarnedBadges = await checkAndAwardBadges(req.supabase, req.user.id, {
      today: body.session_date,
      types: SESSION_BADGE_TYPES,
    });
  } catch (badgeError) {
    console.error('Badge check failed:', badgeError);
  }

  return ok(res, { session, newly_earned_badges: newlyEarnedBadges }, 201);
}

// PUT /api/sessions/:id  body: { note }  (used to add a note after finishing)
export async function updateSessionNote(req, res) {
  const { id } = req.params;
  if (!UUID_REGEX.test(id)) return fail(res, 400, 'Invalid session id');

  const body = req.body || {};
  if (body.note === undefined) return fail(res, 400, 'note is required');

  const noteProblem = noteError(body.note);
  if (noteProblem) return fail(res, 400, noteProblem);

  const { data, error } = await req.supabase
    .from('study_sessions')
    .update({ note: cleanNote(body.note) })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) return fail(res, 404, 'Session not found');

  return ok(res, data);
}

// GET /api/sessions?limit=50&offset=0 -> newest first, with the task title
export async function listSessions(req, res) {
  const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);
  const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return fail(res, 400, 'limit must be a whole number from 1 to 100');
  }
  if (!Number.isInteger(offset) || offset < 0) {
    return fail(res, 400, 'offset must be a whole number, 0 or more');
  }

  const { data, error } = await req.supabase
    .from('study_sessions')
    .select('*, task:tasks(title)')
    .order('session_date', { ascending: false })
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Turn { task: { title } } into a simple task_title field
  const sessions = data.map(({ task, ...session }) => ({
    ...session,
    task_title: task ? task.title : null,
  }));

  return ok(res, sessions);
}

// DELETE /api/sessions/:id
export async function deleteSession(req, res) {
  const { id } = req.params;
  if (!UUID_REGEX.test(id)) return fail(res, 400, 'Invalid session id');

  const { data, error } = await req.supabase
    .from('study_sessions')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) throw error;
  if (!data || data.length === 0) return fail(res, 404, 'Session not found');

  return ok(res, { deleted: true });
}