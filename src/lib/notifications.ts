"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getResend } from "@/lib/email/resend-client";
import { bookingRequestTemplate } from "@/lib/email/templates/booking-request";
import { applicationApprovedTemplate, applicationRejectedTemplate } from "@/lib/email/templates/application-status";
import { matchSuggestionTemplate } from "@/lib/email/templates/match-suggestion";
import { paymentVerifiedTemplate, paymentRejectedTemplate } from "@/lib/email/templates/payment-status";
import { meetingScheduledTemplate } from "@/lib/email/templates/meeting-scheduled";

type NotificationType =
  | "booking_request"
  | "application_approved"
  | "application_rejected"
  | "match_suggestion"
  | "payment_verified"
  | "payment_rejected"
  | "meeting_scheduled";

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  data: Record<string, string>;
}

function getTemplate(type: NotificationType, data: Record<string, string>) {
  switch (type) {
    case "booking_request":
      return bookingRequestTemplate({ teacherName: data.teacherName ?? "", studentName: data.studentName ?? "" });
    case "application_approved":
      return applicationApprovedTemplate({ teacherName: data.teacherName ?? "" });
    case "application_rejected":
      return applicationRejectedTemplate({ teacherName: data.teacherName ?? "" });
    case "match_suggestion":
      return matchSuggestionTemplate({ studentName: data.studentName ?? "", teacherName: data.teacherName ?? "" });
    case "payment_verified":
      return paymentVerifiedTemplate({ studentName: data.studentName ?? "", amount: data.amount ?? "0" });
    case "payment_rejected":
      return paymentRejectedTemplate({ studentName: data.studentName ?? "", reason: data.reason });
    case "meeting_scheduled":
      return meetingScheduledTemplate({
        userName: data.userName ?? "",
        otherName: data.otherName ?? "",
        scheduledAt: data.scheduledAt ?? "",
        duration: parseInt(data.duration ?? "60"),
        role: (data.role as "teacher" | "student") ?? "student",
      });
  }
}

/**
 * sendNotification — unified multi-channel notification sender
 *
 * 1. Inserts in-app notification (notifications table)
 * 2. Sends email via Resend (non-blocking — won't fail the parent action)
 */
export async function sendNotification(payload: NotificationPayload) {
  const { userId, type, data } = payload;

  // Get user's email and name
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("email, full_name, phone")
    .eq("id", userId)
    .single();

  if (!profile?.email) return;

  const template = getTemplate(type, { ...data, userName: profile.full_name ?? "" });

  // 1. In-app notification
  await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    title: template.title,
    message: template.plainText,
    link: template.link,
    type,
  });

  // 2. Email via Resend (skip silently if not configured)
  try {
    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "مرتقى أكاديمي <onboarding@resend.dev>",
        to: profile.email,
        subject: template.subject,
        html: template.html,
      });
    }
  } catch (err) {
    console.error("[Email] Failed to send:", err);
    // Don't throw — in-app notification was already saved
  }
}

/**
 * sendAdminNotifications — notify all admins
 */
export async function sendAdminNotifications(notification: {
  title: string;
  message: string;
  link: string;
  type: string;
}) {
  const { data: admins } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (!admins) return;

  const notifs = admins.map((admin) => ({
    user_id: admin.id,
    ...notification,
  }));

  await supabaseAdmin.from("notifications").insert(notifs);
}
