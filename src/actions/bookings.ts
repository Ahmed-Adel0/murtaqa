"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

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

    // 2. Notify the Teacher
    await supabaseAdmin.from('notifications').insert({
      user_id: teacherId,
      title: "طلب حجز جديد 📅",
      message: `قام الطالب ${studentName} بإرسال طلب تواصل معك.`,
      link: `/dashboard`,
      type: 'booking'
    });

    // 3. Notify all Admins
    const { data: admins } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (admins) {
      const adminNotifs = admins.map(admin => ({
        user_id: admin.id,
        title: "حجز جديد في المنصة 🚀",
        message: `تم حجز المعلم ${teacherName} من قبل ${studentName}.`,
        link: `/admin/teachers`,
        type: 'booking'
      }));
      await supabaseAdmin.from('notifications').insert(adminNotifs);
    }

    revalidatePath(`/teachers/${teacherId}`);
    revalidatePath('/admin');
    
    return { success: true };
  } catch (err: any) {
    console.error("Booking Error:", err);
    return { success: false, error: err.message };
  }
}
