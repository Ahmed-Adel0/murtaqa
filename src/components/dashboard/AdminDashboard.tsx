"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  ChevronLeft,
  ShieldCheck,
  Settings as SettingsIcon,
  Bell,
  LayoutDashboard,
  GraduationCap,
  Search,
  Banknote,
  Calendar,
  TrendingUp,
  Star,
  Activity,
  MapPin,
  Loader2,
  Clock,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Inbox,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { AdminStats, Profile } from "@/lib/types";
import { DashboardLayout } from "./shared/DashboardLayout";
import type { SidebarItem } from "./shared/Sidebar";
import { getAdminAnalytics, type AdminAnalytics } from "@/actions/analytics";

export default function AdminDashboard({
  stats,
  profile,
}: {
  stats: AdminStats;
  profile?: Profile;
}) {
  const [analytics, setAnalytics] = useState<AdminAnalytics>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getAdminAnalytics();
      setAnalytics(data);
      setLoading(false);
    })();
  }, []);

  const items: SidebarItem[] = [
    { id: "overview", label: "نظرة عامة", icon: <LayoutDashboard className="w-5 h-5" />, href: "/dashboard" },
    { id: "applications", label: "طلبات الانضمام", icon: <UserPlus className="w-5 h-5" />, href: "/admin/applications", badge: stats.pending || undefined },
    { id: "bookings", label: "طلبات الطلاب", icon: <Inbox className="w-5 h-5" />, href: "/admin/bookings", badge: analytics?.counts.requests.new || undefined },
    { id: "teachers", label: "المعلمين", icon: <Users className="w-5 h-5" />, href: "/admin/teachers", badge: stats.approved || undefined },
    { id: "students", label: "الطلاب", icon: <GraduationCap className="w-5 h-5" />, href: "/admin/students" },
    { id: "meetings", label: "الحصص", icon: <Calendar className="w-5 h-5" />, href: "/admin/meetings" },
    { id: "search", label: "بحث", icon: <Search className="w-5 h-5" />, href: "/admin/search" },
    { id: "payments", label: "المدفوعات", icon: <Banknote className="w-5 h-5" />, href: "/admin/payments" },
    { id: "notifications", label: "الإشعارات", icon: <Bell className="w-5 h-5" />, href: "/admin/notifications" },
    { id: "settings", label: "الإعدادات", icon: <SettingsIcon className="w-5 h-5" />, href: "#" },
  ];

  return (
    <DashboardLayout
      title="لوحة التحكم"
      subtitle="نظرة شاملة على أداء المنصة"
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
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : !analytics ? (
        <div className="text-center py-32">
          <p className="text-white/40">تعذّر تحميل الإحصائيات</p>
        </div>
      ) : (
        <AnalyticsContent analytics={analytics} stats={stats} />
      )}
    </DashboardLayout>
  );
}

