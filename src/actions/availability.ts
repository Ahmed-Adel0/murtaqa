"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function addAvailabilitySlot(slot: {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring?: boolean;
  specific_date?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher") {
    return { success: false, error: "هذه العملية للمعلمين فقط" };
  }

  const { error } = await supabaseAdmin
    .from("teacher_availability")
    .insert({
      teacher_id: user.id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_recurring: slot.is_recurring ?? true,
      specific_date: slot.specific_date ?? null,
    });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function removeAvailabilitySlot(slotId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  // Verify ownership via DB lookup (not trusting client)
  const { data: slot } = await supabaseAdmin
    .from("teacher_availability")
    .select("teacher_id")
    .eq("id", slotId)
    .single();

  if (!slot || slot.teacher_id !== user.id) {
    return { success: false, error: "غير مصرح بحذف هذا الوقت" };
  }

  const { error } = await supabaseAdmin
    .from("teacher_availability")
    .delete()
    .eq("id", slotId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getTeacherAvailability(teacherId: string) {
  const { data, error } = await supabaseAdmin
    .from("teacher_availability")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("day_of_week")
    .order("start_time");

  if (error) return [];
  return data ?? [];
}
