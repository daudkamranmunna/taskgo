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
- Step 6 (mobile skeleton): DONE
- Step 7 (auth): DONE
  - supabase.js, AuthContext, login/register, route guard (Stack.Protected), session persists across full restarts
- Step 8 (api.js, Home, Profile): DONE
  - src/lib/api.js: the only file that calls the backend; one function per endpoint; attaches the Bearer token; 70 second timeout (Render free server wakes slowly); throws Error with a readable message
  - supabase.js has getAccessToken() (used by api.js)
  - src/utils/date.js (todayString, shortWeekday, formatShortDate, deadlineLabel, isOverdue), src/utils/format.js (formatMinutes, formatClock)
  - Components added: ProgressRing (60 rotated bars, no chart library), StreakCard, DeadlineCard
  - Home screen: greeting, streak card, today's goal ring, Start Studying button (opens Timer tab), up to 3 deadlines (tap opens Tasks tab for now), random quote; pull to refresh; reloads when the tab is focused; loading, error and retry states
  - Profile screen: name, email, daily goal stepper (5 min to 12 h) saved through the API, about text, version, logout with confirmation
  - Tested on phone with sample data: streak 4, goal ring 30 of 60 min, 3 deadlines (overdue, today, in 5 days)

## Deployment
- Public API URL (use as EXPO_PUBLIC_API_URL): PASTE-YOUR-RENDER-URL-HERE
- Free instance sleeps after 15 minutes without traffic; the first request afterwards takes 30 to 60 seconds. Open <URL>/health once before a demo to wake it up.
- Render redeploys automatically when new commits are pushed to main

## Current
- Step 9: Tasks screen + task-form + TaskItem + deadline labels + mark done (with the badge popup)
- Exact next action: create src/components/TaskItem.js and BadgeItem/BadgePopup as needed, then app/(tabs)/tasks.js and app/task-form.js. Declare task-form inside the logged-in Stack.Protected group in app/_layout.js. Then change the Home deadline tap to open the task form.

## Sample data in the database (REMOVE before the final demo)
- Inserted by SQL for the developer's own account: 4 study sessions (today, 1, 2 and 3 days ago, 20 to 40 minutes) and 3 tasks (Physics exam in 5 days, Math assignment due today, Old lab report overdue by 2 days)
- Because they were inserted directly, no badges were awarded. The next real session saved through the app will award first_session and streak_3 (streak is 4)

## Decisions / deviations
- Terminal in VS Code is Git Bash (bash), so use bash commands
- Project folder is ~/taskgo (user home folder), not inside OneDrive
- Supabase now gives a "publishable key" instead of an "anon key". We use the publishable key wherever the docs say "anon key". Env var names stay as in the master prompt. Never use the secret key.
- The signup trigger reads the display name from signup metadata key `display_name`; verified working from the app
- /health returns the standard shape { data: { status: "ok" }, error: null }
- Studied minutes are rounded down everywhere; a day is active at 10+ minutes
- best_day is { date: null, minutes: 0 } when nothing was studied this week
- XP: xp_for_next_level means the size of the current level, so progress = xp_into_level / xp_for_next_level (documented in API.md)
- The Expo starter put screens in mobile/src/app; we moved them to mobile/app. There are THREE _layout.js files: app/_layout.js (root, with the route guard), app/(tabs)/_layout.js (tab bar), app/(auth)/_layout.js (plain Stack). Do not mix them up.
- When new stack screens are added (task-form, history, badges), they must be declared inside the logged-in Stack.Protected group in app/_layout.js
- StreakCard shows "10 minutes" as plain text (display only); the backend decides what counts as an active day
- Home reloads on every focus but keeps the same quote until pull-to-refresh
- TypeScript leftovers from the starter (tsconfig.json, expo-env.d.ts) are kept; all our code is plain JavaScript (listed in docs/STRUCTURE.md)
- After changing mobile/.env, restart Expo with `npx expo start -c`
- Dark mode is planned for Phase 2, Step 13. Colors live in src/constants/theme.js.
- A VS Code Copilot suggestion sometimes shows grey text in the terminal; ignore it and press Ctrl+C
- Backend test blocks that start with `node --input-type=module <<'EOF'` must be run from ~/taskgo/backend
- Two terminals are in use: the Expo terminal (stays busy) and a free terminal for other commands
- The user's time zone is Asia/Dhaka; SQL that creates sample dates should use (now() at time zone 'Asia/Dhaka')::date

## Known bugs
- None known

## Existing files
- .gitignore, README.md
- docs/MASTER_PROMPT.md, PROGRESS.md, API.md, DATABASE.md, STRUCTURE.md
- supabase/schema.sql, supabase/seed.sql
- backend/: package.json, package-lock.json, .env (not committed), .env.example, and all files in src/ listed in docs/STRUCTURE.md
- mobile/: package.json, app.json, .env (not committed), .env.example, plus Expo starter files listed in docs/STRUCTURE.md
- mobile/app/_layout.js, index.js, (auth)/_layout.js, login.js, register.js, (tabs)/_layout.js, home.js, profile.js (real), tasks.js, timer.js, progress.js