"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/lib/notifications";

export async function createMeeting(input: {
  bookingId: string;
  teacherId: string;
  studentId: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  notes?: string;
  paymentId?: string;
}) {
  // Layer 1: Verify admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "هذه العملية للمسؤولين فقط" };
  }

  try {
    const { error } = await supabaseAdmin.from("meetings").insert({
      booking_id: input.bookingId,
      teacher_id: input.teacherId,
      student_id: input.studentId,
      scheduled_at: input.scheduledAt,
      duration_minutes: input.durationMinutes,
      meeting_link: input.meetingLink || null,
      notes: input.notes || null,
      payment_id: input.paymentId || null,
      status: "scheduled",
    });

    if (error) throw error;

    // Get names for notifications
    const [{ data: teacher }, { data: student }] = await Promise.all([
      supabaseAdmin.from("profiles").select("full_name").eq("id", input.teacherId).single(),
      supabaseAdmin.from("profiles").select("full_name").eq("id", input.studentId).single(),
    ]);

    const scheduledDate = new Date(input.scheduledAt).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Notify teacher
    await sendNotification({
      userId: input.teacherId,
      type: "meeting_scheduled",
      data: {
        otherName: student?.full_name ?? "طالب",
        scheduledAt: scheduledDate,
        duration: String(input.durationMinutes),
        role: "teacher",
      },
    });

    // Notify student
    await sendNotification({
      userId: input.studentId,
      type: "meeting_scheduled",
      data: {
        otherName: teacher?.full_name ?? "معلم",
        scheduledAt: scheduledDate,
        duration: String(input.durationMinutes),
        role: "student",
      },
    });

    revalidatePath("/admin/meetings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateMeetingStatus(
  meetingId: string,
  status: "completed" | "cancelled"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "هذه العملية للمسؤولين فقط" };
  }

  try {
    const { error } = await supabaseAdmin
      .from("meetings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", meetingId);

    if (error) throw error;

    revalidatePath("/admin/meetings");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
