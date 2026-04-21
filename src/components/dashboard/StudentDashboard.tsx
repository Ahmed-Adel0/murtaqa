"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Star,
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
  GraduationCap,
  ChevronLeft,
  MessageCircle,
  Send,
  Clock,
  Copy,
  Building2,
  Hash,
  Globe,
  CreditCard,
} from "lucide-react";
import { updateOwnProfile } from "@/actions/profile";
import { createStudentBookingRequest } from "@/actions/bookings";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import { GRADE_LEVELS } from "@/lib/constants/grade-levels";
import type { GradeLevel } from "@/lib/constants/grade-levels";
import { getSubjectsForGrade, SUBJECTS } from "@/lib/constants/subjects";
import { BANK_ACCOUNTS } from "@/lib/constants/bank-accounts";
import { SAUDI_REGIONS } from "@/lib/constants/locations";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { DashboardLayout } from "./shared/DashboardLayout";
import type { SidebarItem } from "./shared/Sidebar";

// Admin WhatsApp number
const ADMIN_PHONE = "966505855924";

type Section = "home" | "lessons" | "notifications" | "settings";

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

/**
 * Student state flows:
 * 1. "new"         → hasn't filled intake form yet
 * 2. "waiting"     → form sent, waiting for admin to assign teacher
 * 3. "trial"       → admin assigned a trial lesson with a teacher
 * 4. "evaluate"    → trial done, student needs to evaluate teacher
 * 5. "payment"     → evaluation positive, show bank accounts
 * 6. "active"      → subscribed, show lessons remaining
 */
type StudentStage = "new" | "waiting" | "trial" | "evaluate" | "payment" | "active";

/**
 * DB status mapping — bookings_status_check allows
 *   new / pending / in_progress / accepted / confirmed / completed / cancelled
 *
 * Student-facing stages:
 *   new / in_progress                → waiting (admin hasn't matched a teacher yet)
 *   accepted                         → payment (teacher matched, student pays)
 *   pending                          → trial (admin assigned a trial lesson)
 *   confirmed + !reviewed            → evaluate
 *   confirmed + reviewed             → payment
 *   completed                        → active subscription
 *   cancelled                        → fall through to waiting
 */
function determineStage(profile: Profile, bookings: BookingRow[], hasReviewedTrial: boolean): StudentStage {
  if (!profile.grade_level && !profile.city) return "new";
  if (bookings.length === 0) return "waiting";

  const latestBooking = bookings[0];

  if (latestBooking.status === "new" || latestBooking.status === "in_progress") return "waiting";
  if (latestBooking.status === "accepted") return "payment";
  if (latestBooking.status === "pending") return "trial";
  if (latestBooking.status === "confirmed" && !hasReviewedTrial) return "evaluate";
  if (latestBooking.status === "confirmed" && hasReviewedTrial) return "payment";
  if (latestBooking.status === "completed") return "active";

  return "waiting";
}

