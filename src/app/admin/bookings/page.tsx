"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Inbox,
  Loader2,
  Search,
  UserPlus,
  CheckCircle2,
  Ban,
  PlayCircle,
  StickyNote,
  Save,
  Sparkles,
  Phone,
  Mail,
  GraduationCap,
  BookOpen,
  MapPin,
  Clock,
  CalendarClock,
  AlertTriangle,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  updateBookingStatus,
  type BookingWorkflowStatus,
} from "@/actions/bookings";
import { getTeachersForAssignment } from "@/actions/student-management";
import { GRADE_LEVELS } from "@/lib/constants/grade-levels";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

type RequestRow = {
  id: string;
  student_id: string | null;
  teacher_id: string | null;
  student_name: string | null;
  subject: string | null;
  grade_level: string | null;
  current_level: string | null;
  preferred_days: string[] | null;
  preferred_times: string | null;
  notes: string | null;
  admin_notes: string | null;
  status: string | null;
  created_at: string;
  student_phone: string | null;
  student_email: string | null;
  student_city: string | null;
  teacher_name: string | null;
};

const SLA_HOURS = 24;

type TabKey = "new" | "in_progress" | "accepted" | "confirmed" | "cancelled";

const TABS: { key: TabKey; label: string; color: string }[] = [
  { key: "new", label: "جديد", color: "text-yellow-400" },
  { key: "in_progress", label: "قيد المراجعة", color: "text-blue-400" },
  { key: "accepted", label: "مقبول — بانتظار الدفع", color: "text-purple-400" },
  { key: "confirmed", label: "مؤكد", color: "text-green-400" },
  { key: "cancelled", label: "ملغى", color: "text-red-400" },
];

const DAY_LABELS: Record<string, string> = {
  sun: "الأحد",
  mon: "الإثنين",
  tue: "الثلاثاء",
  wed: "الأربعاء",
  thu: "الخميس",
  fri: "الجمعة",
  sat: "السبت",
};

const TIME_LABELS: Record<string, string> = {
  morning: "صباحاً",
  afternoon: "بعد الظهر",
  evening: "مساءً",
  night: "ليلاً",
};

const LEVEL_LABELS: Record<string, string> = {
  excellent: "ممتاز",
  good: "جيد جداً",
  average: "متوسط",
  weak: "يحتاج متابعة",
};

