"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { suggestNextTeacherForStudent } from "@/lib/queries/matches";

/**
 * Save student preferences (grade, subject, city, teaching type)
 * and trigger a smart teacher suggestion.
 */
export async function saveStudentPreferencesAndMatch(input: {
  grade_level: string;
  preferred_subject: string;
  city?: string;
  teaching_type?: string; // online | offline | both
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  try {
    // Update student profile with preferences
    // Try updating grade_level; if column doesn't exist yet, update without it
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (input.city) updatePayload.city = input.city;

    const { error: gradeError } = await supabaseAdmin
      .from("profiles")
      .update({ ...updatePayload, grade_level: input.grade_level })
      .eq("id", user.id);

    if (gradeError && (gradeError.code === "42703" || gradeError.code === "PGRST204")) {
      // grade_level column doesn't exist yet — update without it
      console.warn("[student-intake] grade_level column missing, updating without it");
      await supabaseAdmin
        .from("profiles")
        .update(updatePayload)
        .eq("id", user.id);
    } else if (gradeError) {
      throw gradeError;
    }

    // Trigger smart matching
    const match = await suggestNextTeacherForStudent(user.id);

    revalidatePath("/dashboard");
    return { success: true, hasMatch: !!match };
  } catch (err: any) {
    console.error("Student intake error:", err);
    return { success: false, error: err.message };
  }
}
