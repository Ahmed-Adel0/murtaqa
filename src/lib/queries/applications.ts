import { createClient } from "@/lib/supabaseServer";
import type { TeacherApplication } from "@/lib/types";

export async function getApplicationForUser(userId: string): Promise<TeacherApplication | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("teacher_applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as TeacherApplication) ?? null;
}