export default function StudentDashboard({
  profile,
}: {
  profile: Profile;
  match?: any; // kept for backward compat but unused now
}) {
  const [section, setSection] = useState<Section>("home");
  const [notifs, setNotifs] = useState<NotificationRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [hasReviewedTrial, setHasReviewedTrial] = useState(false);
  const [intakeSubmitted, setIntakeSubmitted] = useState(false);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

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

      // Check if student has reviewed their latest trial
      if (b && b.length > 0) {
        const { data: reviews } = await supabase
          .from("reviews")
          .select("id")
          .eq("teacher_id", b[0].teacher_id)
          .limit(1);
        if (reviews && reviews.length > 0) setHasReviewedTrial(true);
      }

      // Realtime: listen for new notifications
      channel = supabase
        .channel(`student-notifs-${profile.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${profile.id}`,
          },
          (payload) => {
            setNotifs((prev) => [payload.new as NotificationRow, ...prev]);
          }
        )
        .subscribe();
    })();

    return () => { channel?.unsubscribe(); };
  }, [profile.id]);

  const unread = notifs.filter((n) => !n.is_read).length;

  const stage = intakeSubmitted
    ? "waiting"
    : determineStage(profile, bookings, hasReviewedTrial);

  const items: SidebarItem[] = useMemo(
    () => [
      {
        id: "home",
        label: "الرئيسية",
        icon: <Sparkles className="w-5 h-5" />,
        onSelect: () => setSection("home"),
      },
      {
        id: "lessons",
        label: "حصصي",
        icon: <CalendarCheck className="w-5 h-5" />,
        onSelect: () => setSection("lessons"),
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
    home: {
      title: `أهلاً، ${profile.full_name?.split(" ")[0] ?? "طالبنا"}`,
      subtitle: "مرحباً بك في مرتقى أكاديمي",
    },
    lessons: { title: "حصصي", subtitle: "سجل حصصك الدراسية." },
    notifications: { title: "الإشعارات", subtitle: "آخر تحديثات حسابك." },
    settings: { title: "الإعدادات", subtitle: "بياناتك الشخصية." },
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
      {section === "home" && (
        <HomeSection
          stage={stage}
          profile={profile}
          bookings={bookings}
          onIntakeSubmit={() => setIntakeSubmitted(true)}
          onEvaluationDone={() => setHasReviewedTrial(true)}
        />
      )}
      {section === "lessons" && <LessonsSection bookings={bookings} profileId={profile.id} />}
      {section === "notifications" && <NotificationsSection notifs={notifs} onChange={setNotifs} />}
      {section === "settings" && <SettingsSection profile={profile} />}
    </DashboardLayout>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  HOME SECTION — shows different content based on student stage          */
/* ════════════════════════════════════════════════════════════════════════ */

function HomeSection({
  stage,
  profile,
  bookings,
  onIntakeSubmit,
  onEvaluationDone,
}: {
  stage: StudentStage;
  profile: Profile;
  bookings: BookingRow[];
  onIntakeSubmit: () => void;
  onEvaluationDone: () => void;
}) {
  switch (stage) {
    case "new":
      return <IntakeForm onComplete={onIntakeSubmit} profile={profile} />;
    case "waiting":
      return <WaitingState />;
    case "trial":
      return <TrialState booking={bookings[0]} />;
    case "evaluate":
      return <EvaluationForm booking={bookings[0]} onDone={onEvaluationDone} />;
    case "payment":
      return <PaymentState />;
    case "active":
      return <ActiveSubscription booking={bookings[0]} />;
    default:
      return <WaitingState />;
  }
}

/* ─── Stage 1: Intake Form → sends to WhatsApp ─── */

const DAYS_OF_WEEK: { value: string; label: string }[] = [
  { value: "sun", label: "الأحد" },
  { value: "mon", label: "الإثنين" },
  { value: "tue", label: "الثلاثاء" },
  { value: "wed", label: "الأربعاء" },
  { value: "thu", label: "الخميس" },
  { value: "fri", label: "الجمعة" },
  { value: "sat", label: "السبت" },
];

const CURRENT_LEVELS: { value: string; label: string }[] = [
  { value: "excellent", label: "ممتاز" },
  { value: "good", label: "جيد جداً" },
  { value: "average", label: "متوسط" },
  { value: "weak", label: "يحتاج متابعة" },
];

const TIME_SLOTS: { value: string; label: string }[] = [
  { value: "morning", label: "صباحاً" },
  { value: "afternoon", label: "بعد الظهر" },
  { value: "evening", label: "مساءً" },
  { value: "night", label: "ليلاً" },
];

function IntakeForm({ onComplete, profile }: { onComplete: () => void; profile?: Profile }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    grade_level: "",
    subject: "",
    city: "",
    teaching_type: "both" as "online" | "offline" | "both",
    phone: profile?.phone ?? "",
    current_level: "",
    preferred_days: [] as string[],
    preferred_times: "",
    notes: "",
  });

  const availableSubjects = form.grade_level
    ? getSubjectsForGrade(form.grade_level as GradeLevel)
    : SUBJECTS;

  const gradeLabel = GRADE_LEVELS.find((g) => g.value === form.grade_level)?.label ?? "";
  const currentLevelLabel = CURRENT_LEVELS.find((c) => c.value === form.current_level)?.label ?? "";
  const preferredDaysLabel = form.preferred_days
    .map((v) => DAYS_OF_WEEK.find((d) => d.value === v)?.label)
    .filter(Boolean)
    .join("، ");
  const preferredTimesLabel = TIME_SLOTS.find((t) => t.value === form.preferred_times)?.label ?? "";

  const togglePreferredDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      preferred_days: prev.preferred_days.includes(day)
        ? prev.preferred_days.filter((d) => d !== day)
        : [...prev.preferred_days, day],
    }));
  };

  const handleSubmit = async () => {
    if (!form.phone.trim()) {
      setError("رقم الواتساب مطلوب للتواصل معك.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      // 1. Save student profile preferences (city / phone)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({
          city: form.city || undefined,
          phone: form.phone,
          updated_at: new Date().toISOString(),
        }).eq("id", user.id);

        try {
          await supabase.from("profiles").update({
            grade_level: form.grade_level,
          }).eq("id", user.id);
        } catch { /* column may not exist */ }
      }

      // 2. Persist the request as a booking with status='new' so it lands
      //    in the admin bookings queue.
      const res = await createStudentBookingRequest({
        subject: form.subject,
        grade_level: form.grade_level,
        current_level: form.current_level || undefined,
        preferred_days: form.preferred_days,
        preferred_times: form.preferred_times || undefined,
        notes: form.notes || undefined,
      });
      if (!res.success) throw new Error(res.error ?? "فشل إرسال الطلب");

      // 3. Pre-fill a WhatsApp message (manual send — user presses the button).
      const teachingLabel = form.teaching_type === "online" ? "عن بعد" : form.teaching_type === "offline" ? "حضوري" : "كلاهما";
      const message =
        `السلام عليكم مرتقى أكاديمي، أود الاستفسار والتسجيل:\n\n` +
        `👤 اسم الطالب: ${profile?.full_name || "—"}\n` +
        `📱 واتساب: ${form.phone}\n` +
        `🎓 المرحلة الدراسية: ${gradeLabel}\n` +
        `📚 المادة المطلوبة: ${form.subject}\n` +
        (currentLevelLabel ? `📊 المستوى الحالي: ${currentLevelLabel}\n` : "") +
        (preferredDaysLabel ? `🗓️ الأيام المفضلة: ${preferredDaysLabel}\n` : "") +
        (preferredTimesLabel ? `⏰ الأوقات المفضلة: ${preferredTimesLabel}\n` : "") +
        `🏫 طريقة التدريس: ${teachingLabel}\n` +
        (form.city ? `📍 المدينة: ${form.city}\n` : "") +
        `📝 تفاصيل إضافية: ${form.notes || "لا يوجد"}`;
      window.open(buildWhatsAppLink(ADMIN_PHONE, message), "_blank");

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر إرسال الطلب");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-black">لنجد لك المعلم المثالي</h2>
            <p className="text-white/40 text-sm">أجب على بعض الأسئلة وسنتواصل معك عبر الواتساب.</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                s < step ? "bg-green-500 text-white" : s === step ? "bg-blue-600 text-white" : "bg-white/5 text-white/30 border border-white/10"
              }`}>
                {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 rounded-full ${s < step ? "bg-green-500" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <h3 className="font-bold text-lg mb-1">في أي مرحلة دراسية أنت؟</h3>
                <p className="text-white/40 text-sm">اختر مرحلتك لنعرض لك المواد المناسبة.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GRADE_LEVELS.map((g) => (
                  <button key={g.value} type="button"
                    onClick={() => setForm((f) => ({ ...f, grade_level: g.value, subject: "" }))}
                    className={`p-4 rounded-2xl border-2 text-right font-bold transition-all ${
                      form.grade_level === g.value
                        ? "bg-blue-600/15 border-blue-500 text-blue-300"
                        : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.grade_level === g.value ? "bg-blue-500/20" : "bg-white/5"}`}>
                        <GraduationCap className={`w-5 h-5 ${form.grade_level === g.value ? "text-blue-400" : "text-white/30"}`} />
                      </div>
                      <span className="text-sm">{g.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setStep(2)} disabled={!form.grade_level}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                التالي <ChevronLeft className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <h3 className="font-bold text-lg mb-1">ما المادة التي تحتاج مساعدة فيها؟</h3>
                <p className="text-white/40 text-sm">اختر المادة الدراسية المطلوبة.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
                {availableSubjects.map((s) => (
                  <button key={s.value} type="button" onClick={() => setForm((f) => ({ ...f, subject: s.label }))}
                    className={`p-3 rounded-xl border text-sm font-bold transition-all text-right ${
                      form.subject === s.label
                        ? "bg-blue-600/15 border-blue-500 text-blue-300"
                        : "bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20 hover:text-white"
                    }`}
                  >{s.label}</button>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">السابق</button>
                <button type="button" onClick={() => setStep(3)} disabled={!form.subject}
                  className="flex-1 bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                  التالي <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <h3 className="font-bold text-lg mb-1">تفاصيل إضافية</h3>
                <p className="text-white/40 text-sm">ساعدنا في إيجاد الأنسب لك.</p>
              </div>
              <div className="space-y-4">
                {/* WhatsApp phone — required */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">
                    رقم الواتساب <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pr-11 pl-5 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                    />
                  </div>
                </div>

                {/* Current level */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">المستوى الحالي للطالب</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CURRENT_LEVELS.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, current_level: l.value }))}
                        className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          form.current_level === l.value
                            ? "bg-blue-600/15 border-blue-500 text-blue-300"
                            : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white/80"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred days */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">
                    الأيام المفضلة
                    {form.preferred_days.length > 0 && (
                      <span className="text-blue-400 mr-2">({form.preferred_days.length})</span>
                    )}
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {DAYS_OF_WEEK.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => togglePreferredDay(d.value)}
                        className={`py-2 rounded-xl border text-[11px] font-bold transition-all ${
                          form.preferred_days.includes(d.value)
                            ? "bg-blue-600/15 border-blue-500 text-blue-300"
                            : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white/80"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred times */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">الأوقات المفضلة</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, preferred_times: t.value }))}
                        className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          form.preferred_times === t.value
                            ? "bg-blue-600/15 border-blue-500 text-blue-300"
                            : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white/80"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">المدينة (اختياري)</label>
                  <div className="relative">
                    <MapPinned className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <select value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pr-11 pl-5 focus:border-blue-500 outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                      dir="rtl">
                      <option value="">اختر مدينتك</option>
                      {SAUDI_REGIONS.map((region) => (
                        <optgroup key={region.region} label={region.region}>
                          {region.cities.map((c) => (
                            <option key={c.value} value={c.label}>{c.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">طريقة التدريس المفضلة</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([["online", "عن بعد"], ["offline", "حضوري"], ["both", "كلاهما"]] as const).map(([val, lbl]) => (
                      <button key={val} type="button" onClick={() => setForm((f) => ({ ...f, teaching_type: val }))}
                        className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                          form.teaching_type === val ? "bg-blue-600/15 border-blue-500 text-blue-300" : "bg-white/[0.02] border-white/10 text-white/50"
                        }`}>{lbl}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">ملاحظات إضافية (اختياري)</label>
                  <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2}
                    placeholder="مثال: أبحث عن معلم متخصص في الجبر..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-blue-500 outline-none transition-all font-bold text-sm resize-none" />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-2">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">ملخص اختياراتك</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-full">{gradeLabel}</span>
                  <span className="text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1.5 rounded-full">{form.subject}</span>
                  {currentLevelLabel && <span className="text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-full">{currentLevelLabel}</span>}
                  {preferredDaysLabel && <span className="text-xs font-bold bg-white/5 text-white/60 border border-white/10 px-3 py-1.5 rounded-full">{preferredDaysLabel}</span>}
                  {preferredTimesLabel && <span className="text-xs font-bold bg-white/5 text-white/60 border border-white/10 px-3 py-1.5 rounded-full">{preferredTimesLabel}</span>}
                  {form.city && <span className="text-xs font-bold bg-white/5 text-white/50 border border-white/10 px-3 py-1.5 rounded-full">{form.city}</span>}
                </div>
              </div>

              {error && (
                <p className="text-sm font-bold text-red-400 text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} disabled={submitting} className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all disabled:opacity-40">السابق</button>
                <button type="button" onClick={handleSubmit} disabled={submitting}
                  className="flex-1 bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                  إرسال الطلب وفتح الواتساب
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Stage 2: Waiting for admin ─── */

function WaitingState() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[28px] p-10 md:p-12 text-center">
      <div className="w-16 h-16 rounded-3xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
        <Clock className="w-8 h-8 text-blue-400 animate-pulse" />
      </div>
      <h3 className="text-xl font-black mb-3">تم استلام طلبك!</h3>
      <p className="text-white/40 text-sm max-w-md mx-auto mb-6 leading-relaxed">
        فريق مرتقى يعمل على إيجاد المعلم المثالي لك. سيتم التواصل معك عبر الواتساب قريباً لترتيب حصة تجريبية.
      </p>
      <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-3 text-green-400 text-sm font-bold">
        <CheckCircle2 className="w-4 h-4" />
        الطلب قيد المعالجة
      </div>
    </div>
  );
}

/* ─── Stage 3: Trial lesson assigned ─── */

function TrialState({ booking }: { booking: BookingRow }) {
  const [teacherName, setTeacherName] = useState<string>("المعلم");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("id", booking.teacher_id).single();
      if (data?.full_name) setTeacherName(data.full_name);
    })();
  }, [booking.teacher_id]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-[28px] p-8 md:p-10">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-5">
        <Sparkles className="w-3.5 h-3.5" />
        حصة تجريبية
      </div>
      <div className="flex items-center gap-5 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-white/10 flex items-center justify-center">
          <UserCircle className="w-10 h-10 text-blue-400/60" />
        </div>
        <div>
          <h2 className="text-xl font-black">{teacherName}</h2>
          <p className="text-white/40 text-sm">تم ترتيب حصة تجريبية لك مع هذا المعلم</p>
        </div>
      </div>
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 text-center">
        <p className="text-blue-300 text-sm font-bold leading-relaxed">
          بعد انتهاء الحصة التجريبية، سيطلب منك تقييم المعلم لتحديد ما إذا كنت تريد الاستمرار معه.
        </p>
      </div>
    </div>
  );
}

/* ─── Stage 4: Evaluation form ─── */

function EvaluationForm({ booking, onDone }: { booking: BookingRow; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [teacherName, setTeacherName] = useState("المعلم");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("id", booking.teacher_id).single();
      if (data?.full_name) setTeacherName(data.full_name);
    })();
  }, [booking.teacher_id]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("reviews").insert({
        teacher_id: booking.teacher_id,
        student_name: user?.user_metadata?.full_name || "طالب",
        rating,
        comment,
      });
      onDone();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-[28px] p-8 md:p-10 space-y-6">
      <div>
        <h2 className="text-xl font-black mb-2">قيّم حصتك التجريبية</h2>
        <p className="text-white/40 text-sm">كيف كانت تجربتك مع {teacherName}؟</p>
      </div>

      {/* Star Rating */}
      <div className="flex items-center justify-center gap-2 py-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} type="button" onClick={() => setRating(s)} className="transition-transform hover:scale-125 active:scale-95">
            <Star className={`w-10 h-10 ${s <= rating ? "text-yellow-500 fill-yellow-500" : "text-white/10"} transition-colors`} />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-center text-sm font-bold text-yellow-400">
          {rating === 5 ? "ممتاز!" : rating === 4 ? "جيد جداً" : rating === 3 ? "جيد" : rating === 2 ? "مقبول" : "ضعيف"}
        </p>
      )}

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="اكتب تعليقك على الحصة التجريبية (اختياري)..."
        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-blue-500 outline-none transition-all text-sm resize-none"
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        إرسال التقييم
      </button>
    </div>
  );
}

/* ─── Stage 5: Payment — show bank accounts ─── */

function PaymentState() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-500/5 border border-green-500/20 rounded-[28px] p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h2 className="text-xl font-black mb-2 text-green-400">شكراً لتقييمك!</h2>
        <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
          للاستمرار مع المعلم والاشتراك بـ 12 حصة شهرياً، قم بتحويل الرسوم إلى أحد الحسابات التالية ثم أبلغنا عبر الواتساب.
        </p>
      </div>

      {/* Bank Accounts */}
      {BANK_ACCOUNTS.map((account) => (
        <div key={account.id} className="bg-white/5 border border-white/10 rounded-[28px] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-bold">{account.bankName}</h3>
              <p className="text-xs text-white/40">{account.accountHolder}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CopyField icon={<Hash className="w-4 h-4" />} label="رقم الحساب" value={account.accountNumber}
              copied={copiedField === `${account.id}-num`} onCopy={() => copyToClipboard(account.accountNumber, `${account.id}-num`)} />
            <CopyField icon={<CreditCard className="w-4 h-4" />} label="الآيبان" value={account.iban}
              copied={copiedField === `${account.id}-iban`} onCopy={() => copyToClipboard(account.iban, `${account.id}-iban`)} />
            <CopyField icon={<Globe className="w-4 h-4" />} label="السويفت" value={account.swift}
              copied={copiedField === `${account.id}-swift`} onCopy={() => copyToClipboard(account.swift, `${account.id}-swift`)} />
          </div>
        </div>
      ))}

      {/* Confirm via WhatsApp */}
      <a
        href={buildWhatsAppLink(ADMIN_PHONE, "مرحباً، لقد قمت بتحويل رسوم الاشتراك. أرجو تأكيد استلام المبلغ.")}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-500 transition-all flex items-center justify-center gap-3"
      >
        <MessageCircle className="w-5 h-5" />
        أبلغ الإدارة بالتحويل عبر الواتساب
      </a>
    </div>
  );
}

function CopyField({ icon, label, value, copied, onCopy }: {
  icon: React.ReactNode; label: string; value: string; copied: boolean; onCopy: () => void;
}) {
  return (
    <div className="bg-black/30 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="text-white/30 shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[9px] text-white/30 font-bold">{label}</p>
          <p className="text-xs font-bold text-white/70 truncate" dir="ltr">{value}</p>
        </div>
      </div>
      <button type="button" onClick={onCopy} className="shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
      </button>
    </div>
  );
}

/* ─── Stage 6: Active subscription ─── */

function ActiveSubscription({ booking }: { booking: BookingRow }) {
  const [teacherName, setTeacherName] = useState("المعلم");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("id", booking.teacher_id).single();
      if (data?.full_name) setTeacherName(data.full_name);
    })();
  }, [booking.teacher_id]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-[28px] p-8 md:p-10 space-y-6">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-400 mb-2">
        <CheckCircle2 className="w-3.5 h-3.5" />
        اشتراك نشط
      </div>
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <UserCircle className="w-8 h-8 text-green-400/60" />
        </div>
        <div>
          <h2 className="text-xl font-black">{teacherName}</h2>
          <p className="text-white/40 text-sm">معلمك الحالي</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 text-center">
          <CalendarCheck className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-black">12</p>
          <p className="text-[10px] text-white/40 font-bold">حصة / شهر</p>
        </div>
        <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 text-center">
          <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-green-400">مفعّل</p>
          <p className="text-[10px] text-white/40 font-bold">الاشتراك</p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  LESSONS SECTION                                                        */
/* ════════════════════════════════════════════════════════════════════════ */

function LessonsSection({ bookings, profileId }: { bookings: BookingRow[]; profileId: string }) {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("student_id", profileId)
        .order("scheduled_at", { ascending: false });

      if (error) { setLoadingMeetings(false); return; }

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
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (meetings.length === 0 && bookings.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-12 text-center">
        <CalendarCheck className="w-12 h-12 text-white/10 mx-auto mb-4" />
        <h3 className="text-lg font-black mb-2">لا توجد حصص بعد</h3>
        <p className="text-white/40 text-sm">ستظهر هنا حصصك الدراسية فور جدولتها.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((m: any) => (
        <div key={m.id} className="bg-white/5 border border-white/10 rounded-[24px] p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              m.status === "completed" ? "bg-green-500/10 border border-green-500/20" :
              m.status === "cancelled" ? "bg-red-500/10 border border-red-500/20" :
              "bg-blue-500/10 border border-blue-500/20"
            }`}>
              <CalendarCheck className={`w-5 h-5 ${m.status === "completed" ? "text-green-400" : m.status === "cancelled" ? "text-red-400" : "text-blue-400"}`} />
            </div>
            <div>
              <p className="font-bold text-sm">حصة مع {m.teacher_name}</p>
              <p className="text-xs text-white/40">
                {new Date(m.scheduled_at).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                {" · "}{m.duration_minutes} دقيقة
              </p>
            </div>
          </div>
          <span className={`text-[11px] font-black uppercase tracking-widest ${
            m.status === "completed" ? "text-green-400" : m.status === "cancelled" ? "text-red-400" : "text-blue-400"
          }`}>
            {m.status === "scheduled" ? "مجدولة" : m.status === "completed" ? "مكتملة" : "ملغاة"}
          </span>
        </div>
      ))}
      {bookings.map((b) => (
        <div key={b.id} className="bg-white/5 border border-white/10 rounded-[24px] p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-white/30" />
            </div>
            <div>
              <p className="font-bold text-sm">حجز</p>
              <p className="text-xs text-white/40">{new Date(b.created_at).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>
          <span className="text-[11px] font-black text-white/30">{b.status ?? "قيد المراجعة"}</span>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  NOTIFICATIONS SECTION                                                  */
/* ════════════════════════════════════════════════════════════════════════ */

function NotificationsSection({ notifs, onChange }: { notifs: NotificationRow[]; onChange: (v: NotificationRow[]) => void }) {
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
        <Inbox className="w-12 h-12 text-white/10 mx-auto mb-4" />
        <h3 className="text-lg font-black mb-2">لا توجد إشعارات</h3>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unread > 0 && (
        <div className="flex justify-end">
          <button type="button" onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 font-bold">تحديد الكل كمقروء</button>
        </div>
      )}
      {notifs.map((n) => (
        <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-[24px] border transition-all ${n.is_read ? "bg-white/[0.02] border-white/5 text-white/50" : "bg-blue-500/5 border-blue-500/20 text-white"}`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${n.is_read ? "bg-white/5" : "bg-blue-600/20 text-blue-400"}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm mb-1">{n.title}</h4>
              <p className="text-xs leading-relaxed">{n.message}</p>
              <p className="text-[10px] mt-2 opacity-50">{new Date(n.created_at).toLocaleDateString("ar-EG")}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/*  SETTINGS SECTION                                                       */
/* ════════════════════════════════════════════════════════════════════════ */

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
      <SettingsField icon={<User className="w-4 h-4" />} label="الاسم الكامل" value={form.full_name} onChange={(v) => setForm((f) => ({ ...f, full_name: v }))} />
      <SettingsField icon={<Phone className="w-4 h-4" />} label="رقم الجوال" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} type="tel" />
      {/* City — dropdown with regions */}
      <div className="space-y-2">
        <label className="text-xs font-black text-white/40 uppercase tracking-widest">المدينة</label>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
            <MapPinned className="w-4 h-4" />
          </div>
          <select value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pr-11 pl-5 focus:border-blue-500 outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
            dir="rtl">
            <option value="">اختر مدينتك</option>
            {SAUDI_REGIONS.map((region) => (
              <optgroup key={region.region} label={region.region}>
                {region.cities.map((c) => (
                  <option key={c.value} value={c.label}>{c.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-bold text-center ${
          message.kind === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>{message.text}</div>
      )}

      <button type="submit" disabled={saving}
        className="w-full bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        حفظ التغييرات
      </button>
    </form>
  );
}

function SettingsField({ icon, label, value, onChange, type = "text" }: {
  icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-white/40 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">{icon}</div>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pr-11 pl-5 focus:border-blue-500 outline-none transition-all font-bold text-sm" />
      </div>
    </div>
  );
}
