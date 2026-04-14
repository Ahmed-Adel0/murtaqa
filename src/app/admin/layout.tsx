import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { AdminShell } from "@/components/dashboard/shared/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/");

  return (
    <AdminShell user={{ displayName: profile.full_name, avatarUrl: profile.avatar_url }}>
      {children}
    </AdminShell>
  );
}
