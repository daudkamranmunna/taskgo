import { ok, fail } from '../utils/response.js';
import { isValidDateString, daysBetween } from '../utils/dates.js';
import {
  checkAndAwardBadges,
  TASK_BADGE_TYPES,
} from '../services/badges.service.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PRIORITIES = ['low', 'medium', 'high', 'exam'];
const PRIORITY_RANK = { exam: 0, high: 1, medium: 2, low: 3 }; // 0 comes first
const STATUSES = ['open', 'done', 'all'];

const MAX_TITLE = 120;
const MAX_SUBJECT = 50;
const MAX_NOTE = 1000;

// ---------- sorting ----------

// Sorting rule for task lists:
//  1. open tasks first, then done tasks
//  2. open tasks: earliest due date first (no date goes last),
//     then priority (exam, high, medium, low), then oldest first
//  3. done tasks: most recently completed first
// (Exported so we can test it. Used with array.sort(compareTasks).)
export function compareTasks(a, b) {
  if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;

  if (a.is_done) {
    return (Date.parse(b.done_at) || 0) - (Date.parse(a.done_at) || 0);
  }

  if (a.due_date !== b.due_date) {
    if (a.due_date === null) return 1;
    if (b.due_date === null) return -1;
    return a.due_date < b.due_date ? -1 : 1; // "YYYY-MM-DD" sorts in date order
  }

  const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (byPriority !== 0) return byPriority;

  return Date.parse(a.created_at) - Date.parse(b.created_at);
}

// Adds days_left: 0 = due today, 5 = in 5 days, -2 = overdue by 2 days
function withDaysLeft(task, today) {
  return {
    ...task,
    days_left: task.due_date ? daysBetween(today, task.due_date) : null,
  };
}

// ---------- checking what the app sent ----------

// Checks the task fields in a request body.
// Returns { error } with a message, or { values } with the clean values.
// Fields the app did not send are simply left out of values.
function readTaskFields(body, isCreate) {
  const values = {};

  if (isCreate || body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (title.length < 1 || title.length > MAX_TITLE) {
      return { error: `title is required (1 to ${MAX_TITLE} characters)` };
    }
    values.title = title;
  }

  if (body.subject !== undefined) {
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    if (subject.length < 1 || subject.length > MAX_SUBJECT) {
      return { error: `subject must be 1 to ${MAX_SUBJECT} characters` };
    }
    values.subject = subject;
  }

  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) {
      return { error: 'priority must be low, medium, high or exam' };
    }
    values.priority = body.priority;
  }

  if (body.due_date !== undefined) {
    if (body.due_date !== null && !isValidDateString(body.due_date)) {
      return { error: 'due_date must be a date like 2026-11-12, or null' };
    }
    values.due_date = body.due_date;
  }

  if (body.note !== undefined) {
    if (body.note !== null && typeof body.note !== 'string') {
      return { error: 'note must be text' };
    }
    if (typeof body.note === 'string' && body.note.length > MAX_NOTE) {
      return { error: `note must be at most ${MAX_NOTE} characters` };
    }
    // An empty note is stored as null
    values.note =
      typeof body.note === 'string' && body.note.trim() !== ''
        ? body.note.trim()
        : null;
  }

  return { values };
}

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

// ---------- the endpoints ----------

// GET /api/tasks?status=open|done|all&today=YYYY-MM-DD
export async function listTasks(req, res) {
  const status = req.query.status === undefined ? 'open' : req.query.status;
  if (!STATUSES.includes(status)) {
    return fail(res, 400, 'status must be open, done or all');
  }

  const today = readToday(req, res);
  if (!today) return;

  let query = req.supabase.from('tasks').select('*').limit(1000);
  if (status === 'open') query = query.eq('is_done', false);
  if (status === 'done') query = query.eq('is_done', true);

  const { data, error } = await query;
  if (error) throw error;

  const tasks = data.sort(compareTasks).map((task) => withDaysLeft(task, today));
  return ok(res, tasks);
}

// GET /api/tasks/upcoming?today=YYYY-MM-DD
// Up to 3 open tasks that have a due date, nearest first.
// Overdue tasks come first (their days_left is negative).
export async function getUpcomingTasks(req, res) {
  const today = readToday(req, res);
  if (!today) return;

  const { data, error } = await req.supabase
    .from('tasks')
    .select('*')
    .eq('is_done', false)
    .not('due_date', 'is', null)
    .limit(1000);
  if (error) throw error;

  const upcoming = data
    .sort(compareTasks)
    .slice(0, 3)
    .map((task) => withDaysLeft(task, today));
  return ok(res, upcoming);
}

// POST /api/tasks  body: { title, subject?, priority?, due_date?, note? }
export async function createTask(req, res) {
  const { error: problem, values } = readTaskFields(req.body || {}, true);
  if (problem) return fail(res, 400, problem);

  const { data, error } = await req.supabase
    .from('tasks')
    .insert({ ...values, user_id: req.user.id })
    .select()
    .single();
  if (error) throw error;

  return ok(res, data, 201);
}

// PUT /api/tasks/:id
// body: { title?, subject?, priority?, due_date?, note?, is_done? }
export async function updateTask(req, res) {
  const { id } = req.params;
  if (!UUID_REGEX.test(id)) return fail(res, 400, 'Invalid task id');

  const body = req.body || {};
  const { error: problem, values: changes } = readTaskFields(body, false);
  if (problem) return fail(res, 400, problem);

  if (body.is_done !== undefined) {
    if (typeof body.is_done !== 'boolean') {
      return fail(res, 400, 'is_done must be true or false');
    }
    changes.is_done = body.is_done;
  }

  if (Object.keys(changes).length === 0) {
    return fail(res, 400, 'Nothing to update');
  }

  // Look at the task as it is now (Row Level Security: only the user's own)
  const { data: existing, error: findError } = await req.supabase
    .from('tasks')
    .select('id, is_done')
    .eq('id', id)
    .maybeSingle();
  if (findError) throw findError;
  if (!existing) return fail(res, 404, 'Task not found');

  // done_at: set to now when a task becomes done, cleared when un-done
  let justMarkedDone = false;
  if (body.is_done === true && !existing.is_done) {
    changes.done_at = new Date().toISOString();
    justMarkedDone = true;
  } else if (body.is_done === false) {
    changes.done_at = null;
  }

  const { data: task, error } = await req.supabase
    .from('tasks')
    .update(changes)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!task) return fail(res, 404, 'Task not found');

  // A newly completed task may earn a badge. If the badge check fails,
  // the task is still saved and we answer successfully with no badges.
  let newlyEarnedBadges = [];
  if (justMarkedDone) {
    try {
      // today is only needed for streak badges, which are not checked here
      newlyEarnedBadges = await checkAndAwardBadges(req.supabase, req.user.id, {
        today: null,
        types: TASK_BADGE_TYPES,
      });
    } catch (badgeError) {
      console.error('Badge check failed:', badgeError);
    }
  }

  return ok(res, { task, newly_earned_badges: newlyEarnedBadges });
}

// DELETE /api/tasks/:id
// (sessions linked to this task are kept; their task_id just becomes empty)
export async function deleteTask(req, res) {
  const { id } = req.params;
  if (!UUID_REGEX.test(id)) return fail(res, 400, 'Invalid task id');

  const { data, error } = await req.supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) return fail(res, 404, 'Task not found');

  return ok(res, { deleted: true });
}