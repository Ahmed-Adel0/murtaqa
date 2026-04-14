import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import type { Profile, Role } from "@/lib/types";

export async function getSessionUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, username, phone, city, avatar_url, role, is_suspended, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile) ?? null;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireRole(role: Role | Role[]): Promise<Profile> {
  const profile = await requireProfile();
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(profile.role)) redirect("/");
  return profile;
}
