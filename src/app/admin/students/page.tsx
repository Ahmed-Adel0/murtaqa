"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  MapPin,
  Mail,
  Phone,
  Filter,
  ArrowRight,
  Loader2,
  CalendarCheck,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserPlus,
  CheckCircle2,
  Star,
  Banknote,
  ClipboardList,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { GRADE_LEVELS } from "@/lib/constants/grade-levels";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import {
  assignTrialLesson,
  requestEvaluation,
  activateSubscription,
  getTeachersForAssignment,
} from "@/actions/student-management";

const PAGE_SIZE = 12;

type StudentRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  grade_level: string | null;
  avatar_url: string | null;
  is_suspended: boolean | null;
  booking_count: number;
  latest_booking_id: string | null;
  latest_booking_status: string | null;
  teacher_name: string | null;
  teacher_id: string | null;
};

type FilterType = "all" | "new" | "trial" | "evaluate" | "active";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  // Modal state for assigning teacher
  const [assignModal, setAssignModal] = useState<{ studentId: string; studentName: string } | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");

  useEffect(() => {
    fetchStudents();
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    const data = await getTeachersForAssignment();
    setTeachers(data);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Get all student profiles
      let profiles: any[] | null = null;
      {
        const res = await supabase
          .from("profiles")
          .select("id, full_name, email, phone, city, grade_level, avatar_url, is_suspended, updated_at")
          .eq("role", "student")
          .order("updated_at", { ascending: false });
        if (res.error?.code === "42703") {
          const fallback = await supabase
            .from("profiles")
            .select("id, full_name, email, phone, city, avatar_url, is_suspended, updated_at")
            .eq("role", "student")
            .order("updated_at", { ascending: false });
          profiles = fallback.data;
        } else {
          profiles = res.data;
        }
      }

      const studentIds = (profiles ?? []).map((p) => p.id);

      // Fetch latest booking per student
      const { data: bookings } = studentIds.length > 0
        ? await supabase
            .from("bookings")
            .select("id, student_id, teacher_id, status, created_at")
            .in("student_id", studentIds)
            .order("created_at", { ascending: false })
        : { data: [] };

      // Get latest booking per student + teacher names
      const latestBookingMap = new Map<string, any>();
      const teacherIds = new Set<string>();
      for (const b of bookings ?? []) {
        if (!latestBookingMap.has(b.student_id)) {
          latestBookingMap.set(b.student_id, b);
          if (b.teacher_id) teacherIds.add(b.teacher_id);
        }
      }

      const { data: teacherProfiles } = teacherIds.size > 0
        ? await supabase.from("profiles").select("id, full_name").in("id", Array.from(teacherIds))
        : { data: [] };

      const teacherNameMap = new Map((teacherProfiles ?? []).map((p: any) => [p.id, p.full_name]));

      // Count total bookings per student
      const bookingCountMap = new Map<string, number>();
      for (const b of bookings ?? []) {
        bookingCountMap.set(b.student_id, (bookingCountMap.get(b.student_id) ?? 0) + 1);
      }

      const enriched: StudentRow[] = (profiles ?? []).map((p) => {
        const latest = latestBookingMap.get(p.id);
        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          city: p.city,
          grade_level: p.grade_level ?? null,
          avatar_url: p.avatar_url,
          is_suspended: p.is_suspended,
          booking_count: bookingCountMap.get(p.id) ?? 0,
          latest_booking_id: latest?.id ?? null,
          latest_booking_status: latest?.status ?? null,
          teacher_name: latest?.teacher_id ? teacherNameMap.get(latest.teacher_id) ?? null : null,
          teacher_id: latest?.teacher_id ?? null,
        };
      });

      setStudents(enriched);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        s.full_name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.phone?.includes(term) ||
        s.city?.toLowerCase().includes(term);
      if (!matchesSearch) return false;

      // DB statuses: pending=trial, confirmed=evaluate, completed=active
      if (filter === "new") return !s.latest_booking_status;
      if (filter === "trial") return s.latest_booking_status === "pending";
      if (filter === "evaluate") return s.latest_booking_status === "confirmed";
      if (filter === "active") return s.latest_booking_status === "completed";
      return true;
    });
  }, [students, searchTerm, filter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: students.length,
    new: students.filter((s) => !s.latest_booking_status).length,
    trial: students.filter((s) => s.latest_booking_status === "pending" || s.latest_booking_status === "confirmed").length,
    active: students.filter((s) => s.latest_booking_status === "completed").length,
  }), [students]);

  const handleAssignTrial = () => {
    if (!assignModal || !selectedTeacher) return;
    startTransition(async () => {
      const res = await assignTrialLesson(assignModal.studentId, selectedTeacher);
      if (res.success) {
        setMessage({ kind: "success", text: "تم ربط الطالب بالمعلم للحصة التجريبية" });
        setAssignModal(null);
        setSelectedTeacher("");
        fetchStudents();
      } else {
        setMessage({ kind: "error", text: res.error ?? "فشلت العملية" });
      }
      setTimeout(() => setMessage(null), 4000);
    });
  };

  const handleRequestEval = (bookingId: string) => {
    startTransition(async () => {
      const res = await requestEvaluation(bookingId);
      if (res.success) {
        setMessage({ kind: "success", text: "تم طلب التقييم من الطالب" });
        fetchStudents();
      } else {
        setMessage({ kind: "error", text: res.error ?? "فشلت العملية" });
      }
      setTimeout(() => setMessage(null), 4000);
    });
  };

  const handleActivate = (bookingId: string) => {
    startTransition(async () => {
      const res = await activateSubscription(bookingId);
      if (res.success) {
        setMessage({ kind: "success", text: "تم تفعيل اشتراك الطالب" });
        fetchStudents();
      } else {
        setMessage({ kind: "error", text: res.error ?? "فشلت العملية" });
      }
      setTimeout(() => setMessage(null), 4000);
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "pending":
        return <span className="flex items-center gap-1.5 text-blue-400 text-xs font-bold"><CalendarCheck className="w-3 h-3" />حصة تجريبية</span>;
      case "confirmed":
        return <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold"><Star className="w-3 h-3" />بانتظار التقييم</span>;
      case "completed":
        return <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold"><CheckCircle2 className="w-3 h-3" />مشترك نشط</span>;
      default:
        return <span className="text-xs text-white/20">جديد</span>;
    }
  };

  const filteredTeachers = teacherSearch
    ? teachers.filter((t) => t.full_name?.toLowerCase().includes(teacherSearch.toLowerCase()))
    : teachers;

  const getGradeLabel = (val: string | null) => {
    if (!val) return null;
    return GRADE_LEVELS.find((g) => g.value === val)?.label ?? val;
  };

  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal antialiased pt-20 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <Link href="/admin" className="text-white/40 hover:text-blue-500 transition-colors flex items-center gap-2 text-sm mb-4">
              <ArrowRight className="w-4 h-4" /> العودة للوحة التحكم
            </Link>
            <h1 className="text-4xl font-black flex items-center gap-4">
              <Users className="text-blue-500 w-10 h-10" /> إدارة الطلاب
            </h1>
          </div>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mb-6 p-4 rounded-2xl text-sm font-bold text-center ${
                message.kind === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>{message.text}</motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "إجمالي الطلاب", count: stats.total, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "جدد (بدون معلم)", count: stats.new, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "في تجربة/تقييم", count: stats.trial, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: "مشتركين نشطين", count: stats.active, color: "text-green-400", bg: "bg-green-500/10" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border border-white/5 rounded-2xl p-4 text-center`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
              <p className="text-xs text-white/40 font-bold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
            <input type="text" placeholder="بحث بالاسم أو البريد أو الجوال..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-6 outline-none focus:border-blue-500/50 w-full" />
          </div>
          <div className="relative">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
            <select value={filter} onChange={(e) => setFilter(e.target.value as FilterType)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-6 outline-none appearance-none focus:border-blue-500/50 font-bold text-sm min-w-[160px]">
              <option value="all">الكل</option>
              <option value="new">جدد (بدون معلم)</option>
              <option value="trial">حصة تجريبية</option>
              <option value="evaluate">بانتظار التقييم</option>
              <option value="active">مشتركين</option>
            </select>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-32 bg-white/5 rounded-[32px] border border-white/10">
              <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 font-bold">لا يوجد طلاب يطابقون بحثك</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {paginated.map((student) => (
                <motion.div key={student.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white/5 border border-white/10 rounded-[24px] p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Student Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-white/10 overflow-hidden relative shrink-0">
                        {student.avatar_url ? (
                          <Image src={student.avatar_url} alt="" fill sizes="44px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-blue-400/60 text-sm font-black">
                            {(student.full_name ?? "?")[0]}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{student.full_name ?? "طالب"}</p>
                        <div className="flex items-center gap-3 text-[10px] text-white/30">
                          {student.email && <span>{student.email}</span>}
                          {student.city && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{student.city}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Grade */}
                    <div className="shrink-0">
                      {student.grade_level ? (
                        <span className="text-[10px] font-bold bg-green-500/10 text-green-300 border border-green-500/20 px-2.5 py-1 rounded-full">
                          {getGradeLabel(student.grade_level)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/15">—</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="shrink-0 min-w-[120px]">
                      {getStatusBadge(student.latest_booking_status)}
                      {student.teacher_name && (
                        <p className="text-[10px] text-white/25 mt-0.5">مع: {student.teacher_name}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {/* No booking → Assign teacher */}
                      {!student.latest_booking_status && (
                        <button type="button"
                          onClick={() => setAssignModal({ studentId: student.id, studentName: student.full_name ?? "طالب" })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all">
                          <UserPlus className="w-3.5 h-3.5" /> ربط بمعلم
                        </button>
                      )}

                      {/* pending = trial → Request evaluation */}
                      {student.latest_booking_status === "pending" && student.latest_booking_id && (
                        <button type="button"
                          onClick={() => handleRequestEval(student.latest_booking_id!)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 rounded-xl text-xs font-bold hover:bg-yellow-500/25 transition-all disabled:opacity-40">
                          <ClipboardList className="w-3.5 h-3.5" /> طلب تقييم
                        </button>
                      )}

                      {/* confirmed = trial done → Activate */}
                      {student.latest_booking_status === "confirmed" && student.latest_booking_id && (
                        <button type="button"
                          onClick={() => handleActivate(student.latest_booking_id!)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-500 transition-all disabled:opacity-40">
                          <Banknote className="w-3.5 h-3.5" /> تفعيل الاشتراك
                        </button>
                      )}

                      {/* completed = active subscription */}
                      {student.latest_booking_status === "completed" && (
                        <span className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> نشط
                        </span>
                      )}

                      {/* Contact */}
                      {student.phone && (
                        <WhatsAppButton phone={student.phone}
                          message={`مرحباً ${student.full_name}، نتواصل معك من منصة مرتقى أكاديمي.`} size="sm" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="mt-6 flex items-center justify-between px-2">
            <p className="text-xs text-white/30 font-bold">
              عرض {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filtered.length)} من {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20">
                <ChevronsRight className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20">
                <ChevronRight className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p); return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? <span key={`d-${idx}`} className="px-2 text-white/20 text-sm">...</span> : (
                    <button key={item} onClick={() => setCurrentPage(item as number)}
                      className={`min-w-[36px] h-9 rounded-xl text-sm font-bold transition-all ${
                        currentPage === item ? "bg-blue-600 text-white border border-blue-500" : "bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                      }`}>{item}</button>
                  )
                )}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20">
                <ChevronsLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Assign Teacher Modal */}
        <AnimatePresence>
          {assignModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/5  backdrop-blur-sm"
              onClick={() => setAssignModal(null)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-lg bg-[#111114] border border-white/10 rounded-[28px] p-6 md:p-8 space-y-5"
                onClick={(e) => e.stopPropagation()}>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-400" />
                    ربط طالب بمعلم
                  </h3>
                  <button type="button" onClick={() => setAssignModal(null)} className="p-2 rounded-xl hover:bg-white/10 text-white/40">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
                  <p className="text-sm text-blue-300">
                    سيتم ربط الطالب <strong className="text-white">{assignModal.studentName}</strong> بالمعلم المختار لحصة تجريبية.
                  </p>
                </div>

                {/* Teacher Search */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/40">اختر المعلم</label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type="text" value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)}
                      placeholder="ابحث عن معلم..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pr-10 pl-4 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div className="max-h-[250px] overflow-y-auto space-y-1.5 pr-1">
                    {filteredTeachers.map((t) => (
                      <button key={t.id} type="button"
                        onClick={() => setSelectedTeacher(t.id)}
                        className={`w-full text-right p-3 rounded-xl text-sm font-bold transition-all ${
                          selectedTeacher === t.id
                            ? "bg-blue-600/15 border-2 border-blue-500 text-blue-300"
                            : "bg-white/[0.02] border border-white/5 text-white/50 hover:text-white hover:bg-white/5"
                        }`}>
                        {t.full_name}
                      </button>
                    ))}
                    {filteredTeachers.length === 0 && (
                      <p className="text-center text-xs text-white/20 py-6">لا يوجد معلمون</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setAssignModal(null)}
                    className="px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all">إلغاء</button>
                  <button type="button" onClick={handleAssignTrial} disabled={!selectedTeacher || isPending}
                    className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    ربط وبدء الحصة التجريبية
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
