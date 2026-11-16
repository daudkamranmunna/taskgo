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
- Step 9 (Tasks): DONE
  - Tasks list, task-form (add/edit), TaskItem, BadgePopup
- Step 10 (Timer): DONE
  - src/utils/alarm.js: ALL ringing logic (permission, Android channel with three fallback setups, scheduleTimerEnd, cancelTimerEnd, vibrateAlarm, getLastAlarmError, getChannelInfo)
  - src/components/CustomTimerModal.js: whole minutes from 1 to 600, friendly errors, quick chips; exports parseCustomMinutes
  - app/(tabs)/timer.js: stopwatch and countdowns (25 / 45 / 60 / custom), subject chips or the task's locked subject (route params taskId, taskTitle, subject), time from Date.now() timestamps, screen kept awake while running, alarm scheduled for the exact end time, pause cancels it and resume re-schedules the remaining time, finish early cancels it, "Time's up!" with vibration when the app is open, sessions under 1 minute are not saved
  - After a session: it saves automatically (POST /api/sessions), a retry button appears if it fails (no duplicate saves), optional note (PUT /api/sessions/:id), "Mark this task as done?" for task sessions, BadgePopup for session and task badges
  - Tested on the phone: countdown, stopwatch, pause/resume, early finish, task link, notes, badges, failed save + retry, ring with the app open, in the background and with the phone locked, pause/finish cancelling the ring

## Deployment
- Public API URL (use as EXPO_PUBLIC_API_URL): PASTE-YOUR-RENDER-URL-HERE
- Free instance sleeps after 15 minutes without traffic; the first request afterwards takes 30 to 60 seconds. Open <URL>/health once before a demo to wake it up.
- Render redeploys automatically when new commits are pushed to main

## Current
- Step 11: History + Progress + Badges screens
  - app/history.js (stack screen, opened from Progress): sessions grouped by date with daily totals, linked task title and note, delete with confirmation, pull to refresh
  - app/(tabs)/progress.js: weekly bar chart (BarChart, plain Views), total / average / best day cards, 28-day streak calendar (StreakCalendar), buttons to History and Badges
  - app/badges.js (stack screen, opened from Progress and Profile): grid of all badges (BadgeItem), earned ones colored, locked ones gray with their requirement
  - New components: BarChart, StreakCalendar, SessionItem, BadgeItem. history and badges must be declared inside the logged-in Stack.Protected group in app/_layout.js
  - STRETCH only if on schedule: XPBar on Home and Profile (GET /api/stats/xp already exists)
- Exact next action: BarChart + the Progress screen first, then History, then Badges

## Known limitations (explain honestly in the README)
- The running timer lives in the app's memory. If the app is swiped away completely while a timer runs, that session is lost (a scheduled alarm still rings). Backgrounding and locking the phone are fine.
- A session whose countdown ended while the app was in the background is saved when the user opens the app again (with the planned duration).
- In Expo Go on the developer's Xiaomi Redmi Note 11 Pro, creating the custom Android notification channel fails (native NullPointerException). alarm.js falls back to Expo Go's default channel. For the ring to have sound the user enabled sound for Expo Go's notification category in the phone settings; vibration while the app is in the background depends on that category's vibration setting.
- Expo Go cannot use custom notification sounds; a standalone build (optional APK, Step 15) would be needed.

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
- Stack screens outside the tabs (task-form now; history and badges next) must be declared inside the logged-in Stack.Protected group in app/_layout.js
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
- mobile/app/_layout.js, index.js, task-form.js, (auth)/_layout.js, login.js, register.js, (tabs)/_layout.js, home.js, tasks.js, timer.js, profile.js (all real), progress.js (placeholder)
- mobile/src/constants/theme.js, config.js
- mobile/src/lib/supabase.js, api.js
- mobile/src/context/AuthContext.js
- mobile/src/utils/date.js, format.js, alarm.js
- mobile/src/components/ScreenContainer.js, Card.js, Button.js, Input.js, LoadingView.js, EmptyState.js, ProgressRing.js, StreakCard.js, DeadlineCard.js, TaskItem.js, BadgePopup.js, CustomTimerModal.js

## Env variable names (no secrets)
- Backend: PORT, SUPABASE_URL, SUPABASE_ANON_KEY
- Mobile: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL

## Hours used so far
- (24 hours)