# TaskGo PROGRESS

## Completed
- Step 0 (tools and accounts): DONE
- Step 1 (structure, docs, GitHub): DONE
  - Repo: daudkamranmunna/taskgo, branch main
- Step 2 (Supabase): DONE
  - Project `taskgo`, email confirmation off, schema.sql and seed.sql run (6 tables, RLS on, 10 badges, 34 quotes)
- Step 3 (backend skeleton): DONE
- Step 4 (backend features): DONE
  - All endpoints in docs/API.md exist; tested with fake data AND end to end with a real login token (all checks passed)
- Step 5 (deploy to Render): DONE
  - Render web service `taskgo-api`, free instance, root directory `backend`, health check /health
- Step 6 (mobile skeleton): DONE
  - Expo app in /mobile (Expo Router, plain JavaScript screens), runs in Expo Go on the phone
  - 8 packages installed: supabase-js, async-storage, url-polyfill, keep-awake, haptics, notifications, vector-icons, datetimepicker
  - src/constants/theme.js and config.js
  - Base components: ScreenContainer, Card, Button, Input, LoadingView, EmptyState
  - 5 bottom tabs (Home, Tasks, Timer, Progress, Profile) with placeholder screens

## Deployment
- Public API URL (use as EXPO_PUBLIC_API_URL): (https://taskgo-api.onrender.com)
- Free instance sleeps after 15 minutes without traffic; the first request afterwards takes 30 to 60 seconds. Open <URL>/health once before a demo to wake it up.
- Render redeploys automatically when new commits are pushed to main

## Current
- Step 7: Auth (supabase client, AuthContext, login/register screens, route guard, logout, session persistence). Most careful step; test thoroughly.
- Exact next action: create mobile/.env with the three EXPO_PUBLIC_ values (Supabase URL, publishable key, Render API URL), then write src/lib/supabase.js

## Decisions / deviations
- Terminal in VS Code is Git Bash (bash), so use bash commands
- Project folder is ~/taskgo (user home folder), not inside OneDrive
- Supabase now gives a "publishable key" instead of an "anon key". We use the publishable key wherever the docs say "anon key". Env var names stay as in the master prompt. Never use the secret key.
- The signup trigger reads the display name from signup metadata key `display_name` (the mobile app must send it that way in Step 7). The trigger itself is verified working.
- /health returns the standard shape { data: { status: "ok" }, error: null }
- Studied minutes are rounded down everywhere; a day is active at 10+ minutes
- best_day is { date: null, minutes: 0 } when nothing was studied this week
- XP: xp_for_next_level means the size of the current level, so progress = xp_into_level / xp_for_next_level (documented in API.md)
- The Expo starter put screens in mobile/src/app; we moved them to mobile/app. There are TWO _layout.js files: app/_layout.js (root Stack) and app/(tabs)/_layout.js (tab bar). Do not mix them up.
- TypeScript leftovers from the starter (tsconfig.json, expo-env.d.ts) are kept; all our code is plain JavaScript (listed in docs/STRUCTURE.md)
- After changing mobile/.env, restart Expo with `npx expo start -c`
- A VS Code Copilot suggestion sometimes shows grey text in the terminal; ignore it and press Ctrl+C
- Backend test blocks that start with `node --input-type=module <<'EOF'` must be run from ~/taskgo/backend
- Two terminals are in use: server/Expo terminal (stays busy) and a free terminal for other commands

## Known bugs
- None known

## Existing files
- .gitignore, README.md
- docs/MASTER_PROMPT.md, PROGRESS.md, API.md, DATABASE.md, STRUCTURE.md
- supabase/schema.sql, supabase/seed.sql
- backend/: package.json, package-lock.json, .env (not committed), .env.example, and all files in src/ listed in docs/STRUCTURE.md (index.js, app.js, config, lib, middleware, utils, routes, controllers, services)
- mobile/: package.json, app.json, .env.example (no .env yet), plus Expo starter files listed in docs/STRUCTURE.md
- mobile/app/_layout.js, index.js (redirects to /(tabs)/home), (tabs)/_layout.js, home.js, tasks.js, timer.js, progress.js, profile.js
- mobile/src/constants/theme.js, config.js
- mobile/src/components/ScreenContainer.js, Card.js, Button.js, Input.js, LoadingView.js, EmptyState.js

## Env variable names (no secrets)
- Backend: PORT, SUPABASE_URL, SUPABASE_ANON_KEY
- Mobile: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL

## Hours used so far
- (12 hours)