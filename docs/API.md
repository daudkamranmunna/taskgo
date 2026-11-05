# TaskGo API

Base URL: the backend server (local during development, Render URL after Step 5).
All routes under /api need the header `Authorization: Bearer <supabase access_token>`. Only /health is open.

## Response shape
- Success: `{ "data": ..., "error": null }`
- Failure: `{ "data": null, "error": { "message": "..." } }` with a proper HTTP status code

## Dates
The app sends its own local date as YYYY-MM-DD (`today`, `session_date`, `due_date`). The backend never guesses the date. `days_left` is computed by the backend from `today` (negative = overdue).

## Endpoints

| Method | Path | Body / Query | Returns |
|--------|------|--------------|---------|
| GET | /health | none | `{ status: "ok" }` |
| GET | /api/profile | none | `{ id, display_name, daily_goal_minutes }` |
| PUT | /api/profile | `{ display_name?, daily_goal_minutes? }` | updated profile |
| POST | /api/sessions | `{ subject, duration_seconds, started_at, session_date, task_id?, note? }` | `{ session, newly_earned_badges: [] }` |
| PUT | /api/sessions/:id | `{ note }` | updated session |
| GET | /api/sessions | `?limit=50&offset=0` | list, newest first (includes linked task title) |
| DELETE | /api/sessions/:id | none | `{ deleted: true }` |
| GET | /api/tasks | `?status=open\|done\|all&today=YYYY-MM-DD` | sorted list, each with `days_left` (null if no due date) |
| POST | /api/tasks | `{ title, subject?, priority?, due_date?, note? }` | task |
| PUT | /api/tasks/:id | `{ title?, subject?, priority?, due_date?, note?, is_done? }` | `{ task, newly_earned_badges: [] }` |
| DELETE | /api/tasks/:id | none | `{ deleted: true }` |
| GET | /api/tasks/upcoming | `?today=YYYY-MM-DD` | up to 3 open tasks with a due date, nearest first, each with `days_left` |
| GET | /api/stats/today | `?today=YYYY-MM-DD` | `{ minutes_today, goal_minutes, goal_met, sessions_today }` |
| GET | /api/stats/streak | `?today=YYYY-MM-DD` | `{ current_streak, longest_streak, active_today, last_28_days: [{date, minutes, active}] }` |
| GET | /api/stats/weekly | `?today=YYYY-MM-DD` | `{ days: [{date, minutes}] (7 days), total_minutes, average_minutes, best_day: {date, minutes} }` |
| GET | /api/stats/xp | none | `{ xp, level, xp_into_level, xp_for_next_level, progress (0 to 1) }` |
| GET | /api/badges | none | all badges with `{ earned, earned_at }` |
| GET | /api/quotes/random | none | `{ text, author }` |

## Rules
- Task sorting: open tasks first by due_date ascending (no date last), then priority (exam, high, medium, low); done tasks after, newest done first.
- Badges are checked right after a session is saved and right after a task is marked done.
- When a task is marked done, `done_at` = now; when un-done, `done_at` = null.
- Custom timer minutes (1 to 600) are checked in the app only; no API change.