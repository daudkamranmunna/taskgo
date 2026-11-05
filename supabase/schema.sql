-- TaskGo database schema (Supabase Postgres)
-- Run this once in the Supabase SQL Editor.

-- ============ TABLES ============

-- One profile per user (created automatically by the trigger below)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  daily_goal_minutes int not null default 60
    check (daily_goal_minutes between 5 and 720),
  created_at timestamptz not null default now()
);

-- Tasks the user wants to study for
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  subject text not null default 'General',
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'exam')),
  due_date date,
  note text,
  is_done boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now()
);

create index tasks_user_done_due_idx
  on public.tasks (user_id, is_done, due_date);

-- Every finished study session
create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  subject text not null default 'General',
  duration_seconds int not null check (duration_seconds > 0),
  session_date date not null,
  started_at timestamptz not null,
  note text,
  created_at timestamptz not null default now()
);

create index sessions_user_date_idx
  on public.study_sessions (user_id, session_date);

-- Catalog of achievement badges (filled by seed.sql)
create table public.badges (
  code text primary key,
  name text not null,
  description text not null,
  icon text not null,
  requirement_type text not null
    check (requirement_type in
      ('sessions_count', 'streak', 'total_hours', 'goal_days', 'tasks_done')),
  requirement_value int not null,
  sort_order int not null default 0
);

-- Which badges each user has earned
create table public.user_badges (
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_code text not null references public.badges (code) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_code)
);

-- Motivational quotes (filled by seed.sql)
create table public.quotes (
  id bigint generated always as identity primary key,
  text text not null,
  author text
);

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============

-- When a user signs up, make their profile row.
-- display_name comes from the signup metadata (key: display_name).
-- If it is missing, we use the part of the email before the @.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ ROW LEVEL SECURITY ============
-- RLS = each user can only touch their own rows.

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.study_sessions enable row level security;
alter table public.user_badges enable row level security;
alter table public.badges enable row level security;
alter table public.quotes enable row level security;

-- profiles (matched on id)
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles
  for delete to authenticated using (auth.uid() = id);

-- tasks (matched on user_id)
create policy "tasks_select_own" on public.tasks
  for select to authenticated using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks
  for insert to authenticated with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks
  for delete to authenticated using (auth.uid() = user_id);

-- study_sessions (matched on user_id)
create policy "sessions_select_own" on public.study_sessions
  for select to authenticated using (auth.uid() = user_id);
create policy "sessions_insert_own" on public.study_sessions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "sessions_update_own" on public.study_sessions
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sessions_delete_own" on public.study_sessions
  for delete to authenticated using (auth.uid() = user_id);

-- user_badges (matched on user_id)
create policy "user_badges_select_own" on public.user_badges
  for select to authenticated using (auth.uid() = user_id);
create policy "user_badges_insert_own" on public.user_badges
  for insert to authenticated with check (auth.uid() = user_id);
create policy "user_badges_update_own" on public.user_badges
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_badges_delete_own" on public.user_badges
  for delete to authenticated using (auth.uid() = user_id);

-- badges and quotes: any logged-in user can read, nobody can change
create policy "badges_select_authenticated" on public.badges
  for select to authenticated using (true);
create policy "quotes_select_authenticated" on public.quotes
  for select to authenticated using (true);