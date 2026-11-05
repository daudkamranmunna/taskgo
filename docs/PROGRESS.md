# TaskGo PROGRESS

## Completed
- Step 0 (tools and accounts): DONE (about 25 minutes)
  - Windows, Node.js LTS, Git, VS Code, Expo Go installed and verified
  - Git name/email configured
  - Accounts: GitHub, Supabase, Render
- Step 1 (structure, docs, GitHub): DONE
  - Folder ~/taskgo created, git initialised (branch main), .gitignore
  - docs/: MASTER_PROMPT.md, PROGRESS.md, API.md, DATABASE.md, STRUCTURE.md
  - README.md, first commit "Step 1: project structure and docs", pushed to GitHub repo `taskgo`

## Current
- Step 2: Supabase. Create the project, turn off email confirmation, run schema.sql + seed.sql, verify tables and RLS, collect keys
- Exact next action: create supabase/schema.sql and supabase/seed.sql

## Decisions / deviations
- Terminal in VS Code is Git Bash (bash), so use bash commands
- Project folder is ~/taskgo (user home folder), not inside OneDrive
- The mobile/ folder is NOT created yet (Expo creates it in Step 6)

## Known bugs
- None

## Existing files
- .gitignore
- README.md
- docs/MASTER_PROMPT.md, PROGRESS.md, API.md, DATABASE.md, STRUCTURE.md
- (empty folders: backend, supabase)

## Env variable names (no secrets)
- None yet (coming in Step 2: SUPABASE_URL and SUPABASE_ANON_KEY for the backend; EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL for mobile)

## Hours used so far
- About 1 hour 