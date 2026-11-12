# TaskGo PROGRESS

## Completed
- Step 0 (tools and accounts): DONE
- Step 1 (structure, docs, GitHub): DONE
  - Repo: daudkamranmunna/taskgo, branch main
- Step 2 (Supabase): DONE
  - Project `taskgo`, email confirmation off, schema.sql and seed.sql run (6 tables, RLS on, 10 badges, 34 quotes)
- Step 3 (backend skeleton): DONE
  - Express app, .env handling, response helpers, error handler, /health, auth middleware (401 without token)
- Step 4 (backend features): DONE (code written; real-database test still to do)
  - A: profile + sessions. B: stats + streak (utils/dates.js, streak.service.js, stats.service.js). C: badges service, badges + quotes endpoints, badge check after saving a session. D: tasks (list, upcoming, create, update, delete, sorting, days_left, badge check when a task is marked done). E: xp.service.js + GET /api/stats/xp
  - Tested with fake data (no database): streak maths incl. edge cases, task sorting, date helpers, XP levels
  - All routes return 401 without a token

## Current
- Finish Step 4: commit and push, then an end-to-end test with a real login token (recommended before the app is built)
- Then Step 5: deploy the backend to Render

## Decisions / deviations
- Terminal in VS Code is Git Bash (bash), so use bash commands
- Project folder is ~/taskgo (user home folder), not inside OneDrive
- The mobile/ folder is NOT created yet (Expo creates it in Step 6)
- Supabase now gives a "publishable key" instead of an "anon key". We use the publishable key wherever the docs say "anon key". Env var names stay as in the master prompt. Never use the secret key.
- The signup trigger reads the display name from signup metadata key `display_name` (the mobile app must send it that way in Step 7)
- Profile trigger not yet tested with a real signup (retest in Step 7)
- /health returns the standard shape { data: { status: "ok" }, error: null }
- Studied minutes are rounded down everywhere; a day is active at 10+ minutes
- best_day is { date: null, minutes: 0 } when nothing was studied this week
- XP: xp_for_next_level means the size of the current level, so progress = xp_into_level / xp_for_next_level (documented in API.md)
- The GET /api/stats/xp handler lives in stats.controller.js (no separate xp controller), calculation in services/xp.service.js
- A VS Code Copilot suggestion sometimes shows grey text in the terminal; ignore it and press Ctrl+C
- Test blocks that start with `node --input-type=module <<'EOF'` must be run from ~/taskgo/backend

## Known bugs
- None known. Database-reading code (stats, badges, sessions, tasks) has not yet been tested with real data.

## Existing files
- .gitignore, README.md
- docs/MASTER_PROMPT.md, PROGRESS.md, API.md, DATABASE.md, STRUCTURE.md
- supabase/schema.sql, supabase/seed.sql
- backend/package.json, package-lock.json, .env (not committed), .env.example
- backend/src/index.js, app.js
- backend/src/config/env.js
- backend/src/lib/supabase.js
- backend/src/middleware/auth.js, errorHandler.js
- backend/src/utils/response.js, dates.js
- backend/src/routes/index.js, profile.routes.js, sessions.routes.js, tasks.routes.js, stats.routes.js, badges.routes.js, quotes.routes.js
- backend/src/controllers/profile.controller.js, sessions.controller.js, tasks.controller.js, stats.controller.js, badges.controller.js, quotes.controller.js
- backend/src/services/streak.service.js, stats.service.js, badges.service.js, xp.service.js

## Env variable names (no secrets)
- Backend: PORT, SUPABASE_URL, SUPABASE_ANON_KEY
- Mobile (Step 6): EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL

## Hours used so far
- (fill in your real number)