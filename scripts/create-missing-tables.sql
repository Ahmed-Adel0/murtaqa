-- ============================================================================
-- Murtaqa — Create missing tables
-- Paste this ENTIRE file in Supabase SQL Editor and click Run
-- Link: https://supabase.com/dashboard/project/mwetouzkdebeqcqcscax/sql/new
-- ============================================================================

-- 1. student_teacher_matches (CRITICAL — matching won't work without this)
CREATE TABLE IF NOT EXISTS public.student_teacher_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('suggested','accepted','rejected','replaced')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_matches_student_active
  ON public.student_teacher_matches (student_id)
  WHERE status IN ('suggested','accepted');

CREATE INDEX IF NOT EXISTS idx_matches_teacher
  ON public.student_teacher_matches (teacher_id);

ALTER TABLE public.student_teacher_matches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "matches_read_own" ON public.student_teacher_matches
    FOR SELECT USING (auth.uid() = student_id OR auth.uid() = teacher_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "matches_student_update" ON public.student_teacher_matches
    FOR UPDATE USING (auth.uid() = student_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "matches_insert_service" ON public.student_teacher_matches
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. teacher_availability
CREATE TABLE IF NOT EXISTS public.teacher_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week smallint CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_recurring boolean NOT NULL DEFAULT true,
  specific_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_availability_teacher ON public.teacher_availability(teacher_id);

ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "availability_select_all" ON public.teacher_availability
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "availability_insert_own" ON public.teacher_availability
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "availability_update_own" ON public.teacher_availability
    FOR UPDATE USING (auth.uid() = teacher_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "availability_delete_own" ON public.teacher_availability
    FOR DELETE USING (auth.uid() = teacher_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. meetings
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES public.payments(id),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_minutes smallint NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  meeting_link text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meetings_teacher ON public.meetings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_meetings_student ON public.meetings(student_id);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "meetings_select_own" ON public.meetings
    FOR SELECT USING (
      auth.uid() = student_id OR auth.uid() = teacher_id
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "meetings_insert_admin" ON public.meetings
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "meetings_update_admin" ON public.meetings
    FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  parent_id uuid REFERENCES public.subjects(id),
  sort_order smallint DEFAULT 0,
  is_active boolean DEFAULT true
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "subjects_select_all" ON public.subjects
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Add missing columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade_level text;
ALTER TABLE public.teacher_public_profiles ADD COLUMN IF NOT EXISTS grade_levels text[] DEFAULT '{}';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS scheduled_time timestamptz;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS grade_level text;

-- Done!
SELECT 'All tables and columns created successfully!' AS result;
