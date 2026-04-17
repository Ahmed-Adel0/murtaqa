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
  BookOpen,
  GraduationCap,
  ChevronLeft,
} from "lucide-react";
import { acceptCurrentMatch, rejectCurrentMatch } from "@/actions/matches";
import { updateOwnProfile } from "@/actions/profile";
import { saveStudentPreferencesAndMatch } from "@/actions/student-intake";
import { supabase } from "@/lib/supabase";
import type { MatchWithTeacher, Profile } from "@/lib/types";
import { GRADE_LEVELS } from "@/lib/constants/grade-levels";
import type { GradeLevel } from "@/lib/constants/grade-levels";
import { getSubjectsForGrade, SUBJECTS } from "@/lib/constants/subjects";
import { DashboardLayout } from "./shared/DashboardLayout";
import type { SidebarItem } from "./shared/Sidebar";

type Section = "match" | "bookings" | "meetings" | "notifications" | "settings";

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
        id: "meetings",
        label: "الحصص",
        icon: <GraduationCap className="w-5 h-5" />,
        onSelect: () => setSection("meetings"),
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
    meetings: { title: "الحصص", subtitle: "حصصك الدراسية المجدولة." },
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
      {section === "match" && <MatchSection match={match} profile={profile} />}
      {section === "bookings" && <BookingsSection bookings={bookings} />}
      {section === "meetings" && <MeetingsSection profileId={profile.id} />}
      {section === "notifications" && (
        <NotificationsSection notifs={notifs} onChange={setNotifs} />
      )}
      {section === "settings" && <SettingsSection profile={profile} />}
    </DashboardLayout>
  );
}

/* ────────────────────────────────────────────────────────────────────── */

