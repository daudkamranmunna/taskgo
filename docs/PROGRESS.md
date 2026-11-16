# TaskGo PROGRESS

## Completed
- Steps 0 to 5: DONE (tools, GitHub, Supabase schema + seed, backend skeleton, all backend endpoints, Render deployment)
  - Repo: daudkamranmunna/taskgo, branch main
  - Backend tested with fake data AND end to end with a real login token (all checks passed)
- Step 6 (mobile skeleton): DONE
- Step 7 (auth): DONE (supabase.js, AuthContext, login/register, route guard with Stack.Protected, session persists across full restarts)
- Step 8 (api.js, Home, Profile): DONE
- Step 9 (Tasks): DONE (list, add/edit form with date picker, mark done, delete, badge popup)
- Step 10 (Timer): DONE (stopwatch + countdowns, custom minutes, ringing alarm via alarm.js, session saving, note, "Mark this task as done?", badges)
- Step 11 (Progress, History, Badges): DONE
  - Progress: weekly BarChart (plain views), Total / Daily average / Best day cards, 28-day StreakCalendar (weeks Monday to Sunday), buttons to History and Badges
  - History (app/history.js): sessions grouped by day with day totals, linked task title and note, delete with confirmation, Load more after 50 sessions
  - Badges (app/badges.js): grid of all badges, earned colored with date, locked gray with requirement; opened from Progress and Profile
  - STRETCH done: XPBar (src/components/XPBar.js) on Home (below the streak card) and Profile (with a "how to earn XP" note); uses GET /api/stats/xp; hidden if XP fails to load (optional on both screens)
  - All checked on the phone against Supabase data

=== PHASE 1 COMPLETE (about 80%) ===

## Deployment
- Public API URL (use as EXPO_PUBLIC_API_URL): PASTE-YOUR-RENDER-URL-HERE
- Free instance sleeps after 15 minutes without traffic; the first request afterwards takes 30 to 60 seconds. Open <URL>/health once before a demo to wake it up.
- Render redeploys automatically when new commits are pushed to main

## Current
- PHASE 2, Step 12: full Notes screen. Update ALL docs first (docs/DATABASE.md, docs/API.md, docs/STRUCTURE.md, supabase/schema.sql), then run the new SQL in Supabase, then backend (routes/controller), then the mobile screens. Do not build before the design is confirmed with the user.
- Then Step 13 dark mode, Step 14 polish (+ remove sample data), Step 15 README + optional APK + demo checklist

## Phase 2 plan
- Step 12: full Notes screen (new notes table, endpoints, files: update all docs first)
- Step 13: dark mode (colors live in src/constants/theme.js; components import fixed colors today, so each screen needs updating)
- Step 14: polish (loading/empty/error states everywhere, haptics, small animations, app icon + splash + app name TaskGo, validation, bug fixing, remove the sample data)
- Step 15: final README (description, features, tech, setup, screenshots), final docs, optional Android APK via EAS, demo checklist for the teacher, final push

## Known limitations (explain honestly in the README)
- The running timer lives in the app's memory. If the app is swiped away completely while a timer runs, that session is lost (a scheduled alarm still rings). Backgrounding and locking the phone are fine.
- A session whose countdown ended while the app was in the background is saved when the user opens the app again (with the planned duration).
- In Expo Go on the developer's Xiaomi Redmi Note 11 Pro, creating the custom Android notification channel fails (native NullPointerException). alarm.js falls back to Expo Go's default channel. For the ring to have sound the user enabled sound for Expo Go's notification category in the phone settings; vibration while the app is in the background depends on that category's vibration setting.
- Expo Go cannot use custom notification sounds; a standalone build (optional APK, Step 15) would be needed.
- The free Render server sleeps; the first request can take up to a minute.

## Sample data in the database (REMOVE before the final demo)
- Inserted by SQL for the developer's own account: 4 study sessions (today, 1, 2 and 3 days ago) and 3 sample tasks; plus sessions and tasks created while testing

## Decisions / deviations
- Terminal in VS Code is Git Bash (bash), so use bash commands
- Project folder is ~/taskgo (user home folder), not inside OneDrive
- Supabase now gives a "publishable key" instead of an "anon key". We use the publishable key wherever the docs say "anon key". Env var names stay as in the master prompt. Never use the secret key.
- The signup trigger reads the display name from signup metadata key `display_name`; verified working from the app
- /health returns the standard shape { data: { status: "ok" }, error: null }
- Studied minutes are rounded down everywhere; a day is active at 10+ minutes
- best_day is { date: null, minutes: 0 } when nothing was studied this week
- XP: xp_for_next_level means the size of the current level, so progress = xp_into_level / xp_for_next_level (documented in API.md)
- There are THREE _layout.js files: app/_layout.js (root, with the route guard), app/(tabs)/_layout.js (tab bar), app/(auth)/_layout.js (plain Stack). Do not mix them up.
- Stack screens outside the tabs (task-form, history, badges) are declared inside the logged-in Stack.Protected group in app/_layout.js; any new one (for example the notes screens) must be added there
- Task edit form gets the task through route params (there is no "get one task" endpoint)
- A session's session_date is the phone's local date when the session STARTED
- StreakCard shows "10 minutes" as plain text (display only); the backend decides what counts as an active day
- Dark mode is planned for Phase 2, Step 13. Colors live in src/constants/theme.js.
- After changing mobile/.env, restart Expo with `npx expo start -c`
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
- mobile/app/_layout.js, index.js, task-form.js, history.js, badges.js, (auth)/_layout.js, login.js, register.js, (tabs)/_layout.js, home.js, tasks.js, timer.js, progress.js, profile.js (all real)
- mobile/src/constants/theme.js, config.js
- mobile/src/lib/supabase.js, api.js
- mobile/src/context/AuthContext.js
- mobile/src/utils/date.js, format.js, alarm.js
- mobile/src/components/ScreenContainer.js, Card.js, Button.js, Input.js, LoadingView.js, EmptyState.js, ProgressRing.js, StreakCard.js, DeadlineCard.js, TaskItem.js, BadgePopup.js, CustomTimerModal.js, BarChart.js, StreakCalendar.js, SessionItem.js, BadgeItem.js, XPBar.js

## Env variable names (no secrets)
- Backend: PORT, SUPABASE_URL, SUPABASE_ANON_KEY
- Mobile: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL

## Hours used so far
- About 25 hours (Phase 1 planned: about 30)