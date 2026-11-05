# TaskGo Database (Supabase Postgres)

The final SQL lives in `supabase/schema.sql` and `supabase/seed.sql`. This file explains it in plain words.

## Tables

### profiles
- id (uuid, primary key, links to auth.users, deleted if the user is deleted)
- display_name (text)
- daily_goal_minutes (int, default 60, allowed 5 to 720)
- created_at (timestamp)
A row is created automatically by a trigger when a user signs up.

### tasks
- id (uuid, primary key)
- user_id (uuid, owner, required)
- title (text, required)
- subject (text, default 'General')
- priority (text: low, medium, high, exam; default medium)
- due_date (date, optional)
- note (text, optional)
- is_done (boolean, default false)
- done_at (timestamp, optional)
- created_at (timestamp)
Index on (user_id, is_done, due_date).

### study_sessions
- id (uuid, primary key)
- user_id (uuid, owner, required)
- task_id (uuid, optional, links to tasks; set to null if the task is deleted)
- subject (text, default 'General')
- duration_seconds (int, must be greater than 0)
- session_date (date, the user's local date)
- started_at (timestamp)
- note (text, optional)
- created_at (timestamp)
Index on (user_id, session_date).

### badges (catalog, seeded)
- code (text, primary key)
- name, description, icon (Ionicons name)
- requirement_type (sessions_count, streak, total_hours, goal_days, tasks_done)
- requirement_value (int)
- sort_order (int)

Seeded badges: first_session, streak_3, streak_7, streak_14, streak_30, total_10h, total_50h, goal_days_5, tasks_5, tasks_25.

### user_badges
- user_id (uuid), badge_code (text, links to badges), earned_at (timestamp)
- Primary key (user_id, badge_code), so a badge can be earned only once.

### quotes (seeded with 30+ quotes)
- id (bigint, identity, primary key)
- text (text, required)
- author (text, optional)

## Security (Row Level Security)
RLS is ON for every table.
- profiles, tasks, study_sessions, user_badges: a user can select, insert, update and delete only their own rows.
- badges and quotes: logged-in users can read them.

## No XP table
XP is calculated by the backend from existing data (see rules in API.md and the master prompt).