function MatchSection({ match, profile }: { match: MatchWithTeacher | null; profile: Profile }) {
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);

  // If no match and student hasn't completed intake → show intake form
  if (!match && !profile.grade_level) {
    return <StudentIntakeForm />;
  }

  // If no match but student has grade → already attempted, no teachers available
  if (!match) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-7 h-7 text-blue-400" />
        </div>
        <h3 className="text-lg font-black mb-2">لا يوجد معلمون متاحون حالياً</h3>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          لم نتمكن من إيجاد معلم يناسب معاييرك حالياً. سنقوم بإشعارك فور توفر معلم مناسب.
        </p>
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

            {match.teacher.grade_levels && match.teacher.grade_levels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {match.teacher.grade_levels.map((g) => (
                  <span
                    key={g}
                    className="text-[11px] font-bold bg-green-500/10 text-green-300 border border-green-500/20 px-2.5 py-1 rounded-full"
                  >
                    {GRADE_LEVELS.find((gl) => gl.value === g)?.label ?? g}
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

function StudentIntakeForm() {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    grade_level: "",
    subject: "",
    city: "",
    teaching_type: "both" as "online" | "offline" | "both",
    notes: "",
  });

  const availableSubjects = form.grade_level
    ? getSubjectsForGrade(form.grade_level as GradeLevel)
    : SUBJECTS;

  const handleSubmit = () => {
    startTransition(async () => {
      setError(null);
      const res = await saveStudentPreferencesAndMatch({
        grade_level: form.grade_level,
        preferred_subject: form.subject,
        city: form.city || undefined,
        teaching_type: form.teaching_type,
        notes: form.notes || undefined,
      });
      if (!res.success) {
        setError(res.error ?? "حدث خطأ");
      }
      // On success the page will revalidate and show the match
    });
  };

  const totalSteps = 3;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-black">لنجد لك المعلم المثالي</h2>
            <p className="text-white/40 text-sm">أجب على بعض الأسئلة البسيطة لنرشح لك الأنسب.</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  s < step
                    ? "bg-green-500 text-white"
                    : s === step
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-white/30 border border-white/10"
                }`}
              >
                {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < totalSteps && (
                <div className={`flex-1 h-0.5 rounded-full ${s < step ? "bg-green-500" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Grade Level */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h3 className="font-bold text-lg mb-1">في أي مرحلة دراسية أنت؟</h3>
                <p className="text-white/40 text-sm">اختر مرحلتك الدراسية الحالية لنعرض لك ا��مواد المناسبة.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GRADE_LEVELS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, grade_level: g.value, subject: "" }));
                    }}
                    className={`p-4 rounded-2xl border-2 text-right font-bold transition-all ${
                      form.grade_level === g.value
                        ? "bg-blue-600/15 border-blue-500 text-blue-300"
                        : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        form.grade_level === g.value ? "bg-blue-500/20" : "bg-white/5"
                      }`}>
                        <GraduationCap className={`w-5 h-5 ${form.grade_level === g.value ? "text-blue-400" : "text-white/30"}`} />
                      </div>
                      <span className="text-sm">{g.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!form.grade_level}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
                التالي
                <ChevronLeft className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Subject */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h3 className="font-bold text-lg mb-1">ما المادة التي تحتاج مساعدة فيها؟</h3>
                <p className="text-white/40 text-sm">اختر ا��مادة الدراسية المطلوبة.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
                {availableSubjects.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, subject: s.label }))}
                    className={`p-3 rounded-xl border text-sm font-bold transition-all text-right ${
                      form.subject === s.label
                        ? "bg-blue-600/15 border-blue-500 text-blue-300"
                        : "bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all"
                >
                  السابق
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!form.subject}
                  className="flex-1 bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  التالي
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: City & Preferences */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h3 className="font-bold text-lg mb-1">تفاص��ل إضافية</h3>
                <p className="text-white/40 text-sm">ساعدنا في إيجاد الأنسب لك.</p>
              </div>

              <div className="space-y-4">
                {/* City */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">المدينة (اختياري)</label>
                  <div className="relative">
                    <MapPinned className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      placeholder="مثال: تبوك"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pr-11 pl-5 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                    />
                  </div>
                </div>

                {/* Teaching Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">طريقة التدريس المفضلة</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "online", label: "عن بعد" },
                      { value: "offline", label: "حضوري" },
                      { value: "both", label: "كلاهما" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, teaching_type: opt.value as any }))}
                        className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                          form.teaching_type === opt.value
                            ? "bg-blue-600/15 border-blue-500 text-blue-300"
                            : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">ملاحظات إضاف��ة (اختياري)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    placeholder="مثال: أبحث عن معلم متخصص في الجبر..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-blue-500 outline-none transition-all font-bold text-sm resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-bold">
                  {error}
                </div>
              )}

              {/* Summary */}
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">ملخ�� اختياراتك</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-full">
                    {GRADE_LEVELS.find((g) => g.value === form.grade_level)?.label}
                  </span>
                  <span className="text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1.5 rounded-full">
                    {form.subject}
                  </span>
                  {form.city && (
                    <span className="text-xs font-bold bg-white/5 text-white/50 border border-white/10 px-3 py-1.5 rounded-full">
                      {form.city}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all"
                >
                  السابق
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="flex-1 bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري البحث...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      ابحث عن معلمي المثالي
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
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

function MeetingsSection({ profileId }: { profileId: string }) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("meetings")
        .select("*")
        .eq("student_id", profileId)
        .order("scheduled_at", { ascending: false });

      if (data && data.length > 0) {
        const teacherIds = [...new Set(data.map((m: any) => m.teacher_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", teacherIds);
        const nameMap = new Map((profiles ?? []).map((p: any) => [p.id, p.full_name]));
        setMeetings(data.map((m: any) => ({ ...m, teacher_name: nameMap.get(m.teacher_id) ?? "معلم" })));
      }
      setLoadingMeetings(false);
    })();
  }, [profileId]);

  if (loadingMeetings) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
          <GraduationCap className="w-7 h-7 text-white/30" />
        </div>
        <h3 className="text-lg font-black mb-2">لا توجد حصص مجدولة</h3>
        <p className="text-white/40 text-sm">ستظهر هنا حصصك الدراسية فور جدولتها.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((m: any) => (
        <div
          key={m.id}
          className="bg-white/5 border border-white/10 rounded-[24px] p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              m.status === "completed" ? "bg-green-500/10 border border-green-500/20" :
              m.status === "cancelled" ? "bg-red-500/10 border border-red-500/20" :
              "bg-blue-500/10 border border-blue-500/20"
            }`}>
              <GraduationCap className={`w-5 h-5 ${
                m.status === "completed" ? "text-green-400" :
                m.status === "cancelled" ? "text-red-400" :
                "text-blue-400"
              }`} />
            </div>
            <div>
              <p className="font-bold text-sm">حصة مع {m.teacher_name}</p>
              <p className="text-xs text-white/40">
                {new Date(m.scheduled_at).toLocaleDateString("ar-EG", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
                {" · "}{m.duration_minutes} دقيقة
              </p>
            </div>
          </div>
          <span className={`text-[11px] font-black uppercase tracking-widest ${
            m.status === "completed" ? "text-green-400" :
            m.status === "cancelled" ? "text-red-400" :
            "text-blue-400"
          }`}>
            {m.status === "scheduled" ? "مجدولة" : m.status === "completed" ? "مكتملة" : "ملغاة"}
          </span>
        </div>
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
    grade_level: profile.grade_level ?? "",
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

      <div className="space-y-2">
        <label className="text-xs font-black text-white/40 uppercase tracking-widest">��لمرحلة الدراسية</label>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
            <BookOpen className="w-4 h-4" />
          </div>
          <select
            value={form.grade_level}
            onChange={(e) => setForm((f) => ({ ...f, grade_level: e.target.value }))}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pr-11 pl-5 focus:border-blue-500 outline-none transition-all font-bold text-sm appearance-none"
          >
            <option value="">اختر المرحلة</option>
            {GRADE_LEVELS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
      </div>

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
