"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { sendNotification, sendAdminNotifications } from "@/lib/notifications";

export type BookingWorkflowStatus =
  | "new"
  | "in_progress"
  | "accepted"
  | "confirmed"
  | "cancelled";

export async function createStudentBookingRequest(input: {
  subject: string;
  grade_level: string;
  current_level?: string;
  preferred_days?: string[];
  preferred_times?: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  try {
    const { error } = await supabaseAdmin.from("bookings").insert({
      student_id: user.id,
      student_name: profile?.full_name ?? null,
      subject: input.subject,
      grade_level: input.grade_level,
      current_level: input.current_level ?? null,
      preferred_days: input.preferred_days ?? [],
      preferred_times: input.preferred_times ?? null,
      notes: input.notes ?? null,
      status: "new",
    });

    if (error) throw error;

    await sendAdminNotifications({
      type: "general",
      data: {
        title: "طلب جديد من طالب",
        message: `قام الطالب ${profile?.full_name ?? "—"} بإرسال طلب جديد: ${input.subject}${input.grade_level ? " — " + input.grade_level : ""}.`,
        link: "/admin/bookings",
      },
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل إرسال الطلب";
    return { success: false, error: message };
  }
}

export async function updateBookingStatus(input: {
  bookingId: string;
  status: BookingWorkflowStatus;
  adminNotes?: string;
  teacherId?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return { success: false, error: "هذه العملية للمسؤولين فقط" };
  }

  try {
    const patch: Record<string, unknown> = {
      status: input.status,
      updated_at: new Date().toISOString(),
    };
    if (typeof input.adminNotes === "string") patch.admin_notes = input.adminNotes;
    if (input.teacherId) patch.teacher_id = input.teacherId;

    const { data: updated, error } = await supabaseAdmin
      .from("bookings")
      .update(patch)
      .eq("id", input.bookingId)
      .select("student_id, teacher_id, subject")
      .single();

    if (error) throw error;

    // When admin links a teacher → also record it in student_teacher_matches
    // so the match history stays in sync with the booking flow.
    if (input.status === "accepted" && input.teacherId && updated?.student_id) {
      await supabaseAdmin.from("student_teacher_matches").insert({
        student_id: updated.student_id,
        teacher_id: input.teacherId,
        status: "accepted",
        reason: "ربط يدوي من الأدمن",
      });
    }

    // Notify the student on meaningful transitions.
    if (updated?.student_id) {
      const titleFor: Partial<Record<BookingWorkflowStatus, { title: string; message: string }>> = {
        in_progress: {
          title: "طلبك قيد المراجعة",
          message: "تم استلام طلبك وبدأ فريق مرتقى بتجهيز المعلم المناسب.",
        },
        accepted: {
          title: "تم قبول طلبك",
          message: "تم إيجاد المعلم وتحديد الموعد المبدئي. يرجى إتمام التحويل البنكي لتأكيد الحجز.",
        },
        confirmed: {
          title: "تم تأكيد حجزك",
          message: "تم تأكيد التحويل وجدولة الحصة. شكراً لثقتك بمرتقى.",
        },
        cancelled: {
          title: "تم إلغاء الطلب",
          message: "نأسف، تم إلغاء طلبك. يرجى التواصل مع الإدارة للمزيد من التفاصيل.",
        },
      };
      const entry = titleFor[input.status];
      if (entry) {
        await sendNotification({
          userId: updated.student_id,
          type: "general",
          data: { title: entry.title, message: entry.message, link: "/dashboard" },
        });
      }
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل التحديث";
    return { success: false, error: message };
  }
}

export async function createBooking(teacherId: string, teacherName: string) {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  const studentName = user?.user_metadata?.full_name || "زائر";
  const studentId = user?.id || null;

  try {
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        teacher_id: teacherId,
        student_id: studentId,
        student_name: studentName
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Notify teacher
    await sendNotification({
      userId: teacherId,
      type: "new_booking",
      data: { studentName },
    });

    // Notify admins
    await sendAdminNotifications({
      type: "new_booking_admin",
      data: { studentName, teacherName },
    });

    revalidatePath(`/teachers/${teacherId}`);
    revalidatePath('/admin');

    return { success: true };
  } catch (err: any) {
    console.error("Booking Error:", err);
    return { success: false, error: err.message };
  }
}
