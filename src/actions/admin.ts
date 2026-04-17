"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/lib/notifications";

/**
 * handleApplicationApproval
 *
 * Security model (two-layer):
 * ─────────────────────────────────────────────────────────
 * Layer 1 — Authentication & Authorization (supabaseServer)
 *   Reads the session from the HTTP-only cookies set during login.
 *   This value CANNOT be forged by the browser.
 *   We fetch the caller's profile and assert role === 'admin'.
 *
 * Layer 2 — Privileged write (supabaseAdmin / service_role)
 *   Only reached if Layer 1 passes.
 *   The userId used for all writes is fetched from the DB using
 *   the trusted applicationId — it is NEVER taken from the client.
 *   This closes the IDOR vector that existed when userId was a
 *   client-supplied parameter.
 * ─────────────────────────────────────────────────────────
 *
 * @param applicationId  - The UUID of the teacher_application row (safe: only used as a lookup key)
 * @param status         - The target status to set
 */
export async function handleApplicationApproval(
  applicationId: string,
  status: "approved" | "rejected" | "pending"
) {
  // ── Layer 1: Verify the caller is an authenticated admin ──────────────────
  const supabaseServer = await createClient();
  const {
    data: { user: callerUser },
    error: sessionError,
  } = await supabaseServer.auth.getUser();

  if (sessionError || !callerUser) {
    return { success: false, error: "غير مصرح: يجب تسجيل الدخول أولاً" };
  }

  // Read the caller's role from the DB (via supabaseServer — respects RLS)
  const { data: callerProfile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("id", callerUser.id)
    .single();

  if (profileError || callerProfile?.role !== "admin") {
    return { success: false, error: "غير مصرح: هذه العملية للمسؤولين فقط" };
  }

  // ── Layer 2: Execute the privileged action via supabaseAdmin ─────────────

  try {
    // 1. Fetch the application first — this gives us the TRUSTED userId
    //    from the DB, never from the client.
    const { data: appData, error: fetchError } = await supabaseAdmin
      .from("teacher_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }
    
    if (!appData) {
      return { success: false, error: "الطلب غير موجود" };
    }

    // trustedUserId is sourced from the DB row — immune to IDOR
    const trustedUserId = appData.user_id;

    // 2. Update the application status
    const { error: updateError } = await supabaseAdmin
      .from("teacher_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", applicationId);

    if (updateError) throw new Error(updateError.message);

    // 3. Additional steps when approving
    if (status === "approved") {
      // Fetch the user's profile to get grade_levels saved during onboarding
      const { data: userProfile } = await supabaseAdmin
        .from("profiles")
        .select("grade_level")
        .eq("id", trustedUserId)
        .single();

      // Parse grade_levels from the JSON string stored in profiles
      let gradeLevels: string[] = [];
      try {
        if (userProfile?.grade_level) {
          gradeLevels = JSON.parse(userProfile.grade_level);
        }
      } catch { /* ignore parse errors */ }

      // 3a. Create / Update the public teacher profile
      const { error: profileUpsertError } = await supabaseAdmin
        .from("teacher_public_profiles")
        .upsert({
          teacher_id: trustedUserId,
          bio: appData.bio,
          subjects: [appData.subject],
          districts: appData.districts || [],
          grade_levels: gradeLevels,
          is_published: true,
          updated_at: new Date().toISOString(),
        });

      if (profileUpsertError) throw new Error(profileUpsertError.message);

      // 3b. Promote the user's role to 'teacher'
      const { error: roleError } = await supabaseAdmin
        .from("profiles")
        .update({ role: "teacher", updated_at: new Date().toISOString() })
        .eq("id", trustedUserId);

      if (roleError) throw new Error(roleError.message);

      console.log(`✅ Teacher ${trustedUserId} approved. Public profile upserted.`);
    }

    // 4. Send notification to the teacher (platform + email)
    const notifType = status === "approved" ? "application_approved" : "application_rejected";
    await sendNotification({
      userId: trustedUserId,
      type: notifType as "application_approved" | "application_rejected",
      data: { teacherName: "" },
    });

    // 5. Revalidate relevant cache paths
    revalidatePath("/admin/applications");
    revalidatePath("/admin");
    revalidatePath("/teachers");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "خطأ غير متوقع";
    console.error("Server Action Error [handleApplicationApproval]:", message);
    return { success: false, error: message };
  }
}

/**
 * deleteOwnAccount
 * Higher-level action for a user to delete themselves.
 */
export async function deleteOwnAccount() {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) return { success: false, error: "غير مصرح" };

  try {
    // Reuse the same logic but for own ID
    const userId = user.id;
    
    // Cleanup
    await supabaseAdmin.from("reviews").delete().eq("teacher_id", userId);
    await supabaseAdmin.from("bookings").delete().eq("teacher_id", userId);
    await supabaseAdmin.from("teacher_public_profiles").delete().eq("teacher_id", userId);
    await supabaseAdmin.from("teacher_applications").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);
    
    await supabaseAdmin.auth.admin.deleteUser(userId);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * toggleTeacherPublish
 * Securely toggles the 'is_published' status of a teacher profile.
 */
export async function toggleTeacherPublish(teacherId: string, publish: boolean) {
  const supabaseServer = await createClient();
  const { data: { user: callerUser } } = await supabaseServer.auth.getUser();

  if (!callerUser) return { success: false, error: "غير مصرح" };

  const { data: profile } = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("id", callerUser.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "هذه العملية للمسؤولين فقط" };
  }

  try {
    const { error } = await supabaseAdmin
      .from("teacher_public_profiles")
      .update({ is_published: publish, updated_at: new Date().toISOString() })
      .eq("teacher_id", teacherId);

    if (error) throw error;

    revalidatePath("/admin/applications");
    revalidatePath("/teachers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * deleteTeacherAccount
 * Completely removes a user account from Auth and all tables.
 */
export async function deleteTeacherAccount(userId: string) {
  const supabaseServer = await createClient();
  const { data: { user: callerUser } } = await supabaseServer.auth.getUser();

  if (!callerUser) return { success: false, error: "غير مصرح" };

  const { data: profile } = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("id", callerUser.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "هذه العملية للمسؤولين فقط" };
  }

  try {
    // 1. Delete all related data first (cascading normally handles this, but we'll be safe)
    await supabaseAdmin.from("reviews").delete().eq("teacher_id", userId);
    await supabaseAdmin.from("bookings").delete().eq("teacher_id", userId);
    await supabaseAdmin.from("teacher_public_profiles").delete().eq("teacher_id", userId);
    await supabaseAdmin.from("teacher_applications").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // 2. Delete Auth User
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    revalidatePath("/admin/teachers");
    revalidatePath("/teachers");
    revalidatePath("/admin");
    
    return { success: true };
  } catch (err: any) {
    console.error("Delete Error:", err);
    return { success: false, error: err.message };
  }
}
