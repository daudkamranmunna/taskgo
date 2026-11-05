# TaskGo PROGRESS

## Completed
- Step 0 (tools and accounts): DONE
  - Windows, Node.js LTS, Git, VS Code, Expo Go installed and verified
  - Git name/email configured
  - Accounts: GitHub, Supabase, Render
- Step 1 (structure, docs, GitHub): DONE
  - Folder ~/taskgo, git (branch main), .gitignore, README.md
  - docs/: MASTER_PROMPT.md, PROGRESS.md, API.md, DATABASE.md, STRUCTURE.md
  - Pushed to GitHub repo daudkamranmunna/taskgo
- Step 2 (Supabase): DONE
  - Supabase project `taskgo` created, email confirmation turned off
  - supabase/schema.sql run: 6 tables, indexes, RLS policies, profile trigger
  - supabase/seed.sql run: 10 badges, 34 quotes
  - RLS verified true on all 6 tables
  - Publishable key and project URL located (values are NOT stored in this file)

## Current
- Step 3: Backend skeleton (npm init, packages, .env, /health, auth middleware, response helpers, error handler)
- Exact next action: create backend/package.json with npm init, then install express, cors, dotenv, @supabase/supabase-js

## Decisions / deviations
- Terminal in VS Code is Git Bash (bash), so use bash commands
- Project folder is ~/taskgo (user home folder), not inside OneDrive
- The mobile/ folder is NOT created yet (Expo creates it in Step 6)
- Supabase now gives a "publishable key" instead of an "anon key". We use the publishable key wherever the docs say "anon key". Env var names stay as in the master prompt. Never use the secret key.
- The signup trigger reads the display name from signup metadata key `display_name` (the mobile app must send it that way in Step 7)
- Email confirmation toggle was found on the Sign In / Providers main page (not inside the Email panel)
- Profile trigger not yet tested with a real signup (retest in Step 7)

## Known bugs
- None

## Existing files
- .gitignore
- README.md
- docs/MASTER_PROMPT.md, PROGRESS.md, API.md, DATABASE.md, STRUCTURE.md
- supabase/schema.sql, supabase/seed.sql
- (empty folder: backend)

## Env variable names (no secrets)
- Backend: SUPABASE_URL, SUPABASE_ANON_KEY, PORT (to be created in Step 3)
- Mobile: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL (Step 6)

## Hours used so far
- (fill in your real number)