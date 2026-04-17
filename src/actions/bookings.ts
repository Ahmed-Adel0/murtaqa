"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { sendNotification, sendAdminNotifications } from "@/lib/notifications";

export async function createBooking(teacherId: string, teacherName: string) {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  const studentName = user?.user_metadata?.full_name || "زائر";
  const studentId = user?.id || null;

  try {
    // 1. Create the booking record
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

    // 2. Notify the Teacher (platform + email)
    await sendNotification({
      userId: teacherId,
      type: "booking_request",
      data: { teacherName, studentName },
    });

    // 3. Notify all Admins (platform only)
    await sendAdminNotifications({
      title: "حجز جديد في المنصة",
      message: `تم حجز المعلم ${teacherName} من قبل ${studentName}.`,
      link: "/admin/teachers",
      type: "booking",
    });

    revalidatePath(`/teachers/${teacherId}`);
    revalidatePath('/admin');

    return { success: true };
  } catch (err: any) {
    console.error("Booking Error:", err);
    return { success: false, error: err.message };
  }
}
