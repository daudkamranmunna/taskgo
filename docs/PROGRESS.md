# TaskGo PROGRESS

## Completed
- Step 0 (tools and accounts): DONE
- Step 1 (structure, docs, GitHub): DONE
  - Repo: daudkamranmunna/taskgo, branch main
- Step 2 (Supabase): DONE
  - Project `taskgo`, email confirmation off, schema.sql and seed.sql run (6 tables, RLS on, 10 badges, 34 quotes)
- Step 3 (backend skeleton): DONE
  - backend/ is a Node ES-module project (express, cors, dotenv, @supabase/supabase-js)
  - .env (not committed) and .env.example, src/config/env.js
  - utils/response.js (ok, fail), middleware/errorHandler.js (404 + 500)
  - GET /health works; everything under /api needs a Bearer token (middleware/auth.js)
  - lib/supabase.js: createAnonClient(), createUserClient(token)
  - Tested: /health -> status ok; /api/profile without token -> 401

## Current
- Step 4: Backend features in parts: (A) profile + sessions, (B) stats + streak service, (C) badges service + quotes, (D) tasks + upcoming + days_left, (E) xp service + endpoint
- Exact next action: Step 4, Part A (profile and sessions routes, controllers)

## Decisions / deviations
- Terminal in VS Code is Git Bash (bash), so use bash commands
- Project folder is ~/taskgo (user home folder), not inside OneDrive
- The mobile/ folder is NOT created yet (Expo creates it in Step 6)
- Supabase now gives a "publishable key" instead of an "anon key". We use the publishable key wherever the docs say "anon key". Env var names stay as in the master prompt. Never use the secret key.
- The signup trigger reads the display name from signup metadata key `display_name` (the mobile app must send it that way in Step 7)
- Profile trigger not yet tested with a real signup (retest in Step 7)
- /health now returns the standard shape { data: { status: "ok" }, error: null } (docs/API.md updated)
- Server runs with `npm run dev` from ~/taskgo/backend (the terminal stays busy; open a second terminal for other commands)
- A VS Code Copilot suggestion sometimes shows grey text in the terminal; ignore it and press Ctrl+C

## Known bugs
- None

## Existing files
- .gitignore, README.md
- docs/MASTER_PROMPT.md, PROGRESS.md, API.md, DATABASE.md, STRUCTURE.md
- supabase/schema.sql, supabase/seed.sql
- backend/package.json, package-lock.json, .env (not committed), .env.example
- backend/src/index.js, app.js
- backend/src/config/env.js
- backend/src/lib/supabase.js
- backend/src/middleware/auth.js, errorHandler.js
- backend/src/utils/response.js
- backend/src/routes/index.js
- (empty folders: backend/src/controllers, backend/src/services)

## Env variable names (no secrets)
- Backend: PORT, SUPABASE_URL, SUPABASE_ANON_KEY
- Mobile (Step 6): EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL

## Hours used so far
- (fill in your real number)