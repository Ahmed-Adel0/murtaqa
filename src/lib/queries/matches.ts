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
    is_published: boolean;
  } | null;
};

export async function getActiveMatchForStudent(studentId: string): Promise<MatchWithTeacher | null> {
  const supabase = await createClient();
  const { data } = await supabase
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
      is_published: row.teacher_public_profile?.is_published ?? false,
    },
  };
}

export async function suggestNextTeacherForStudent(
  studentId: string
): Promise<StudentTeacherMatch | null> {
  const { data: priorMatches } = await supabaseAdmin
    .from("student_teacher_matches")
    .select("teacher_id")
    .eq("student_id", studentId);

  const excluded = new Set((priorMatches ?? []).map((m) => m.teacher_id));

  const { data: student } = await supabaseAdmin
    .from("profiles")
    .select("city")
    .eq("id", studentId)
    .maybeSingle();

  let query = supabaseAdmin
    .from("teacher_public_profiles")
    .select("teacher_id")
    .eq("is_published", true)
    .limit(50);

  const { data: candidates } = await query;
  if (!candidates || candidates.length === 0) return null;

  const pool = candidates.filter((c) => !excluded.has(c.teacher_id));
  if (pool.length === 0) return null;

  let chosen = pool[Math.floor(Math.random() * pool.length)];

  if (student?.city) {
    const { data: cityMatches } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("city", student.city)
      .in("id", pool.map((p) => p.teacher_id));
    if (cityMatches && cityMatches.length > 0) {
      const match = cityMatches[Math.floor(Math.random() * cityMatches.length)];
      chosen = { teacher_id: match.id };
    }
  }

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
