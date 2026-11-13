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
- Step 8 (api.js, Home, Profile): DONE
  - src/lib/api.js is the only file that calls the backend (70 second timeout for Render's slow wake-up)
  - Home: greeting, streak card, goal ring, Start Studying, up to 3 deadlines, quote; Profile: name, daily goal stepper, logout
- Step 9 (Tasks): DONE
  - app/(tabs)/tasks.js: Open/Done filter tabs, TaskItem rows (checkbox, subject and priority chips, note preview, deadline label, Start button, delete with confirmation), pull to refresh, floating + button, empty/loading/error states, badge popup when a completed task earns a badge
  - app/task-form.js: add or edit (title required, subject chips + custom text for "Other", priority selector, optional due date with the date picker and a clear button, optional note); edit mode gets the task fields through route params
  - Components added: TaskItem, BadgePopup (BadgePopup is reused by the Timer in Step 10)
  - utils/format.js now also has taskFormHref(task) (route to the edit form) and timerHref(task) (route to the Timer with params taskId, taskTitle, subject)
  - Home deadline rows open the task form
  - Tested on phone: add, edit, clear date, custom subject, delete, mark done and un-done, Task Starter badge popup on the 5th completed task, persistence after restart

## Deployment
- Public API URL (use as EXPO_PUBLIC_API_URL): PASTE-YOUR-RENDER-URL-HERE
- Free instance sleeps after 15 minutes without traffic; the first request afterwards takes 30 to 60 seconds. Open <URL>/health once before a demo to wake it up.
- Render redeploys automatically when new commits are pushed to main

## Current
- Step 10: Timer screen. Stopwatch + countdown presets 25/45/60 + custom countdown (1 to 600 whole minutes, CustomTimerModal), subject chips or the task's locked subject, timestamp-based time (Date.now()), keep screen awake, ringing notification scheduled for the exact end time via src/utils/alarm.js, vibration, "Time's up!", auto-save the session, optional note, "Mark this task as done?", BadgePopup
- The Timer receives optional route params taskId, taskTitle, subject (from the Tasks screen Start button)
- Exact next action: check what Expo Go supports for local notifications on the user's phone, then write src/utils/alarm.js first (permission, Android channel, schedule, cancel, vibrate), then the timer screen in small parts
- Test the ring with a 1 minute custom timer, both with the app open and with the app in the background

## Sample data in the database (REMOVE before the final demo)
- Inserted by SQL for the developer's own account: 4 study sessions (today, 1, 2 and 3 days ago, 20 to 40 minutes) and 3 sample tasks; plus tasks created while testing
- Because the sessions were inserted directly, no session badges were awarded yet. The next real session saved through the app will award first_session and streak_3.

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
- Stack screens outside the tabs (task-form now; history and badges later) must be declared inside the logged-in Stack.Protected group in app/_layout.js
- StreakCard shows "10 minutes" as plain text (display only); the backend decides what counts as an active day
- Home reloads on every focus but keeps the same quote until pull-to-refresh
- Task edit form gets the task through route params (there is no "get one task" endpoint)
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
- mobile/app/_layout.js, index.js, task-form.js, (auth)/_layout.js, login.js, register.js, (tabs)/_layout.js, home.js, tasks.js, profile.js (all real), timer.js, progress.js (placeholders)
- mobile/src/constants/theme.js, config.js
- mobile/src/lib/supabase.js, api.js
- mobile/src/context/AuthContext.js
- mobile/src/utils/date.js, format.js
- mobile/src/components/ScreenContainer.js, Card.js, Button.js, Input.js, LoadingView.js, EmptyState.js, ProgressRing.js, StreakCard.js, DeadlineCard.js, TaskItem.js, BadgePopup.js

## Env variable names (no secrets)
- Backend: PORT, SUPABASE_URL, SUPABASE_ANON_KEY
- Mobile: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL

## Hours used so far
- (17)