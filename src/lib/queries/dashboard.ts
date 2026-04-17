import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabaseServer";
import { getApplicationForUser } from "@/lib/queries/applications";
import type { AdminStats, DashboardState } from "@/lib/types";

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("teacher_applications")
    .select("status");
  const rows = data ?? [];
  return {
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };
}

export async function getDashboardState(): Promise<DashboardState | null> {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  if (profile.role === "admin") {
    const stats = await getAdminStats();
    return { kind: "admin", profile, stats };
  }

  if (profile.role === "teacher") {
    return { kind: "teacher", profile };
  }

  // role === 'student' — two sub-flows:
  // (a) has an active teacher_application → show pending/rejected screen
  // (b) no application → student dashboard with match suggestion
  const application = await getApplicationForUser(profile.id);
  if (application) {
    if (application.status === "pending") {
      return { kind: "teacher-pending", profile, application };
    }
    if (application.status === "rejected") {
      return { kind: "teacher-rejected", profile, application };
    }
    // approved but role not yet promoted — edge case, treat as teacher
    if (application.status === "approved") {
      return { kind: "teacher", profile };
    }
  }

  // Pure student path — no auto-matching; admin controls everything
  return { kind: "student", profile, match: null };
}

