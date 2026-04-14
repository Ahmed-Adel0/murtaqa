"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Bell,
  Settings as SettingsIcon,
  Menu,
} from "lucide-react";
import { Sidebar, type SidebarItem } from "./Sidebar";

export function AdminShell({
  user,
  children,
}: {
  user: { displayName: string | null; avatarUrl: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeId = pathname.startsWith("/admin/applications")
    ? "applications"
    : pathname.startsWith("/admin/teachers")
    ? "teachers"
    : pathname.startsWith("/admin/notifications")
    ? "notifications"
    : "overview";

  const items: SidebarItem[] = useMemo(
    () => [
      { id: "overview", label: "نظرة عامة", icon: <LayoutDashboard className="w-5 h-5" />, href: "/dashboard" },
      { id: "applications", label: "طلبات الانضمام", icon: <UserPlus className="w-5 h-5" />, href: "/admin/applications" },
      { id: "teachers", label: "قائمة المعلمين", icon: <Users className="w-5 h-5" />, href: "/admin/teachers" },
      { id: "notifications", label: "الإشعارات", icon: <Bell className="w-5 h-5" />, href: "/admin/notifications" },
      { id: "settings", label: "الإعدادات", icon: <SettingsIcon className="w-5 h-5" />, href: "#" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal antialiased" dir="rtl">
      <Sidebar
        title="لوحة الإدارة"
        items={items}
        activeId={activeId}
        user={{ ...user, roleLabel: "مسؤول" }}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="md:hidden fixed top-20 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 hover:bg-white/15 text-xs font-bold"
        aria-label="فتح القائمة"
      >
        <Menu className="w-4 h-4" />
        القائمة
      </button>

      <div className="md:pr-[20rem]">{children}</div>
    </div>
  );
}
