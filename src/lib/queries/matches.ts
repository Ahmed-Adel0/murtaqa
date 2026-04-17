import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import type { MatchWithTeacher, StudentTeacherMatch } from "@/lib/types";

type MatchRow = StudentTeacherMatch & {
  teacher: {
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
  } | null;
  teacher_public_profile: {
    bio: string | null;
    subjects: string[] | null;
    districts: string[] | null;
    hourly_rate: number | null;
    grade_levels: string[] | null;
    is_published: boolean;
  } | null;
};

export async function getActiveMatchForStudent(studentId: string): Promise<MatchWithTeacher | null> {
  const supabase = await createClient();

  // Try with grade_levels, fall back without if column doesn't exist
  let data: any = null;
  {
    const res = await supabase
      .from("student_teacher_matches")
      .select(`
        *,
        teacher:profiles!student_teacher_matches_teacher_id_fkey (full_name, avatar_url, city),
        teacher_public_profile:teacher_public_profiles!teacher_public_profiles_teacher_id_fkey (
          bio, subjects, districts, hourly_rate, grade_levels, is_published
        )
      `)
      .eq("student_id", studentId)
      .in("status", ["suggested", "accepted"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (res.error?.code === "42703") {
      const fallback = await supabase
        .from("student_teacher_matches")
        .select(`
          *,
          teacher:profiles!student_teacher_matches_teacher_id_fkey (full_name, avatar_url, city),
          teacher_public_profile:teacher_public_profiles!teacher_public_profiles_teacher_id_fkey (
            bio, subjects, districts, hourly_rate, is_published
          )
        `)
        .eq("student_id", studentId)
        .in("status", ["suggested", "accepted"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      data = fallback.data;
    } else {
      data = res.data;
    }
  }

  if (!data) return null;
  const row = data as unknown as MatchRow;
  return {
    id: row.id,
    student_id: row.student_id,
    teacher_id: row.teacher_id,
    status: row.status,
    reason: row.reason,
    created_at: row.created_at,
    updated_at: row.updated_at,
    teacher: {
      teacher_id: row.teacher_id,
      full_name: row.teacher?.full_name ?? null,
      avatar_url: row.teacher?.avatar_url ?? null,
      bio: row.teacher_public_profile?.bio ?? null,
      subjects: row.teacher_public_profile?.subjects ?? null,
      districts: row.teacher_public_profile?.districts ?? null,
      hourly_rate: row.teacher_public_profile?.hourly_rate ?? null,
      grade_levels: row.teacher_public_profile?.grade_levels ?? null,
      is_published: row.teacher_public_profile?.is_published ?? false,
    },
  };
}

/**
 * Smart teacher suggestion algorithm.
 * Priority scoring:
 *  1. Subject match (highest weight)
 *  2. Grade level match
 *  3. City match
 *  4. Has reviews / higher rating
 *  5. Random tiebreaker
 */
export async function suggestNextTeacherForStudent(
  studentId: string
): Promise<StudentTeacherMatch | null> {
  // Get all previously matched teacher IDs to exclude
  const { data: priorMatches } = await supabaseAdmin
    .from("student_teacher_matches")
    .select("teacher_id")
    .eq("student_id", studentId);

  const excluded = new Set((priorMatches ?? []).map((m) => m.teacher_id));

  // Get student profile for matching criteria
  // Try with grade_level; fall back to just city if column doesn't exist
  let student: { city: string | null; grade_level: string | null } | null = null;
  const { data: studentFull, error: studentErr } = await supabaseAdmin
    .from("profiles")
    .select("city, grade_level")
    .eq("id", studentId)
    .maybeSingle();

  if (studentErr && (studentErr.code === "PGRST204" || studentErr.code === "42703")) {
    const { data: studentBasic } = await supabaseAdmin
      .from("profiles")
      .select("city")
      .eq("id", studentId)
      .maybeSingle();
    student = { city: studentBasic?.city ?? null, grade_level: null };
  } else {
    student = studentFull as any;
  }

  // Get all published teachers with their profiles
  let candidates: any[] | null = null;
  {
    const res = await supabaseAdmin
      .from("teacher_public_profiles")
      .select("teacher_id, subjects, districts, grade_levels, hourly_rate")
      .eq("is_published", true)
      .limit(100);
    if (res.error?.code === "42703") {
      const fallback = await supabaseAdmin
        .from("teacher_public_profiles")
        .select("teacher_id, subjects, districts, hourly_rate")
        .eq("is_published", true)
        .limit(100);
      candidates = fallback.data;
    } else {
      candidates = res.data;
    }
  }

  if (!candidates || candidates.length === 0) return null;

  // Filter out already matched
  const pool = candidates.filter((c) => !excluded.has(c.teacher_id));
  if (pool.length === 0) return null;

  // Get teacher profile data (city) and review stats
  const poolIds = pool.map((p) => p.teacher_id);

  const [{ data: teacherProfiles }, { data: reviewStats }] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, city")
      .in("id", poolIds),
    supabaseAdmin
      .from("reviews")
      .select("teacher_id, rating")
      .in("teacher_id", poolIds),
  ]);

  const cityMap = new Map(
    (teacherProfiles ?? []).map((p: any) => [p.id, p.city])
  );

  // Calculate average rating per teacher
  const ratingMap = new Map<string, { total: number; count: number }>();
  for (const r of reviewStats ?? []) {
    const existing = ratingMap.get(r.teacher_id) ?? { total: 0, count: 0 };
    existing.total += (r.rating ?? 0);
    existing.count += 1;
    ratingMap.set(r.teacher_id, existing);
  }

  // Parse student's subject preference from grade_level field
  // (stored as JSON array of grade values for teachers, but for students it's a single value)
  const studentGrade = student?.grade_level ?? null;
  const studentCity = student?.city ?? null;

  // Score each teacher
  const scored = pool.map((teacher) => {
    let score = 0;

    // Grade level match (+30 points)
    if (studentGrade && teacher.grade_levels) {
      const grades = teacher.grade_levels as string[];
      // studentGrade might be a JSON string or a plain value
      let gradeValue = studentGrade;
      try { gradeValue = JSON.parse(studentGrade); } catch { /* use as-is */ }
      if (Array.isArray(gradeValue)) {
        // Teacher matches any of student's grade levels
        if (gradeValue.some((g: string) => grades.includes(g))) score += 30;
      } else if (grades.includes(gradeValue)) {
        score += 30;
      }
    }

    // City match (+20 points)
    const teacherCity = cityMap.get(teacher.teacher_id);
    if (studentCity && teacherCity && teacherCity.toLowerCase() === studentCity.toLowerCase()) {
      score += 20;
    }

    // Has reviews & rating bonus (up to +15 points)
    const stats = ratingMap.get(teacher.teacher_id);
    if (stats && stats.count > 0) {
      const avgRating = stats.total / stats.count;
      score += Math.round(avgRating * 3); // max 15 for 5.0 rating
    }

    // Random tiebreaker (0-5)
    score += Math.random() * 5;

    return { teacher_id: teacher.teacher_id, score };
  });

  // Sort by score descending, pick the best
  scored.sort((a, b) => b.score - a.score);
  const chosen = scored[0];

  const { data: inserted } = await supabaseAdmin
    .from("student_teacher_matches")
    .insert({
      student_id: studentId,
      teacher_id: chosen.teacher_id,
      status: "suggested",
    })
    .select("*")
    .single();

  return (inserted as StudentTeacherMatch) ?? null;
}
