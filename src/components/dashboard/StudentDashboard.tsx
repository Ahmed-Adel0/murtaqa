"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  RefreshCcw,
  CheckCircle2,
  Star,
  MapPin,
  MessageCircle,
  UserCircle,
  Loader2,
  CalendarCheck,
  Bell,
  Settings as SettingsIcon,
  User,
  Phone,
  MapPinned,
  Save,
  Inbox,
} from "lucide-react";
import { acceptCurrentMatch, rejectCurrentMatch } from "@/actions/matches";
import { updateOwnProfile } from "@/actions/profile";
import { supabase } from "@/lib/supabase";
import type { MatchWithTeacher, Profile } from "@/lib/types";
import { DashboardLayout } from "./shared/DashboardLayout";
import type { SidebarItem } from "./shared/Sidebar";

type Section = "match" | "bookings" | "notifications" | "settings";

type NotificationRow = {
  id: string;
  title: string | null;
  message: string | null;
  created_at: string;
  is_read: boolean;
};

type BookingRow = {
  id: string;
  teacher_id: string;
  created_at: string;
  status?: string | null;
};

export default function StudentDashboard({
  profile,
  match,
}: {
  profile: Profile;
  match: MatchWithTeacher | null;
}) {
  const [section, setSection] = useState<Section>("match");
  const [notifs, setNotifs] = useState<NotificationRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: n }, { data: b }] = await Promise.all([
        supabase
          .from("notifications")
          .select("id,title,message,created_at,is_read")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("bookings")
          .select("id,teacher_id,created_at,status")
          .eq("student_id", profile.id)
          .order("created_at", { ascending: false }),
      ]);
      setNotifs((n as NotificationRow[]) ?? []);
      setBookings((b as BookingRow[]) ?? []);
    })();
  }, [profile.id]);

  const unread = notifs.filter((n) => !n.is_read).length;

  const items: SidebarItem[] = useMemo(
    () => [
      {
        id: "match",
        label: "معلمي المقترح",
        icon: <Sparkles className="w-5 h-5" />,
        onSelect: () => setSection("match"),
      },
      {
        id: "bookings",
        label: "حجوزاتي",
        icon: <CalendarCheck className="w-5 h-5" />,
        onSelect: () => setSection("bookings"),
        badge: bookings.length || undefined,
      },
      {
        id: "notifications",
        label: "الإشعارات",
        icon: <Bell className="w-5 h-5" />,
        onSelect: () => setSection("notifications"),
        badge: unread || undefined,
      },
      {
        id: "settings",
        label: "الإعدادات",
        icon: <SettingsIcon className="w-5 h-5" />,
        onSelect: () => setSection("settings"),
      },
    ],
    [bookings.length, unread]
  );

  const sectionMeta: Record<Section, { title: string; subtitle: string }> = {
    match: {
      title: `أهلاً، ${profile.full_name?.split(" ")[0] ?? "طالبنا"}`,
      subtitle:
        match?.status === "accepted"
          ? "تم ربطك بمعلمك. يمكنك التواصل وترتيب الدروس."
          : "ترشيح المنصة المناسب لك حالياً.",
    },
    bookings: { title: "حجوزاتي", subtitle: "سجل جلساتك مع المعلمين." },
    notifications: { title: "الإشعارات", subtitle: "آخر تحديثات حسابك." },
    settings: { title: "الإعدادات", subtitle: "بياناتك الشخصية وطرق التواصل." },
  };

  return (
    <DashboardLayout
      title={sectionMeta[section].title}
      subtitle={sectionMeta[section].subtitle}
      user={{
        displayName: profile.full_name,
        avatarUrl: profile.avatar_url,
        roleLabel: "طالب",
      }}
      items={items}
      activeId={section}
    >
      {section === "match" && <MatchSection match={match} />}
      {section === "bookings" && <BookingsSection bookings={bookings} />}
      {section === "notifications" && (
        <NotificationsSection notifs={notifs} onChange={setNotifs} />
      )}
      {section === "settings" && <SettingsSection profile={profile} />}
    </DashboardLayout>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function MatchSection({ match }: { match: MatchWithTeacher | null }) {
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);

  if (!match) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-7 h-7 text-blue-400" />
        </div>
        <h3 className="text-lg font-black mb-2">جاري البحث عن معلمين متاحين</h3>
        <p className="text-white/40 text-sm">سنقوم بترشيح معلم لك فور توفره.</p>
      </div>
    );
  }

  const onReject = () => {
    startTransition(async () => {
      await rejectCurrentMatch(match.id, rejectReason.trim() || undefined);
      setRejectReason("");
      setShowRejectBox(false);
    });
  };

  const onAccept = () => {
    startTransition(() => {
      acceptCurrentMatch(match.id);
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={match.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8 shadow-2xl"
      >
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          {match.status === "accepted" ? "معلمك الحالي" : "ترشيح المنصة لك"}
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden bg-blue-500/10 border border-white/10 relative shrink-0">
            {match.teacher.avatar_url ? (
              <Image src={match.teacher.avatar_url} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserCircle className="w-14 h-14 text-blue-400/60" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3 min-w-0">
            <div>
              <h2 className="text-xl md:text-2xl font-black mb-1 truncate">
                {match.teacher.full_name ?? "معلم متاح"}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/50 font-bold">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 5.0
                </span>
                {match.teacher.districts && match.teacher.districts.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {match.teacher.districts.slice(0, 2).join("، ")}
                  </span>
                )}
              </div>
            </div>

            {match.teacher.bio && (
              <p className="text-white/60 text-sm leading-relaxed line-clamp-3">{match.teacher.bio}</p>
            )}

            {match.teacher.subjects && match.teacher.subjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {match.teacher.subjects.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          {match.status === "accepted" ? (
            <div className="flex flex-col md:flex-row gap-3">
              <button
                type="button"
                className="flex-1 bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                بدء المحادثة مع المعلم
              </button>
              <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-bold px-5 py-3.5 bg-green-500/5 border border-green-500/20 rounded-2xl">
                <CheckCircle2 className="w-4 h-4" />
                مرتبط حالياً
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  type="button"
                  onClick={onAccept}
                  disabled={isPending}
                  className="flex-1 bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  اختيار هذا المعلم
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectBox((v) => !v)}
                  disabled={isPending}
                  className="md:w-auto md:px-6 bg-white/5 border border-white/10 hover:bg-white/10 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <RefreshCcw className="w-4 h-4" />
                  معلم آخر
                </button>
              </div>

              <AnimatePresence>
                {showRejectBox && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 bg-white/[0.03] border border-white/10 rounded-2xl space-y-3">
                      <label className="text-xs text-white/60 font-bold">سبب طلب التبديل (اختياري)</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500 outline-none resize-none"
                        placeholder="مثال: أحتاج معلماً متخصصاً في مادة أخرى..."
                      />
                      <button
                        type="button"
                        onClick={onReject}
                        disabled={isPending}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "تأكيد طلب ترشيح جديد"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function BookingsSection({ bookings }: { bookings: BookingRow[] }) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
          <CalendarCheck className="w-7 h-7 text-white/30" />
        </div>
        <h3 className="text-lg font-black mb-2">لا توجد حجوزات بعد</h3>
        <p className="text-white/40 text-sm">ستظهر هنا جلساتك مع المعلم فور تأكيدها.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div
          key={b.id}
          className="bg-white/5 border border-white/10 rounded-[24px] p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-sm">حجز مع معلم</p>
              <p className="text-xs text-white/40">
                {new Date(b.created_at).toLocaleDateString("ar-EG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-white/40">
            {b.status ?? "قيد المراجعة"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function NotificationsSection({
  notifs,
  onChange,
}: {
  notifs: NotificationRow[];
  onChange: (v: NotificationRow[]) => void;
}) {
  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
    onChange(notifs.map((n) => ({ ...n, is_read: true })));
  };

  const unread = notifs.filter((n) => !n.is_read).length;

  if (notifs.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
          <Inbox className="w-7 h-7 text-white/30" />
        </div>
        <h3 className="text-lg font-black mb-2">لا توجد إشعارات</h3>
        <p className="text-white/40 text-sm">سيظهر هنا كل جديد من المنصة.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unread > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold"
          >
            تحديد الكل كمقروء
          </button>
        </div>
      )}
      {notifs.map((n) => (
        <motion.div
          key={n.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-[24px] border transition-all ${
            n.is_read
              ? "bg-white/[0.02] border-white/5 text-white/50"
              : "bg-blue-500/5 border-blue-500/20 text-white"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                n.is_read ? "bg-white/5" : "bg-blue-600/20 text-blue-400"
              }`}
            >
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm mb-1">{n.title}</h4>
              <p className="text-xs leading-relaxed">{n.message}</p>
              <p className="text-[10px] mt-2 opacity-50">
                {new Date(n.created_at).toLocaleDateString("ar-EG")}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function SettingsSection({ profile }: { profile: Profile }) {
  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    city: profile.city ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await updateOwnProfile(form);
    setSaving(false);
    if (res.success) setMessage({ kind: "success", text: "تم حفظ التغييرات بنجاح." });
    else setMessage({ kind: "error", text: res.error ?? "تعذّر الحفظ" });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <form onSubmit={save} className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8 space-y-5">
      <SettingsField
        icon={<User className="w-4 h-4" />}
        label="الاسم الكامل"
        value={form.full_name}
        onChange={(v) => setForm((f) => ({ ...f, full_name: v }))}
      />
      <SettingsField
        icon={<Phone className="w-4 h-4" />}
        label="رقم الجوال"
        value={form.phone}
        onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
        type="tel"
      />
      <SettingsField
        icon={<MapPinned className="w-4 h-4" />}
        label="المدينة"
        value={form.city}
        onChange={(v) => setForm((f) => ({ ...f, city: v }))}
      />

      {message && (
        <div
          className={`p-3 rounded-xl text-sm font-bold text-center ${
            message.kind === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        حفظ التغييرات
      </button>
    </form>
  );
}

function SettingsField({
  icon,
  label,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-white/40 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pr-11 pl-5 focus:border-blue-500 outline-none transition-all font-bold text-sm"
        />
      </div>
    </div>
  );
}
