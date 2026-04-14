"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseServer";

export async function updateOwnProfile(input: {
  full_name?: string;
  phone?: string;
  city?: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.full_name !== undefined) payload.full_name = input.full_name;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.city !== undefined) payload.city = input.city;
  if (input.avatar_url !== undefined) payload.avatar_url = input.avatar_url;

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}
