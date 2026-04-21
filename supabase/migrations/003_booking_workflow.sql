-- ============================================================================
-- Murtaqa — student request workflow + admin notes
-- Run this in the Supabase SQL editor after 002_availability_payments_meetings.sql
-- ============================================================================

-- 1. Expand bookings.status to cover the full student-request lifecycle:
--      new         → student just submitted the request
--      in_progress → admin opened it, started coordinating
--      accepted    → teacher matched, awaiting payment
--      confirmed   → payment verified, session scheduled
--    (The existing values pending/completed/cancelled are kept for
--     backward-compat with assignTrialLesson / activateSubscription.)
alter table public.bookings
  drop constraint if exists bookings_status_check;

alter table public.bookings
  add constraint bookings_status_check
  check (status in ('new','pending','in_progress','accepted','confirmed','completed','cancelled'));

-- 2. Student request payload — preferences captured once at intake.
alter table public.bookings
  add column if not exists current_level text,
  add column if not exists preferred_days text[] default '{}',
  add column if not exists preferred_times text,
  add column if not exists notes text,
  add column if not exists admin_notes text;

-- The student submits their request BEFORE a teacher is matched, so
-- teacher_id must be nullable. Admin populates it later when they run
-- "ربط بمعلم" from /admin/bookings.
alter table public.bookings
  alter column teacher_id drop not null;

-- Helpful filter for the admin "new requests" tab.
create index if not exists idx_bookings_status_new
  on public.bookings(created_at desc)
  where status = 'new';

-- 3. RLS — allow a student to insert their own request booking.
drop policy if exists "bookings_insert_own_request" on public.bookings;
create policy "bookings_insert_own_request" on public.bookings
  for insert with check (auth.uid() = student_id);

-- Students read their own bookings (keep any existing broader policy intact).
drop policy if exists "bookings_select_own_student" on public.bookings;
create policy "bookings_select_own_student" on public.bookings
  for select using (auth.uid() = student_id or auth.uid() = teacher_id);
