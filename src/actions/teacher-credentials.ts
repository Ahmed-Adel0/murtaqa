"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";

/**
 * Allows a logged-in teacher (with a placeholder @murtaqa.com email)
 * to set their real email and a new password.
 *
 * Security:
 *  - Layer 1: Verify the caller is authenticated via session cookies.
 *  - Layer 2: Verify the current auth email ends with @murtaqa.com
 *             (i.e. it's a legacy placeholder).
 *  - Layer 3: Use supabaseAdmin to update auth.users + profiles.
 */
export async function updateTeacherCredentials(input: {
  newEmail: string;
  newPassword: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "يجب تسجيل الدخول أولاً" };
  }

  // Only allow teachers with placeholder emails
  const currentEmail = user.email ?? "";
  if (!currentEmail.endsWith("@murtaqa.com")) {
    return {
      success: false,
      error: "هذه العملية متاحة فقط للحسابات التي تحتاج تحديث البريد الإلكتروني",
    };
  }

  // Validate input
  const email = input.newEmail.trim().toLowerCase();
  if (!email || !email.includes("@") || email.endsWith("@murtaqa.com")) {
    return { success: false, error: "يرجى إدخال بريد إلكتروني صالح" };
  }
  if (!input.newPassword || input.newPassword.length < 6) {
    return {
      success: false,
      error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    };
  }

  try {
    // Check if the new email is already in use
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailTaken = existingUsers?.users?.some(
      (u) => u.email === email && u.id !== user.id
    );
    if (emailTaken) {
      return {
        success: false,
        error: "هذا البريد الإلكتروني مستخدم بالفعل في حساب آخر",
      };
    }

    // Update auth user email + password
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email,
        password: input.newPassword,
        email_confirm: true, // auto-confirm since this is an admin operation
      });

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Update the email in profiles table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ email, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Non-fatal — auth email was already updated
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    console.error("updateTeacherCredentials error:", message);
    return { success: false, error: message };
  }
}

/**
 * Check if the current user has a legacy placeholder email.
 */
export async function checkIsLegacyTeacher(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  return (user.email ?? "").endsWith("@murtaqa.com");
}
