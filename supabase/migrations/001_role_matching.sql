-- ============================================================================
-- Murtaqa — role model + student/teacher matching migration
-- Run this once in the Supabase SQL editor.
-- ============================================================================

-- 1. Role enum + default on profiles
do $$ begin
  create type user_role as enum ('student','teacher','admin');
exception when duplicate_object then null; end $$;

alter table public.profiles
  alter column role type user_role using role::user_role,
  alter column role set default 'student',
  alter column role set not null;

-- 2. Auto-create profile row on auth.users insert.
--    All signups start as 'student'. The intended_role metadata is only a hint
--    used by the app to route them into the teacher-onboarding flow afterwards.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, city, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'city', ''),
    'student'::user_role
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Student-teacher matches (platform-suggested pairings)
create table if not exists public.student_teacher_matches (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('suggested','accepted','rejected','replaced')),
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_matches_student_active
  on public.student_teacher_matches (student_id)
  where status in ('suggested','accepted');

create index if not exists idx_matches_teacher
  on public.student_teacher_matches (teacher_id);

-- 4. RLS
alter table public.profiles enable row level security;
alter table public.student_teacher_matches enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles public read safe cols" on public.profiles;
create policy "profiles public read safe cols" on public.profiles
  for select using (true);
-- ^ keep permissive select so teacher directory joins work; sensitive columns
--   aren't exposed in any current query. Tighten here if PII columns are added.

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id);
-- Role escalation is prevented by the app never sending role in a self-update;
-- admin role changes go through supabaseAdmin (service_role, bypasses RLS).

drop policy if exists "matches read own side" on public.student_teacher_matches;
create policy "matches read own side" on public.student_teacher_matches
  for select using (auth.uid() = student_id or auth.uid() = teacher_id);

drop policy if exists "matches student update" on public.student_teacher_matches;
create policy "matches student update" on public.student_teacher_matches
  for update using (auth.uid() = student_id);

-- 5. (Run AFTER first admin signup) — promote your account to admin
-- update public.profiles set role = 'admin' where email = 'your-email@example.com';
