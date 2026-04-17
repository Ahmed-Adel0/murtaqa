"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { sendNotification, sendAdminNotifications } from "@/lib/notifications";

export async function submitPaymentProof(input: {
  bookingId: string;
  teacherId: string;
  bankAccountUsed: string;
  transferReference: string;
  amount: number;
  note?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح" };

  try {
    const { error } = await supabaseAdmin.from("payments").insert({
      student_id: user.id,
      teacher_id: input.teacherId,
      booking_id: input.bookingId,
      amount: input.amount,
      bank_account_used: input.bankAccountUsed,
      transfer_reference: input.transferReference,
      transfer_note: input.note || null,
      status: "pending",
    });

    if (error) throw error;

    // Notify admins
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    await sendAdminNotifications({
      title: "إثبات دفع جديد",
      message: `قام الطالب ${profile?.full_name ?? "طالب"} بتأكيد تحويل مبلغ ${input.amount} ريال.`,
      link: "/admin/payments",
      type: "payment",
    });

    revalidatePath("/admin/payments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function verifyPayment(paymentId: string) {
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
    // Fetch the payment to get the student_id
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("student_id, amount")
      .eq("id", paymentId)
      .single();

    if (!payment) return { success: false, error: "الدفعة غير موجودة" };

    const { error } = await supabaseAdmin
      .from("payments")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
        verified_by: user.id,
      })
      .eq("id", paymentId);

    if (error) throw error;

    // Notify student
    await sendNotification({
      userId: payment.student_id,
      type: "payment_verified",
      data: { amount: String(payment.amount) },
    });

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function rejectPayment(paymentId: string, reason: string) {
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
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("student_id")
      .eq("id", paymentId)
      .single();

    if (!payment) return { success: false, error: "الدفعة غير موجودة" };

    const { error } = await supabaseAdmin
      .from("payments")
      .update({
        status: "rejected",
        rejection_reason: reason,
        verified_at: new Date().toISOString(),
        verified_by: user.id,
      })
      .eq("id", paymentId);

    if (error) throw error;

    await sendNotification({
      userId: payment.student_id,
      type: "payment_rejected",
      data: { reason },
    });

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
