# TaskGo PROGRESS

## Completed
- Step 0 (tools and accounts): DONE
- Step 1 (structure, docs, GitHub): DONE
  - Repo: daudkamranmunna/taskgo, branch main
- Step 2 (Supabase): DONE
  - Project `taskgo`, email confirmation off, schema.sql and seed.sql run (6 tables, RLS on, 10 badges, 34 quotes)
- Step 3 (backend skeleton): DONE
- Step 4 (backend features): DONE
  - All endpoints in docs/API.md exist (profile, sessions, tasks, stats, streak, weekly, xp, badges, quotes)
  - Tested with fake data (streak maths, task sorting, XP levels) AND end to end with a real login token: every check passed (signup trigger, RLS, badges, streaks, deletes)
- Step 5 (deploy to Render): DONE
  - Render web service `taskgo-api`, free instance, root directory `backend`, build `npm install`, start `npm start`, health check path /health
  - Env vars set on Render: SUPABASE_URL, SUPABASE_ANON_KEY (PORT is set by Render)

## Deployment
- Public API URL (use as EXPO_PUBLIC_API_URL): PASTE-YOUR-RENDER-URL-HERE
- Free instance sleeps after 15 minutes without traffic; the first request afterwards takes 30 to 60 seconds. Open <URL>/health once before a demo to wake it up.
- Render redeploys automatically when new commits are pushed to main

## Current
- Step 6: Mobile skeleton (create the Expo app inside /mobile, install packages, theme, base components, 5-tab navigation with placeholder screens, run in Expo Go)
- Exact next action: create the Expo app with `npx create-expo-app@latest` inside ~/taskgo (Mobile terminal)

## Decisions / deviations
- Terminal in VS Code is Git Bash (bash), so use bash commands
- Project folder is ~/taskgo (user home folder), not inside OneDrive
- Supabase now gives a "publishable key" instead of an "anon key". We use the publishable key wherever the docs say "anon key". Env var names stay as in the master prompt. Never use the secret key.
- The signup trigger reads the display name from signup metadata key `display_name` (the mobile app must send it that way in Step 7). The trigger itself is verified working.
- /health returns the standard shape { data: { status: "ok" }, error: null }
- Studied minutes are rounded down everywhere; a day is active at 10+ minutes
- best_day is { date: null, minutes: 0 } when nothing was studied this week
- XP: xp_for_next_level means the size of the current level, so progress = xp_into_level / xp_for_next_level (documented in API.md)
- The GET /api/stats/xp handler lives in stats.controller.js, calculation in services/xp.service.js
- A VS Code Copilot suggestion sometimes shows grey text in the terminal; ignore it and press Ctrl+C
- Test blocks that start with `node --input-type=module <<'EOF'` must be run from ~/taskgo/backend

## Known bugs
- None known

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
- About 10 hours (planned for Steps 0 to 5: about 10)