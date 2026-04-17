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
