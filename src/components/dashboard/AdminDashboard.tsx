"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  ChevronLeft,
  BarChart3,
  ShieldCheck,
  Settings as SettingsIcon,
  Bell,
  LayoutDashboard,
} from "lucide-react";
import type { AdminStats, Profile } from "@/lib/types";
import { DashboardLayout } from "./shared/DashboardLayout";
import type { SidebarItem } from "./shared/Sidebar";

export default function AdminDashboard({
  stats,
  profile,
}: {
  stats: AdminStats;
  profile?: Profile;
}) {
  const items: SidebarItem[] = [
    { id: "overview", label: "نظرة عامة", icon: <LayoutDashboard className="w-5 h-5" />, href: "/dashboard" },
    { id: "applications", label: "طلبات الانضمام", icon: <UserPlus className="w-5 h-5" />, href: "/admin/applications", badge: stats.pending || undefined },
    { id: "teachers", label: "قائمة المعلمين", icon: <Users className="w-5 h-5" />, href: "/admin/teachers", badge: stats.approved || undefined },
    { id: "notifications", label: "الإشعارات", icon: <Bell className="w-5 h-5" />, href: "/admin/notifications" },
    { id: "settings", label: "الإعدادات", icon: <SettingsIcon className="w-5 h-5" />, href: "#" },
  ];

  return (
    <DashboardLayout
      title="نظرة عامة"
      subtitle="مرحباً بك في مركز إدارة أكاديمية مرتقى."
      user={{
        displayName: profile?.full_name ?? "المدير",
        avatarUrl: profile?.avatar_url ?? null,
        roleLabel: "مسؤول",
      }}
      items={items}
      activeId="overview"
      headerAction={
        <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <div className="text-right">
            <p className="text-[9px] text-white/40 uppercase tracking-widest">حالة النظام</p>
            <p className="text-xs font-bold text-green-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              يعمل بكفاءة
            </p>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="إجمالي الطلبات" value={stats.total} icon={<BarChart3 className="w-4 h-4" />} />
        <StatCard label="قيد الانتظار" value={stats.pending} color="text-blue-400" glow="bg-blue-500/10" />
        <StatCard label="تم قبولهم" value={stats.approved} color="text-green-400" glow="bg-green-500/10" />
        <StatCard label="مرفوضين" value={stats.rejected} color="text-red-400" glow="bg-red-500/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: "طلبات الانضمام",
            desc: "مراجعة واعتماد المعلمين الجدد",
            icon: <UserPlus className="w-5 h-5 text-blue-400" />,
            link: "/admin/applications",
            count: stats.pending,
            highlight: true,
          },
          {
            title: "قائمة المعلمين",
            desc: "إدارة وتعديل بيانات المعلمين الحاليين",
            icon: <Users className="w-5 h-5 text-purple-400" />,
            link: "/admin/teachers",
            count: stats.approved,
          },
          {
            title: "سجل الإشعارات",
            desc: "تتبع الحجوزات والعمليات الأخيرة",
            icon: <Bell className="w-5 h-5 text-emerald-400" />,
            link: "/admin/notifications",
          },
          {
            title: "الإعدادات",
            desc: "ضبط إعدادات المنصة",
            icon: <SettingsIcon className="w-5 h-5 text-orange-400" />,
            link: "#",
          },
        ].map((item, i) => (
          <Link href={item.link} key={item.title}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`group p-5 md:p-6 rounded-[24px] border transition-all cursor-pointer flex items-center justify-between ${
                item.highlight
                  ? "bg-blue-600 border-blue-500 shadow-xl shadow-blue-900/20"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    item.highlight ? "bg-white/20" : "bg-white/5"
                  }`}
                >
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base md:text-lg font-bold mb-0.5 truncate">{item.title}</h3>
                  <p className={`text-xs truncate ${item.highlight ? "text-white/70" : "text-white/40"}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {item.count !== undefined && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.highlight ? "bg-white text-blue-600" : "bg-white/5 text-white/60"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                <ChevronLeft
                  className={`w-4 h-4 ${
                    item.highlight ? "text-white" : "text-white/20"
                  } group-hover:translate-x-1 transition-transform`}
                />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  color = "text-white",
  glow,
  icon,
}: {
  label: string;
  value: number;
  color?: string;
  glow?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-[20px] relative overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-white/40">{label}</p>
        {icon && <span className="text-white/20">{icon}</span>}
      </div>
      <p className={`text-2xl md:text-3xl font-black ${color}`}>{value}</p>
      {glow && <div className={`absolute top-0 right-0 w-20 h-20 ${glow} blur-3xl -z-10`} />}
    </div>
  );
}
