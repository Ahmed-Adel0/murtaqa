-- ============================================================================
-- Murtaqa — availability, payments, meetings, subjects, grade levels
-- Run this in the Supabase SQL editor after 001_role_matching.sql
-- ============================================================================

-- 1. Teacher availability slots
create table if not exists public.teacher_availability (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week smallint check (day_of_week between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null,
  is_recurring boolean not null default true,
  specific_date date,
  created_at timestamptz not null default now(),
  constraint valid_time_range check (start_time < end_time),
  constraint recurring_or_specific check (
    (is_recurring = true and day_of_week is not null and specific_date is null)
    or (is_recurring = false and specific_date is not null)
  )
);

create index if not exists idx_availability_teacher
  on public.teacher_availability(teacher_id);

create index if not exists idx_availability_day
  on public.teacher_availability(day_of_week)
  where is_recurring = true;

-- 2. Payments (manual bank transfer verification)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  amount decimal(10,2) not null check (amount > 0),
  currency text not null default 'SAR',
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  bank_account_used text,
  transfer_reference text,
  transfer_note text,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references public.profiles(id),
  rejection_reason text
);

create index if not exists idx_payments_student on public.payments(student_id);
create index if not exists idx_payments_booking on public.payments(booking_id);
create index if not exists idx_payments_status on public.payments(status) where status = 'pending';

-- 3. Meetings / Classes (admin-created after payment verification)
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  payment_id uuid references public.payments(id),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_minutes smallint not null default 60 check (duration_minutes > 0),
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  meeting_link text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_meetings_teacher on public.meetings(teacher_id);
create index if not exists idx_meetings_student on public.meetings(student_id);
create index if not exists idx_meetings_scheduled on public.meetings(scheduled_at)
  where status = 'scheduled';

-- 4. Subjects hierarchy (main subject → sub-subjects)
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text,
  parent_id uuid references public.subjects(id),
  sort_order smallint default 0,
  is_active boolean default true
);

create index if not exists idx_subjects_parent on public.subjects(parent_id);

-- 5. Grade level and booking enhancements
alter table public.profiles
  add column if not exists grade_level text;

alter table public.teacher_public_profiles
  add column if not exists grade_levels text[] default '{}';

alter table public.bookings
  add column if not exists subject text;

alter table public.bookings
  add column if not exists scheduled_time timestamptz;

alter table public.bookings
  add column if not exists grade_level text;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- teacher_availability
alter table public.teacher_availability enable row level security;

create policy "availability_select_authenticated" on public.teacher_availability
  for select using (auth.role() = 'authenticated');

create policy "availability_insert_own" on public.teacher_availability
  for insert with check (auth.uid() = teacher_id);

create policy "availability_update_own" on public.teacher_availability
  for update using (auth.uid() = teacher_id);

create policy "availability_delete_own" on public.teacher_availability
  for delete using (auth.uid() = teacher_id);

-- payments
alter table public.payments enable row level security;

create policy "payments_select_own_or_admin" on public.payments
  for select using (
    auth.uid() = student_id
    or auth.uid() = teacher_id
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "payments_insert_student" on public.payments
  for insert with check (auth.uid() = student_id);

create policy "payments_update_admin" on public.payments
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- meetings
alter table public.meetings enable row level security;

create policy "meetings_select_participant" on public.meetings
  for select using (
    auth.uid() = student_id
    or auth.uid() = teacher_id
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "meetings_insert_admin" on public.meetings
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "meetings_update_admin" on public.meetings
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- subjects (read-only for authenticated)
alter table public.subjects enable row level security;

create policy "subjects_select_all" on public.subjects
  for select using (auth.role() = 'authenticated');

-- ============================================================================
-- Seed: common Saudi subjects
-- ============================================================================
insert into public.subjects (name_ar, name_en, sort_order) values
  ('رياضيات', 'Mathematics', 1),
  ('فيزياء', 'Physics', 2),
  ('كيمياء', 'Chemistry', 3),
  ('أحياء', 'Biology', 4),
  ('لغة عربية', 'Arabic', 5),
  ('لغة إنجليزية', 'English', 6),
  ('علوم', 'Science', 7),
  ('تاريخ', 'History', 8),
  ('جغرافيا', 'Geography', 9),
  ('تربية إسلامية', 'Islamic Studies', 10),
  ('حاسب آلي', 'Computer Science', 11),
  ('اقتصاد', 'Economics', 12),
  ('محاسبة', 'Accounting', 13),
  ('إدارة أعمال', 'Business Administration', 14)
on conflict do nothing;