export default function AdminBookingsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState<{ id: string; full_name: string; subjects: string[] }[]>([]);
  const [assignFor, setAssignFor] = useState<RequestRow | null>(null);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    void fetchRows();
    void loadTeachers();
  }, []);

  const loadTeachers = async () => {
    const data = await getTeachersForAssignment();
    setTeachers(data);
  };

  const fetchRows = async () => {
    setLoading(true);
    const { data: bookings } = await supabase
      .from("bookings")
      .select(
        "id, student_id, teacher_id, student_name, subject, grade_level, current_level, preferred_days, preferred_times, notes, admin_notes, status, created_at"
      )
      .in("status", ["new", "in_progress", "accepted", "confirmed", "cancelled"])
      .order("created_at", { ascending: false });

    const list = (bookings as RequestRow[] | null) ?? [];
    const ids = new Set<string>();
    list.forEach((b) => {
      if (b.student_id) ids.add(b.student_id);
      if (b.teacher_id) ids.add(b.teacher_id);
    });

    let profileMap = new Map<string, { full_name: string | null; phone: string | null; email: string | null; city: string | null }>();
    if (ids.size > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone, email, city")
        .in("id", Array.from(ids));
      profileMap = new Map(
        (profiles ?? []).map((p) => [
          p.id as string,
          { full_name: p.full_name, phone: p.phone, email: p.email, city: p.city },
        ])
      );
    }

    setRows(
      list.map((b) => {
        const s = b.student_id ? profileMap.get(b.student_id) : null;
        const t = b.teacher_id ? profileMap.get(b.teacher_id) : null;
        return {
          ...b,
          student_name: b.student_name ?? s?.full_name ?? null,
          student_phone: s?.phone ?? null,
          student_email: s?.email ?? null,
          student_city: s?.city ?? null,
          teacher_name: t?.full_name ?? null,
        };
      })
    );
    setLoading(false);
  };

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { new: 0, in_progress: 0, accepted: 0, confirmed: 0, cancelled: 0 };
    for (const r of rows) {
      const s = (r.status ?? "") as TabKey;
      if (s in c) c[s]++;
    }
    return c;
  }, [rows]);

  const overdueCount = useMemo(() => {
    const now = Date.now();
    return rows.filter((r) => {
      if (r.status !== "new" && r.status !== "in_progress") return false;
      return (now - new Date(r.created_at).getTime()) / 3_600_000 > SLA_HOURS;
    }).length;
  }, [rows]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      if (r.status !== tab) return false;
      if (!term) return true;
      return (
        r.student_name?.toLowerCase().includes(term) ||
        r.subject?.toLowerCase().includes(term) ||
        r.student_phone?.includes(term) ||
        r.student_email?.toLowerCase().includes(term) ||
        r.teacher_name?.toLowerCase().includes(term)
      );
    });
  }, [rows, searchTerm, tab]);

  const notify = (m: { kind: "success" | "error"; text: string }) => {
    setMessage(m);
    setTimeout(() => setMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal antialiased pt-20 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-white/40 hover:text-blue-500 transition-colors flex items-center gap-2 text-sm mb-4">
            <ArrowRight className="w-4 h-4" /> العودة للوحة التحكم
          </Link>
          <h1 className="text-4xl font-black flex items-center gap-4">
            <Inbox className="text-blue-500 w-10 h-10" /> طلبات الطلاب
          </h1>
          <p className="text-white/40 text-sm mt-2">راجع الطلبات الجديدة، قم بتنسيق المعلمين، وتابع الدفع والتأكيد.</p>
        </div>

        {/* Overdue SLA banner */}
        {overdueCount > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-bold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              يوجد {overdueCount} طلب تجاوز {SLA_HOURS} ساعة بدون معالجة — يرجى المراجعة فوراً.
            </span>
          </div>
        )}

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 p-4 rounded-2xl text-sm font-bold text-center ${
                message.kind === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all border ${
                  active
                    ? "bg-blue-600/15 border-blue-500 text-blue-300"
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                {t.label}
                <span className={`ms-2 text-[10px] font-black ${active ? t.color : "text-white/40"}`}>
                  {counts[t.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="بحث بالاسم أو المادة أو الجوال..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-6 outline-none focus:border-blue-500/50"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[32px] border border-white/10">
            <Inbox className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-bold">لا توجد طلبات في هذه الحالة</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((row) => (
                <BookingCard
                  key={row.id}
                  row={row}
                  onChanged={fetchRows}
                  onOpenAssign={() => setAssignFor(row)}
                  notify={notify}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Assign Teacher Modal */}
      <AnimatePresence>
        {assignFor && (
          <AssignTeacherModal
            row={assignFor}
            teachers={teachers}
            onClose={() => setAssignFor(null)}
            onDone={() => {
              setAssignFor(null);
              void fetchRows();
              notify({ kind: "success", text: "تم ربط الطالب بالمعلم وتحديث الحالة إلى مقبول." });
            }}
            onError={(e) => notify({ kind: "error", text: e })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────── Booking card ─────────────────────── */

function BookingCard({
  row,
  onChanged,
  onOpenAssign,
  notify,
}: {
  row: RequestRow;
  onChanged: () => void;
  onOpenAssign: () => void;
  notify: (m: { kind: "success" | "error"; text: string }) => void;
}) {
  const [notes, setNotes] = useState(row.admin_notes ?? "");
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const gradeLabel = GRADE_LEVELS.find((g) => g.value === row.grade_level)?.label ?? row.grade_level ?? "—";
  const daysLabel = (row.preferred_days ?? []).map((d) => DAY_LABELS[d] ?? d).join("، ");
  const timeLabel = row.preferred_times ? TIME_LABELS[row.preferred_times] ?? row.preferred_times : "";
  const levelLabel = row.current_level ? LEVEL_LABELS[row.current_level] ?? row.current_level : "";

  // 24h SLA — only matters before the admin has accepted/confirmed the request.
  const ageHours = (Date.now() - new Date(row.created_at).getTime()) / 3_600_000;
  const isOverdue =
    ageHours > SLA_HOURS &&
    (row.status === "new" || row.status === "in_progress");

  const saveNotes = () => {
    startTransition(async () => {
      const res = await updateBookingStatus({
        bookingId: row.id,
        status: (row.status as BookingWorkflowStatus) ?? "new",
        adminNotes: notes,
      });
      if (res.success) {
        notify({ kind: "success", text: "تم حفظ الملاحظات." });
        onChanged();
      } else {
        notify({ kind: "error", text: res.error ?? "فشل الحفظ" });
      }
    });
  };

  const changeStatus = (status: BookingWorkflowStatus) => {
    startTransition(async () => {
      const res = await updateBookingStatus({
        bookingId: row.id,
        status,
        adminNotes: notes,
      });
      if (res.success) {
        notify({ kind: "success", text: "تم تحديث حالة الطلب." });
        onChanged();
      } else {
        notify({ kind: "error", text: res.error ?? "فشل التحديث" });
      }
    });
  };

  const approvalMessage =
    `السلام عليكم ${row.student_name ?? ""}،\n` +
    `تمت الموافقة على طلبك في مرتقى أكاديمي` +
    (row.teacher_name ? `، وتم توفير المعلم ${row.teacher_name}` : "") +
    `.\nالرجاء تأكيد الموعد وإتمام التحويل البنكي لتأكيد الحجز.\n` +
    `شكراً لثقتك بنا.`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white/5 border border-white/10 rounded-[24px] p-5 md:p-6 space-y-4"
    >
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Student summary */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-lg">{row.student_name ?? "طالب"}</h3>
            {row.teacher_name && (
              <span className="text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full">
                مع: {row.teacher_name}
              </span>
            )}
            {isOverdue && (
              <span className="text-[10px] font-black bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                متأخر — تجاوز {SLA_HOURS} ساعة
              </span>
            )}
            <span className="text-[10px] text-white/30 font-bold">
              {new Date(row.created_at).toLocaleDateString("ar-EG", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
            {row.subject && (
              <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> {row.subject}
              </span>
            )}
            {row.grade_level && (
              <span className="bg-green-500/10 text-green-300 border border-green-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> {gradeLabel}
              </span>
            )}
            {levelLabel && (
              <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {levelLabel}
              </span>
            )}
            {daysLabel && (
              <span className="bg-white/5 text-white/60 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CalendarClock className="w-3 h-3" /> {daysLabel}
              </span>
            )}
            {timeLabel && (
              <span className="bg-white/5 text-white/60 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeLabel}
              </span>
            )}
            {row.student_city && (
              <span className="bg-white/5 text-white/60 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {row.student_city}
              </span>
            )}
            {row.student_phone && (
              <span className="bg-white/5 text-white/60 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1" dir="ltr">
                <Phone className="w-3 h-3" /> {row.student_phone}
              </span>
            )}
            {row.student_email && (
              <span className="bg-white/5 text-white/60 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1 max-w-[220px]" dir="ltr" title={row.student_email}>
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{row.student_email}</span>
              </span>
            )}
          </div>

          {row.notes && (
            <p className="text-xs text-white/50 leading-relaxed border-r-2 border-white/10 pr-3 mt-2">
              {row.notes}
            </p>
          )}
        </div>

        {/* Right-side action buttons */}
        <div className="flex flex-wrap md:flex-col gap-2 md:shrink-0">
          {row.status === "new" && (
            <button
              type="button"
              onClick={() => changeStatus("in_progress")}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/15 text-blue-300 border border-blue-500/20 rounded-xl text-xs font-bold hover:bg-blue-600/25 transition-all disabled:opacity-40"
            >
              <PlayCircle className="w-4 h-4" /> فتح للمراجعة
            </button>
          )}
          {row.status !== "accepted" && row.status !== "confirmed" && row.status !== "cancelled" && (
            <button
              type="button"
              onClick={onOpenAssign}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600/15 text-purple-300 border border-purple-500/20 rounded-xl text-xs font-bold hover:bg-purple-600/25 transition-all disabled:opacity-40"
            >
              <UserPlus className="w-4 h-4" /> ربط بمعلم
            </button>
          )}
          {row.status === "accepted" && (
            <button
              type="button"
              onClick={() => changeStatus("confirmed")}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-500 transition-all disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" /> تأكيد الحجز
            </button>
          )}
          {row.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => changeStatus("cancelled")}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-600/20 transition-all disabled:opacity-40"
            >
              <Ban className="w-4 h-4" /> إلغاء
            </button>
          )}
          {row.student_phone && row.status === "accepted" && (
            <WhatsAppButton
              phone={row.student_phone}
              message={approvalMessage}
              label="إبلاغ الطالب (واتساب)"
              size="sm"
            />
          )}
          {row.student_phone && row.status !== "accepted" && (
            <WhatsAppButton
              phone={row.student_phone}
              message={`مرحباً ${row.student_name ?? ""}، نتواصل معك من منصة مرتقى أكاديمي بخصوص طلبك.`}
              label="واتساب"
              size="sm"
            />
          )}
        </div>
      </div>

      {/* Admin notes */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white"
      >
        <StickyNote className="w-4 h-4" />
        ملاحظات الإدارة {row.admin_notes ? "(محفوظ)" : ""}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="مثال: اتصلت بالطالب ولم يرد، سأحاول مرة أخرى غداً..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 resize-none"
              />
              <button
                type="button"
                onClick={saveNotes}
                disabled={isPending}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-500 hover:text-white transition-all disabled:opacity-40"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                حفظ الملاحظات
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────── Assign teacher modal ─────────────────────── */

function AssignTeacherModal({
  row,
  teachers,
  onClose,
  onDone,
  onError,
}: {
  row: RequestRow;
  teachers: { id: string; full_name: string; subjects: string[] }[];
  onClose: () => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return teachers;
    return teachers.filter((t) =>
      t.full_name.toLowerCase().includes(term) ||
      t.subjects.some((s) => s.toLowerCase().includes(term))
    );
  }, [teachers, search]);

  const handleAssign = () => {
    if (!selected) return;
    startTransition(async () => {
      const res = await updateBookingStatus({
        bookingId: row.id,
        status: "accepted",
        teacherId: selected,
      });
      if (res.success) onDone();
      else onError(res.error ?? "فشل الربط");
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-[#111114] border border-white/10 rounded-[28px] p-6 md:p-8 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-400" />
            ربط طلب الطالب بمعلم
          </h3>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-white/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
          <p className="text-sm text-blue-300">
            الطلب: <strong className="text-white">{row.student_name ?? "طالب"}</strong>
            {row.subject && <> — {row.subject}</>}
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن معلم بالاسم أو المادة..."
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pr-10 pl-4 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1">
            {filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelected(t.id)}
                className={`w-full text-right p-3 rounded-xl text-sm font-bold transition-all ${
                  selected === t.id
                    ? "bg-blue-600/15 border-2 border-blue-500 text-blue-300"
                    : "bg-white/[0.02] border border-white/5 text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{t.full_name}</span>
                  {t.subjects.length > 0 && (
                    <span className="text-[10px] text-white/30 font-normal truncate max-w-[50%]">
                      {t.subjects.slice(0, 2).join("، ")}
                    </span>
                  )}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-xs text-white/20 py-6">لا يوجد معلمون مطابقون</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={!selected || isPending}
            className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            اعتماد وتحديث الحالة إلى مقبول
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