function AnalyticsContent({ analytics, stats }: { analytics: NonNullable<AdminAnalytics>; stats: AdminStats }) {
  const c = analytics.counts;

  return (
    <div className="space-y-6">
      {/* ═══ Top Stats ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="إجمالي المستخدمين"
          value={c.totalUsers}
          icon={<Users className="w-5 h-5" />}
          gradient="from-blue-500/20 to-blue-500/5"
          iconColor="text-blue-400"
        />
        <KpiCard
          label="الطلاب"
          value={c.students}
          icon={<GraduationCap className="w-5 h-5" />}
          gradient="from-purple-500/20 to-purple-500/5"
          iconColor="text-purple-400"
        />
        <KpiCard
          label="المعلمين"
          value={c.teachers}
          icon={<UserPlus className="w-5 h-5" />}
          gradient="from-emerald-500/20 to-emerald-500/5"
          iconColor="text-emerald-400"
        />
        <KpiCard
          label="الإيرادات"
          value={c.payments.revenue}
          suffix=" ريال"
          icon={<DollarSign className="w-5 h-5" />}
          gradient="from-green-500/20 to-green-500/5"
          iconColor="text-green-400"
        />
      </div>

      {/* ═══ Quick Status ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MiniStatCard label="طلبات جديدة" value={c.requests.new} color="text-yellow-300" icon={<Inbox className="w-4 h-4" />} href="/admin/bookings" />
        <MiniStatCard label="طلبات الانضمام" value={c.applications.pending} color="text-yellow-400" icon={<Clock className="w-4 h-4" />} href="/admin/applications" />
        <MiniStatCard label="حصص تجريبية" value={c.lessons.trial} color="text-blue-400" icon={<Sparkles className="w-4 h-4" />} href="/admin/meetings" />
        <MiniStatCard label="اشتراكات نشطة" value={c.lessons.active} color="text-green-400" icon={<CheckCircle2 className="w-4 h-4" />} href="/admin/meetings" />
        <MiniStatCard label="مدفوعات معلقة" value={c.payments.pending} color="text-orange-400" icon={<Banknote className="w-4 h-4" />} href="/admin/payments" />
      </div>

      {/* ═══ Growth Chart (full width) ═══ */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-[24px] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              نمو المنصة — آخر 30 يوم
            </h3>
            <p className="text-xs text-white/40 mt-0.5">تسجيلات الطلاب والمعلمين والحصص اليومية</p>
          </div>
        </div>
        <div className="h-[280px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.growth}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: "10px" }} tickMargin={8} />
              <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: "10px" }} />
              <Tooltip
                contentStyle={{
                  background: "#0a0a0b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Area type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorStudents)" name="طلاب" />
              <Area type="monotone" dataKey="teachers" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTeachers)" name="معلمين" />
              <Area type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" name="حصص" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ═══ 2-column: Lesson Breakdown + Rating Distribution ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lesson Breakdown Pie */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-[24px] p-6">
          <h3 className="font-black flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-purple-400" />
            توزيع حالات الحصص
          </h3>
          {analytics.lessonBreakdown.length === 0 ? (
            <p className="text-center text-white/30 py-12 text-sm">لا توجد حصص بعد</p>
          ) : (
            <div className="h-[240px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.lessonBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={(entry) => `${entry.value}`}
                  >
                    {analytics.lessonBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0a0a0b",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Rating distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white/5 border border-white/10 rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              توزيع التقييمات
            </h3>
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-400 font-black text-lg">
                <Star className="w-4 h-4 fill-yellow-400" />
                {c.reviews.avgRating.toFixed(1)}
              </div>
              <p className="text-[9px] text-white/30">{c.reviews.total} تقييم</p>
            </div>
          </div>
          {c.reviews.total === 0 ? (
            <p className="text-center text-white/30 py-12 text-sm">لا توجد تقييمات بعد</p>
          ) : (
            <div className="h-[240px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.ratingDist} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" style={{ fontSize: "10px" }} />
                  <YAxis dataKey="star" type="category" stroke="rgba(255,255,255,0.3)" style={{ fontSize: "11px" }} width={50} />
                  <Tooltip
                    contentStyle={{
                      background: "#0a0a0b",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#facc15" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* ═══ 2-column: Top Teachers + Top Cities ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Teachers */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              أفضل 5 معلمين
            </h3>
            <Link href="/admin/teachers" className="text-[11px] text-blue-400 hover:text-blue-300 font-bold">عرض الكل ←</Link>
          </div>
          {analytics.topTeachers.length === 0 ? (
            <p className="text-center text-white/30 py-12 text-sm">لا يوجد معلمين بعد</p>
          ) : (
            <div className="space-y-2">
              {analytics.topTeachers.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    i === 0 ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20" :
                    i === 1 ? "bg-gray-400/15 text-gray-300 border border-gray-400/20" :
                    i === 2 ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" :
                    "bg-white/5 text-white/40"
                  }`}>{i + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-white/10 overflow-hidden relative shrink-0">
                    {t.avatar ? (
                      <Image src={t.avatar} alt="" fill sizes="36px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-400/60 text-sm font-black">
                        {(t.name ?? "?")[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{t.name ?? "معلم"}</p>
                    <div className="flex items-center gap-3 text-[10px] text-white/40">
                      <span className="flex items-center gap-0.5 text-yellow-400">
                        <Star className="w-2.5 h-2.5 fill-yellow-400" />
                        {t.rating > 0 ? t.rating.toFixed(1) : "—"}
                      </span>
                      <span>{t.reviewCount} تقييم</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-blue-400">{t.bookings}</p>
                    <p className="text-[9px] text-white/30">حصة</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Top Cities */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white/5 border border-white/10 rounded-[24px] p-6">
          <h3 className="font-black flex items-center gap-2 mb-5">
            <MapPin className="w-5 h-5 text-red-400" />
            أكثر المدن نشاطاً
          </h3>
          {analytics.topCities.length === 0 ? (
            <p className="text-center text-white/30 py-12 text-sm">لا توجد بيانات بعد</p>
          ) : (
            <div className="h-[280px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topCities}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" style={{ fontSize: "10px" }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: "10px" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0a0a0b",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* ═══ Quick Actions ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "طلبات المعلمين", desc: "مراجعة واعتماد", icon: <UserPlus className="w-5 h-5" />, link: "/admin/applications", count: c.applications.pending, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
          { title: "الطلاب", desc: "إدارة الحسابات", icon: <GraduationCap className="w-5 h-5" />, link: "/admin/students", count: c.students, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
          { title: "الحصص", desc: "إدارة وتقييم", icon: <Calendar className="w-5 h-5" />, link: "/admin/meetings", count: c.lessons.total, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
          { title: "المدفوعات", desc: "تأكيد وتحقق", icon: <Banknote className="w-5 h-5" />, link: "/admin/payments", count: c.payments.pending, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
        ].map((item) => (
          <Link href={item.link} key={item.title}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-2xl border ${item.color} transition-all cursor-pointer`}>
              <div className="flex items-start justify-between mb-3">
                {item.icon}
                <span className="text-2xl font-black">{item.count}</span>
              </div>
              <p className="font-bold text-sm">{item.title}</p>
              <p className="text-[10px] opacity-60 mt-0.5">{item.desc}</p>
              <ChevronLeft className="w-3 h-3 opacity-40 mt-3" />
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══ UI Components ═══ */

function KpiCard({
  label, value, icon, gradient, iconColor, suffix,
}: {
  label: string; value: number; icon: React.ReactNode; gradient: string; iconColor: string; suffix?: string;
}) {
  return (
    <div className={`relative p-5 rounded-[24px] border border-white/10 bg-gradient-to-br ${gradient} overflow-hidden`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`${iconColor}`}>{icon}</span>
      </div>
      <p className="text-xs text-white/40 font-bold mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-black">
        {value.toLocaleString("ar-EG")}{suffix && <span className="text-xs text-white/40 font-normal mr-1">{suffix}</span>}
      </p>
    </div>
  );
}

function MiniStatCard({
  label, value, color, icon, href,
}: {
  label: string; value: number; color: string; icon: React.ReactNode; href: string;
}) {
  return (
    <Link href={href}>
      <motion.div whileHover={{ y: -2 }}
        className="p-4 bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-2xl transition-all cursor-pointer">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`${color}`}>{icon}</span>
          <span className={`text-lg font-black ${color}`}>{value}</span>
        </div>
        <p className="text-[10px] text-white/40 font-bold">{label}</p>
      </motion.div>
    </Link>
  );
}
