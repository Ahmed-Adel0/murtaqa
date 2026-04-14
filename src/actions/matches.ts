"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { suggestNextTeacherForStudent } from "@/lib/queries/matches";

async function getAuthedStudentId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.role !== "student") return null;
  return user.id;
}

export async function rejectCurrentMatch(matchId: string, reason?: string) {
  const studentId = await getAuthedStudentId();
  if (!studentId) return { success: false, error: "غير مصرح" };

  const { data: match } = await supabaseAdmin
    .from("student_teacher_matches")
    .select("id, student_id")
    .eq("id", matchId)
    .maybeSingle();

  if (!match || match.student_id !== studentId) {
    return { success: false, error: "الترشيح غير موجود" };
  }

  const { error: updateError } = await supabaseAdmin
    .from("student_teacher_matches")
    .update({
      status: "replaced",
      reason: reason ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (updateError) return { success: false, error: updateError.message };

  const next = await suggestNextTeacherForStudent(studentId);
  revalidatePath("/dashboard");

  return { success: true, next };
}

export async function acceptCurrentMatch(matchId: string) {
  const studentId = await getAuthedStudentId();
  if (!studentId) return { success: false, error: "غير مصرح" };

  const { data: match } = await supabaseAdmin
    .from("student_teacher_matches")
    .select("id, student_id")
    .eq("id", matchId)
    .maybeSingle();

  if (!match || match.student_id !== studentId) {
    return { success: false, error: "الترشيح غير موجود" };
  }

  const { error } = await supabaseAdmin
    .from("student_teacher_matches")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", matchId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}
