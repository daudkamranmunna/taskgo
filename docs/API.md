# TaskGo API

Base URL: the backend server (local during development, Render URL after Step 5).
All routes under /api need the header `Authorization: Bearer <supabase access_token>`. Only /health is open.

## Response shape
- Success: `{ "data": ..., "error": null }`
- Failure: `{ "data": null, "error": { "message": "..." } }` with a proper HTTP status code
- Every endpoint below shows what goes inside `data`. This includes /health.

## Dates
The app sends its own local date as YYYY-MM-DD (`today`, `session_date`, `due_date`). The backend never guesses the date. `days_left` is computed by the backend from `today`: 0 = due today, 5 = in 5 days, -2 = overdue by 2 days.

## Endpoints

| Method | Path | Body / Query | Returns (inside data) |
|--------|------|--------------|---------|
| GET | /health | none | `{ status: "ok" }` |
| GET | /api/profile | none | `{ id, display_name, daily_goal_minutes }` |
| PUT | /api/profile | `{ display_name?, daily_goal_minutes? }` | updated profile |
| POST | /api/sessions | `{ subject, duration_seconds, started_at, session_date, task_id?, note? }` | `{ session, newly_earned_badges: [] }` (status 201) |
| PUT | /api/sessions/:id | `{ note }` | updated session |
| GET | /api/sessions | `?limit=50&offset=0` | list, newest first; each session has `task_title` (null if not linked) |
| DELETE | /api/sessions/:id | none | `{ deleted: true }` |
| GET | /api/tasks | `?status=open\|done\|all&today=YYYY-MM-DD` | sorted list, each with `days_left` (null if no due date). status defaults to open. `today` is required |
| POST | /api/tasks | `{ title, subject?, priority?, due_date?, note? }` | task (status 201) |
| PUT | /api/tasks/:id | `{ title?, subject?, priority?, due_date?, note?, is_done? }` | `{ task, newly_earned_badges: [] }` |
| DELETE | /api/tasks/:id | none | `{ deleted: true }` |
| GET | /api/tasks/upcoming | `?today=YYYY-MM-DD` | up to 3 open tasks with a due date, nearest first (overdue ones first, negative `days_left`), each with `days_left` |
| GET | /api/stats/today | `?today=YYYY-MM-DD` | `{ minutes_today, goal_minutes, goal_met, sessions_today }` |
| GET | /api/stats/streak | `?today=YYYY-MM-DD` | `{ current_streak, longest_streak, active_today, last_28_days: [{date, minutes, active}] }` (oldest day first) |
| GET | /api/stats/weekly | `?today=YYYY-MM-DD` | `{ days: [{date, minutes}] (7 days ending today), total_minutes, average_minutes, best_day: {date, minutes} }` |
| GET | /api/stats/xp | none | `{ xp, level, xp_into_level, xp_for_next_level, progress (0 to 1) }` |
| GET | /api/badges | none | all badges with `{ earned, earned_at }` |
| GET | /api/quotes/random | none | `{ text, author }` |

## Error replies
- 400: something the app sent is invalid (the message says what)
- 401: missing, invalid or expired login token
- 404: route not found, or the item does not exist (or is not the user's)
- 500: unexpected server error (the real error is only written to the server log)

## Rules
- Task sorting: open tasks first by due_date ascending (no date last), then priority (exam, high, medium, low); done tasks after, newest done first.
- Badges are checked right after a session is saved (types: sessions_count, streak, total_hours, goal_days) and right after a task is marked done (type: tasks_done). If the badge check fails, the session or task is still saved and `newly_earned_badges` is empty.
- When a task is marked done, `done_at` = now; when un-done, `done_at` = null.
- Studied minutes are always rounded DOWN to whole minutes. A day is active at 10 or more minutes.
- `best_day` is `{ date: null, minutes: 0 }` when nothing was studied in the last 7 days.
- XP = 1 per studied minute + 10 per active day + 15 per completed task + 25 per badge earned.
  Level = floor(sqrt(xp / 100)) + 1. The total XP needed to reach the next level is 100 x level^2.
  `xp_into_level` = XP earned inside the current level; `xp_for_next_level` = the size of the current level
  (100 x level^2 minus 100 x (level - 1)^2); `progress` = xp_into_level / xp_for_next_level.
- Custom timer minutes (1 to 600) are checked in the app only; no API change.