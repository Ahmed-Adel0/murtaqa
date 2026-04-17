"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* ════════════════════════════════════════════════════════════════════════ */
/*  Notification Types — each has a clear Arabic title & message           */
/* ════════════════════════════════════════════════════════════════════════ */

type NotificationType =
  | "trial_assigned"         // → student: admin assigned you a trial lesson
  | "trial_done"             // → student: trial ended, please evaluate
  | "evaluation_received"    // → admin: student submitted evaluation
  | "subscription_active"    // → student: your subscription is now active
  | "teacher_approved"       // → teacher: your application was approved
  | "teacher_rejected"       // → teacher: your application was rejected
  | "new_booking"            // → teacher: a student booked you
  | "new_booking_admin"      // → admin: new booking on the platform
  | "payment_confirmed"      // → student: payment verified
  | "general";               // → anyone: custom message

interface NotifyInput {
  userId: string;
  type: NotificationType;
  data?: Record<string, string>;
}

/**
 * Get clear Arabic title + message for each notification type.
 */
function buildNotification(type: NotificationType, data: Record<string, string> = {}) {
  switch (type) {
    // ─── Student notifications ───
    case "trial_assigned":
      return {
        title: "تم تعيين حصة تجريبية لك",
        message: `تم ترتيب حصة تجريبية لك مع المعلم ${data.teacherName || ""}. سيتم التواصل معك لتحديد الموعد.`,
        link: "/dashboard",
      };
    case "trial_done":
      return {
        title: "يرجى تقييم الحصة التجريبية",
        message: `انتهت حصتك التجريبية مع المعلم ${data.teacherName || ""}. يرجى تقييم التجربة من خلال الرابط المرسل إليك.`,
        link: "/dashboard",
      };
    case "subscription_active":
      return {
        title: "تم تفعيل اشتراكك!",
        message: `مبروك! تم تفعيل اشتراكك الشهري (12 حصة) ${data.price ? "بسعر " + data.price + " ريال" : ""}. يمكنك الآن بدء حصصك الدراسية.`,
        link: "/dashboard",
      };
    case "payment_confirmed":
      return {
        title: "تم تأكيد الدفع",
        message: `تم تأكيد عملية الدفع بمبلغ ${data.amount || "—"} ريال بنجاح. شكراً لثقتك بمرتقى.`,
        link: "/dashboard",
      };

    // ─── Teacher notifications ───
    case "teacher_approved":
      return {
        title: "تم قبول طلب انضمامك!",
        message: `مبروك! تم قبول طلبك كمعلم في منصة مرتقى أكاديمي. يمكنك الآن إكمال ملفك الشخصي واستقبال الطلاب.`,
        link: "/dashboard",
      };
    case "teacher_rejected":
      return {
        title: "تحديث حالة طلب الانضمام",
        message: "نأسف، لم يتم قبول طلبك في الوقت الحالي. يمكنك مراجعة بياناتك وإعادة التقديم لاحقاً.",
        link: "/dashboard",
      };
    case "new_booking":
      return {
        title: "طلب حصة جديد",
        message: `تم تعيين حصة جديدة لك مع الطالب ${data.studentName || ""}. سيتم التواصل معك لتحديد الموعد.`,
        link: "/dashboard",
      };

    // ─── Admin notifications ───
    case "new_booking_admin":
      return {
        title: "حصة جديدة في المنصة",
        message: `تم إنشاء حصة بين الطالب ${data.studentName || ""} والمعلم ${data.teacherName || ""}.`,
        link: "/admin/meetings",
      };
    case "evaluation_received":
      return {
        title: "تقييم جديد من طالب",
        message: `قام الطالب ${data.studentName || ""} بتقييم المعلم ${data.teacherName || ""} بـ ${data.rating || "—"} نجوم. ${data.wantsContinue === "true" ? "يرغب بالاستمرار ✅" : data.wantsContinue === "false" ? "لا يرغب بالاستمرار ❌" : ""}`,
        link: "/admin/meetings",
      };

    // ─── General ───
    case "general":
      return {
        title: data.title || "إشعار",
        message: data.message || "",
        link: data.link || "/dashboard",
      };
  }
}

/**
 * Send in-app notification to a specific user.
 * System notifications only — no email.
 */
export async function sendNotification(input: NotifyInput) {
  const notif = buildNotification(input.type, input.data);

  await supabaseAdmin.from("notifications").insert({
    user_id: input.userId,
    title: notif.title,
    message: notif.message,
    link: notif.link,
    type: input.type,
  });
}

/**
 * Send in-app notification to ALL admins.
 */
export async function sendAdminNotifications(input: {
  type: NotificationType;
  data?: Record<string, string>;
}) {
  const { data: admins } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (!admins || admins.length === 0) return;

  const notif = buildNotification(input.type, input.data);

  const rows = admins.map((admin) => ({
    user_id: admin.id,
    title: notif.title,
    message: notif.message,
    link: notif.link,
    type: input.type,
  }));

  await supabaseAdmin.from("notifications").insert(rows);
}
