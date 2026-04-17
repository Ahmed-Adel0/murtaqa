"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { sendNotification, sendAdminNotifications } from "@/lib/notifications";

/**
 * Admin: assign a teacher to a student for a trial lesson.
 * Creates a booking with status "trial".
 */
export async function assignTrialLesson(studentId: string, teacherId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { success: false, error: "هذه العملية للمسؤولين فقط" };

  try {
    // Get names for notifications
    const [{ data: student }, { data: teacher }] = await Promise.all([
      supabaseAdmin.from("profiles").select("full_name").eq("id", studentId).single(),
      supabaseAdmin.from("profiles").select("full_name").eq("id", teacherId).single(),
    ]);

    // Create booking — "pending" = trial lesson assigned
    const { error } = await supabaseAdmin.from("bookings").insert({
      student_id: studentId,
      teacher_id: teacherId,
      student_name: student?.full_name ?? "طالب",
      status: "pending",
    });

    if (error) throw error;

    // Notify student + teacher + admins
    await sendNotification({
      userId: studentId,
      type: "trial_assigned",
      data: { teacherName: teacher?.full_name ?? "معلم" },
    });
    await sendNotification({
      userId: teacherId,
      type: "new_booking",
      data: { studentName: student?.full_name ?? "طالب" },
    });
    await sendAdminNotifications({
      type: "new_booking_admin",
      data: { studentName: student?.full_name ?? "طالب", teacherName: teacher?.full_name ?? "معلم" },
    });

    revalidatePath("/admin/students");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin: mark trial as done → triggers student evaluation form.
 */
export async function requestEvaluation(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { success: false, error: "هذه العملية للمسؤولين فقط" };

  try {
    // Get booking to find student
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("student_id, teacher_id")
      .eq("id", bookingId)
      .single();

    if (!booking) return { success: false, error: "الحجز غير موجود" };

    // "confirmed" = trial done, waiting for evaluation
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId);

    if (error) throw error;

    // Notify student to evaluate
    const { data: teacher } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", booking.teacher_id)
      .single();

    await sendNotification({
      userId: booking.student_id,
      type: "trial_done",
      data: { teacherName: teacher?.full_name ?? "معلم" },
    });

    revalidatePath("/admin/students");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin: activate subscription after payment verified.
 */
export async function activateSubscription(bookingId: string, pricePerMonth?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { success: false, error: "هذه العملية للمسؤولين فقط" };

  try {
    // "completed" = subscription active
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: "completed" })
      .eq("id", bookingId);

    if (error) throw error;

    // Notify student
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("student_id")
      .eq("id", bookingId)
      .single();

    if (booking) {
      await sendNotification({
        userId: booking.student_id,
        type: "subscription_active",
        data: { price: pricePerMonth ? String(pricePerMonth) : "" },
      });
    }

    revalidatePath("/admin/students");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Public: get booking info for evaluation page (no auth required).
 */
export async function getBookingForEvaluation(bookingId: string) {
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id, student_id, teacher_id, student_name, status")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) return null;

  const { data: teacher } = await supabaseAdmin
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", booking.teacher_id)
    .single();

  // Check existing review
  const { data: existingReview } = await supabaseAdmin
    .from("reviews")
    .select("id, rating, comment")
    .eq("teacher_id", booking.teacher_id)
    .eq("student_name", booking.student_name ?? "")
    .limit(1);

  return {
    booking,
    teacher_name: teacher?.full_name ?? "المعلم",
    teacher_avatar: teacher?.avatar_url ?? "",
    already_reviewed: (existingReview?.length ?? 0) > 0,
  };
}

/**
 * Public: submit evaluation from the evaluation page.
 */
export async function submitEvaluation(input: {
  bookingId: string;
  rating: number;
  comment: string;
  wantsContinue: boolean;
}) {
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("teacher_id, student_name")
    .eq("id", input.bookingId)
    .single();

  if (!booking) return { success: false, error: "الحجز غير موجود" };

  const continueTag = input.wantsContinue
    ? "\n\n✅ يرغب بالاستمرار مع المعلم"
    : "\n\n❌ لا يرغب بالاستمرار مع المعلم";

  const fullComment = (input.comment || "").trim() + continueTag;

  const { error } = await supabaseAdmin.from("reviews").insert({
    teacher_id: booking.teacher_id,
    student_name: booking.student_name ?? "طالب",
    rating: input.rating,
    comment: fullComment,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Admin: cancel a lesson/booking.
 */
export async function cancelLesson(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { success: false, error: "هذه العملية للمسؤولين فقط" };

  try {
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);
    if (error) throw error;

    revalidatePath("/admin/meetings");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin: get all teachers with their subjects for the assignment dropdown.
 */
export async function getTeachersForAssignment() {
  const { data: teachers } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name")
    .eq("role", "teacher")
    .order("full_name");

  if (!teachers || teachers.length === 0) return [];

  // Fetch subjects from teacher_public_profiles
  const ids = teachers.map((t) => t.id);
  let subjectMap = new Map<string, string[]>();
  {
    const res = await supabaseAdmin
      .from("teacher_public_profiles")
      .select("teacher_id, subjects")
      .in("teacher_id", ids);
    if (res.data) {
      for (const row of res.data) {
        subjectMap.set(row.teacher_id, (row.subjects as string[]) ?? []);
      }
    }
  }

  return teachers.map((t) => ({
    id: t.id,
    full_name: t.full_name ?? "معلم",
    subjects: subjectMap.get(t.id) ?? [],
  }));
}

/**
 * Admin: get all students for the assignment dropdown.
 */
export async function getStudentsForAssignment() {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, phone")
    .eq("role", "student")
    .order("full_name");

  return (data ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name ?? "طالب",
    phone: p.phone,
  }));
}

/**
 * Admin: get all lessons (bookings) with enriched data.
 * Uses supabaseAdmin to bypass RLS.
 */
export async function getAllLessons() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return [];

  // Fetch all bookings
  const { data: bookings } = await supabaseAdmin
    .from("bookings")
    .select("id, student_id, teacher_id, student_name, status, created_at")
    .order("created_at", { ascending: false });

  if (!bookings || bookings.length === 0) return [];

  // Get all unique user IDs
  const allIds = new Set<string>();
  for (const b of bookings) {
    if (b.student_id) allIds.add(b.student_id);
    if (b.teacher_id) allIds.add(b.teacher_id);
  }

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, phone")
    .in("id", Array.from(allIds));

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  // Fetch reviews with full details
  const teacherIds = [...new Set(bookings.map((b) => b.teacher_id))];
  const { data: reviews } = teacherIds.length > 0
    ? await supabaseAdmin.from("reviews").select("teacher_id, rating, comment, student_name").in("teacher_id", teacherIds)
    : { data: [] };

  // Map reviews by teacher_id + student_name
  const reviewMap = new Map<string, { rating: number; comment: string | null; wants_continue: boolean | null }>();
  for (const r of reviews ?? []) {
    const key = `${r.teacher_id}_${r.student_name}`;
    const wc = r.comment?.includes("✅ يرغب بالاستمرار") ? true
      : r.comment?.includes("❌ لا يرغب بالاستمرار") ? false : null;
    reviewMap.set(key, { rating: r.rating, comment: r.comment, wants_continue: wc });
  }

  // Fetch subjects
  let subjectMap = new Map<string, string[]>();
  {
    const res = await supabaseAdmin
      .from("teacher_public_profiles")
      .select("teacher_id, subjects")
      .in("teacher_id", teacherIds);
    if (res.data) {
      for (const row of res.data) {
        subjectMap.set(row.teacher_id, (row.subjects as string[]) ?? []);
      }
    }
  }

  return bookings.map((b: any) => {
    const studentProf = profileMap.get(b.student_id);
    const teacherProf = profileMap.get(b.teacher_id);
    const sName = b.student_name || studentProf?.full_name || "طالب";
    const reviewKey = `${b.teacher_id}_${sName}`;
    const review = reviewMap.get(reviewKey);
    return {
      id: b.id,
      student_id: b.student_id,
      teacher_id: b.teacher_id,
      student_name: sName,
      teacher_name: teacherProf?.full_name || "معلم",
      teacher_phone: teacherProf?.phone || null,
      student_phone: studentProf?.phone || null,
      status: b.status || "pending",
      created_at: b.created_at,
      has_review: !!review,
      review_rating: review?.rating ?? null,
      review_comment: review?.comment ?? null,
      wants_continue: review?.wants_continue ?? null,
      subjects: subjectMap.get(b.teacher_id) ?? [],
    };
  });
}
