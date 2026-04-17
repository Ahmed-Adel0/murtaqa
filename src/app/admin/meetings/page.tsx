"use client";

import { useEffect, useState, useMemo, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  GraduationCap,
  Loader2,
  Search,
  Filter,
  Star,
  ClipboardList,
  Banknote,
  BookOpen,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Send,
  Copy,
  Heart,
  ThumbsDown,
} from "lucide-react";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import {
  assignTrialLesson,
  requestEvaluation,
  activateSubscription,
  cancelLesson,
  getTeachersForAssignment,
  getStudentsForAssignment,
  getAllLessons,
} from "@/actions/student-management";

const PAGE_SIZE = 12;

/**
 * DB bookings.status mapping:
 *   pending   = حصة تجريبية (trial)
 *   confirmed = بانتظار التقييم (trial done / evaluate)
 *   completed = مشترك نشط (active subscription)
 *   cancelled = ملغاة
 */

type LessonRow = {
  id: string;
  student_id: string;
  teacher_id: string;
  student_name: string | null;
  teacher_name: string | null;
  teacher_phone: string | null;
  student_phone: string | null;
  status: string;
  created_at: string;
  has_review: boolean;
  review_rating: number | null;
  review_comment: string | null;
  wants_continue: boolean | null;
  subjects: string[];
};

type LessonType = "trial" | "subscription";
type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

export default function AdminMeetingsPage() {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [students, setStudents] = useState<{ id: string; full_name: string; phone: string | null }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; full_name: string; subjects: string[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    description: string;
    confirmText: string;
    confirmColor: string; // tailwind class
    onConfirm: () => void;
  } | null>(null);

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    teacherId: "",
    lessonType: "trial" as LessonType,
    subject: "",
  });
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");

  // Subscription modal
  const [subscribeModal, setSubscribeModal] = useState<{ bookingId: string; studentName: string } | null>(null);
  const [subscribePrice, setSubscribePrice] = useState("");
  const [subscribePaid, setSubscribePaid] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // All fetches via server actions (bypasses RLS)
      const [lessonsData, studentsData, teachersData] = await Promise.all([
        getAllLessons(),
        getStudentsForAssignment(),
        getTeachersForAssignment(),
      ]);

      setLessons(lessonsData as LessonRow[]);
      setStudents(studentsData);
      setTeachers(teachersData);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered lessons
  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        l.student_name?.toLowerCase().includes(term) ||
        l.teacher_name?.toLowerCase().includes(term);
      if (!matchesSearch) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      return true;
    });
  }, [lessons, searchTerm, statusFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Stats
  const stats = useMemo(() => ({
    total: lessons.length,
    pending: lessons.filter((l) => l.status === "pending").length,
    confirmed: lessons.filter((l) => l.status === "confirmed").length,
    completed: lessons.filter((l) => l.status === "completed").length,
  }), [lessons]);

  // Actions
  const handleCreateLesson = () => {
    if (!form.studentId || !form.teacherId) return;
    startTransition(async () => {
      setMessage(null);
      const res = await assignTrialLesson(form.studentId, form.teacherId);
      if (res.success) {
        setMessage({ kind: "success", text: form.lessonType === "trial" ? "تم إنشاء الحصة التجريبية" : "تم إنشاء حصة الاشتراك" });
        setShowForm(false);
        setForm({ studentId: "", teacherId: "", lessonType: "trial", subject: "" });
        fetchAll();
      } else {
        setMessage({ kind: "error", text: res.error ?? "فشل الإنشاء" });
      }
      setTimeout(() => setMessage(null), 4000);
    });
  };

  // Mark lesson as done (pending → confirmed)
  const handleMarkDone = (bookingId: string) => {
    startTransition(async () => {
      const res = await requestEvaluation(bookingId); // changes to "confirmed"
      if (res.success) {
        setLessons((prev) => prev.map((l) => l.id === bookingId ? { ...l, status: "confirmed" } : l));
        setMessage({ kind: "success", text: "تم تحديد الحصة كمنتهية" });
      } else {
        setMessage({ kind: "error", text: res.error ?? "فشلت العملية" });
      }
      setTimeout(() => setMessage(null), 4000);
    });
  };

  // Send evaluation link to student via WhatsApp
  const handleSendEval = (lesson: LessonRow) => {
    const evalUrl = `${window.location.origin}/evaluate/${lesson.id}`;
    const phone = lesson.student_phone?.replace(/^0/, "966").replace(/[\s-]/g, "") ?? "";
    const msg = `مرحباً ${lesson.student_name}،\n\nنأمل أن تكون الحصة التجريبية مع المعلم ${lesson.teacher_name} قد أعجبتك! 🌟\n\nيرجى تقييم الحصة من خلال الرابط التالي:\n${evalUrl}\n\nشكراً لثقتك بمرتقى أكاديمي!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    setMessage({ kind: "success", text: "تم فتح الواتساب لإرسال رابط التقييم" });
    setTimeout(() => setMessage(null), 3000);
  };

  // Copy evaluation link
  const handleCopyEvalLink = (lessonId: string) => {
    const url = `${window.location.origin}/evaluate/${lessonId}`;
    navigator.clipboard.writeText(url);
    setMessage({ kind: "success", text: "تم نسخ رابط التقييم" });
    setTimeout(() => setMessage(null), 2000);
  };

  // Activate subscription with price
  const handleActivateWithPrice = () => {
    if (!subscribeModal || !subscribePaid) return;
    startTransition(async () => {
      const res = await activateSubscription(subscribeModal.bookingId, parseFloat(subscribePrice) || undefined);
      if (res.success) {
        setLessons((prev) => prev.map((l) => l.id === subscribeModal.bookingId ? { ...l, status: "completed" } : l));
        setMessage({ kind: "success", text: `تم تفعيل اشتراك ${subscribeModal.studentName} بنجاح` });
        setSubscribeModal(null);
        setSubscribePrice("");
        setSubscribePaid(false);
      } else {
        setMessage({ kind: "error", text: res.error ?? "فشل التفعيل" });
      }
      setTimeout(() => setMessage(null), 4000);
    });
  };

  const handleCancel = (bookingId: string) => {
    startTransition(async () => {
      const res = await cancelLesson(bookingId);
      if (res.success) {
        setLessons((prev) => prev.map((l) => l.id === bookingId ? { ...l, status: "cancelled" } : l));
        setMessage({ kind: "success", text: "تم إلغاء الحصة" });
      } else {
        setMessage({ kind: "error", text: res.error ?? "فشل الإلغاء" });
      }
      setTimeout(() => setMessage(null), 4000);
    });
  };

  const getStatusBadge = (status: string, hasReview: boolean) => {
    switch (status) {
      case "pending":
        return <span className="flex items-center gap-1.5 text-blue-400 text-[11px] font-bold bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full"><Clock className="w-3 h-3" />حصة تجريبية</span>;
      case "confirmed":
        return hasReview
          ? <span className="flex items-center gap-1.5 text-purple-400 text-[11px] font-bold bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full"><Star className="w-3 h-3" />تم التقييم</span>
          : <span className="flex items-center gap-1.5 text-yellow-400 text-[11px] font-bold bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full"><ClipboardList className="w-3 h-3" />بانتظار التقييم</span>;
      case "completed":
        return <span className="flex items-center gap-1.5 text-green-400 text-[11px] font-bold bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" />اشتراك نشط</span>;
      case "cancelled":
        return <span className="flex items-center gap-1.5 text-red-400 text-[11px] font-bold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full"><XCircle className="w-3 h-3" />ملغاة</span>;
      default:
        return <span className="text-xs text-white/20">{status}</span>;
    }
  };

  const filteredStudents = studentSearch
    ? students.filter((s) => s.full_name.toLowerCase().includes(studentSearch.toLowerCase()))
    : students;

  const filteredTeachers = teacherSearch
    ? teachers.filter((t) => t.full_name.toLowerCase().includes(teacherSearch.toLowerCase()))
    : teachers;

  if (loading) {
    return <div className="min-h-screen bg-[#060607] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal antialiased pt-20 p-6 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-20">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-400" />
              إدارة الحصص
            </h1>
            <p className="text-white/40 text-sm mt-1">إنشاء ومتابعة وإدارة جميع الحصص الدراسية.</p>
          </div>
          <button type="button" onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-500 transition-all shrink-0">
            <Plus className="w-4 h-4" /> حصة جديدة
          </button>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`p-4 rounded-2xl text-sm font-bold text-center ${
                message.kind === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>{message.text}</motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "إجمالي الحصص", count: stats.total, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "تجريبية", count: stats.pending, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "بانتظار تقييم", count: stats.confirmed, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: "اشتراك نشط", count: stats.completed, color: "text-green-400", bg: "bg-green-500/10" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border border-white/5 rounded-2xl p-4 text-center`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
              <p className="text-xs text-white/40 font-bold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Plus className="w-5 h-5 text-blue-400" />إنشاء حصة جديدة</h3>
                  <button type="button" onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-white/10 text-white/40"><X className="w-5 h-5" /></button>
                </div>

                {/* Lesson Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">نوع الحصة</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setForm((f) => ({ ...f, lessonType: "trial" }))}
                      className={`p-4 rounded-2xl border-2 text-center font-bold transition-all ${
                        form.lessonType === "trial" ? "bg-blue-600/15 border-blue-500 text-blue-300" : "bg-white/[0.02] border-white/10 text-white/50"
                      }`}>
                      <Clock className="w-5 h-5 mx-auto mb-2" />
                      <span className="text-sm">حصة تجريبية</span>
                    </button>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, lessonType: "subscription" }))}
                      className={`p-4 rounded-2xl border-2 text-center font-bold transition-all ${
                        form.lessonType === "subscription" ? "bg-green-600/15 border-green-500 text-green-300" : "bg-white/[0.02] border-white/10 text-white/50"
                      }`}>
                      <Banknote className="w-5 h-5 mx-auto mb-2" />
                      <span className="text-sm">حصة اشتراك</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40">الطالب</label>
                    <div className="relative">
                      <Search className="absolute right-3 top-3 w-4 h-4 text-white/20" />
                      <input type="text" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="ابحث عن طالب..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-3 text-sm outline-none focus:border-blue-500 mb-2" />
                    </div>
                    <div className="max-h-[150px] overflow-y-auto space-y-1 pr-1">
                      {filteredStudents.slice(0, 20).map((s) => (
                        <button key={s.id} type="button" onClick={() => { setForm((f) => ({ ...f, studentId: s.id })); setStudentSearch(s.full_name); }}
                          className={`w-full text-right p-2.5 rounded-lg text-xs font-bold transition-all ${
                            form.studentId === s.id ? "bg-blue-600/15 border border-blue-500 text-blue-300" : "bg-white/[0.02] border border-white/5 text-white/50 hover:bg-white/5"
                          }`}>{s.full_name}</button>
                      ))}
                      {filteredStudents.length === 0 && <p className="text-center text-[10px] text-white/20 py-3">لا يوجد طلاب</p>}
                    </div>
                  </div>

                  {/* Teacher picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40">المعلم</label>
                    <div className="relative">
                      <Search className="absolute right-3 top-3 w-4 h-4 text-white/20" />
                      <input type="text" value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)}
                        placeholder="ابحث عن معلم..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-3 text-sm outline-none focus:border-blue-500 mb-2" />
                    </div>
                    <div className="max-h-[150px] overflow-y-auto space-y-1 pr-1">
                      {filteredTeachers.slice(0, 20).map((t) => (
                        <button key={t.id} type="button" onClick={() => { setForm((f) => ({ ...f, teacherId: t.id })); setTeacherSearch(t.full_name); }}
                          className={`w-full text-right p-2.5 rounded-lg text-xs font-bold transition-all ${
                            form.teacherId === t.id ? "bg-blue-600/15 border border-blue-500 text-blue-300" : "bg-white/[0.02] border border-white/5 text-white/50 hover:bg-white/5"
                          }`}>
                          <span>{t.full_name}</span>
                          {t.subjects?.length > 0 && (
                            <span className="flex flex-wrap gap-1 mt-1">
                              {t.subjects.slice(0, 3).map((s) => (
                                <span key={s} className="text-[9px] bg-blue-500/10 text-blue-300/70 px-1.5 py-0.5 rounded">{s}</span>
                              ))}
                            </span>
                          )}
                        </button>
                      ))}
                      {filteredTeachers.length === 0 && <p className="text-center text-[10px] text-white/20 py-3">لا يوجد معلمون</p>}
                    </div>
                  </div>
                </div>

                <button type="button" onClick={handleCreateLesson} disabled={!form.studentId || !form.teacherId || isPending}
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  إنشاء الحصة
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالطالب أو المعلم..."
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-6 outline-none focus:border-blue-500/50 w-full text-sm" />
          </div>
          <div className="relative">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-black border border-white/10 rounded-2xl py-3 pr-12 pl-6 outline-none appearance-none focus:border-blue-500/50 font-bold text-sm min-w-[180px]">
              <option value="all">الكل ({stats.total})</option>
              <option value="pending">تجريبية ({stats.pending})</option>
              <option value="confirmed">بانتظار تقييم ({stats.confirmed})</option>
              <option value="completed">اشتراك نشط ({stats.completed})</option>
              <option value="cancelled">ملغاة</option>
            </select>
          </div>
        </div>

        {/* Lessons List */}
        {paginated.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-[28px] p-16 text-center">
            <Calendar className="w-14 h-14 text-white/5 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">لا توجد حصص</h3>
            <p className="text-white/40 text-sm">أنشئ حصة جديدة من الزر أعلاه.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map((lesson) => (
              <motion.div key={lesson.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 hover:border-white/15 rounded-[24px] p-5 transition-all">

                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Student + Teacher */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-sm font-bold truncate max-w-[120px]">{lesson.student_name}</span>
                    </div>
                    <span className="text-white/15 shrink-0">→</span>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold truncate block max-w-[120px]">{lesson.teacher_name}</span>
                        {lesson.subjects?.length > 0 && (
                          <span className="flex flex-wrap gap-1 mt-0.5">
                            {lesson.subjects?.slice(0, 2).map((s) => (
                              <span key={s} className="text-[9px] bg-blue-500/10 text-blue-300/70 px-1.5 py-0.5 rounded">{s}</span>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-white/30 shrink-0">
                    {new Date(lesson.created_at).toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" })}
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">{getStatusBadge(lesson.status, lesson.has_review)}</div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">

                    {/* Step 1: pending → confirm "انتهت الحصة؟" */}
                    {lesson.status === "pending" && (
                      <button type="button" disabled={isPending} onClick={() => setConfirmModal({
                        title: "تأكيد انتهاء الحصة",
                        description: `هل أنت متأكد أن الحصة بين ${lesson.student_name} والمعلم ${lesson.teacher_name} قد انتهت؟`,
                        confirmText: "نعم، انتهت الحصة",
                        confirmColor: "bg-orange-600 hover:bg-orange-500",
                        onConfirm: () => handleMarkDone(lesson.id),
                      })}
                        className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl text-[11px] font-bold hover:bg-orange-500/20 transition-all disabled:opacity-40">
                        <CheckCircle2 className="w-3 h-3" /> انتهت الحصة؟
                      </button>
                    )}

                    {/* Step 2: confirmed + no review → send eval link */}
                    {lesson.status === "confirmed" && !lesson.has_review && (
                      <>
                        <button type="button" onClick={() => setConfirmModal({
                          title: "إرسال رابط التقييم",
                          description: `سيتم فتح الواتساب لإرسال رابط التقييم إلى الطالب ${lesson.student_name}. هل تريد المتابعة؟`,
                          confirmText: "إرسال عبر الواتساب",
                          confirmColor: "bg-yellow-600 hover:bg-yellow-500",
                          onConfirm: () => handleSendEval(lesson),
                        })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl text-[11px] font-bold hover:bg-yellow-500/20 transition-all">
                          <Send className="w-3 h-3" /> إرسال رابط التقييم
                        </button>
                        <button type="button" onClick={() => handleCopyEvalLink(lesson.id)}
                          className="p-2 bg-white/5 text-white/40 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                          title="نسخ رابط التقييم">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {/* Step 3: confirmed + has review + wants continue → activate */}
                    {lesson.status === "confirmed" && lesson.has_review && lesson.wants_continue && (
                      <button type="button"
                        onClick={() => setSubscribeModal({ bookingId: lesson.id, studentName: lesson.student_name ?? "طالب" })}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl text-[11px] font-bold hover:bg-green-500 transition-all">
                        <Banknote className="w-3 h-3" /> تفعيل اشتراك
                      </button>
                    )}

                    {/* Step 3b: confirmed + has review + doesn't want continue */}
                    {lesson.status === "confirmed" && lesson.has_review && lesson.wants_continue === false && (
                      <span className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-[11px] font-bold">
                        <ThumbsDown className="w-3 h-3" /> لا يرغب بالاستمرار
                      </span>
                    )}

                    {/* Step 4: completed → active badge */}
                    {lesson.status === "completed" && (
                      <span className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> 12 حصة/شهر
                      </span>
                    )}

                    {/* Cancel (not cancelled/completed) — with confirm */}
                    {lesson.status !== "cancelled" && lesson.status !== "completed" && (
                      <button type="button" disabled={isPending} onClick={() => setConfirmModal({
                        title: "تأكيد إلغاء الحصة",
                        description: `هل أنت متأكد من إلغاء الحصة بين ${lesson.student_name} والمعلم ${lesson.teacher_name}؟ لا يمكن التراجع.`,
                        confirmText: "نعم، إلغاء الحصة",
                        confirmColor: "bg-red-600 hover:bg-red-500",
                        onConfirm: () => handleCancel(lesson.id),
                      })}
                        className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-40"
                        title="إلغاء">
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* WhatsApp shortcuts */}
                    {lesson.student_phone && (
                      <WhatsAppButton phone={lesson.student_phone}
                        message={`مرحباً ${lesson.student_name}، نتواصل معك بخصوص حصتك في منصة مرتقى.`} size="sm" />
                    )}
                    {lesson.teacher_phone && (
                      <WhatsAppButton phone={lesson.teacher_phone}
                        message={`مرحباً ${lesson.teacher_name}، لديك حصة مع طالب على منصة مرتقى.`} size="sm" />
                    )}
                  </div>
                </div>

                {/* Evaluation Result — shown if review exists */}
                {lesson.has_review && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      {/* Rating stars */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/30 font-bold">تقييم الطالب:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= (lesson.review_rating ?? 0) ? "text-yellow-500 fill-yellow-500" : "text-white/10"}`} />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-yellow-400">{lesson.review_rating?.toFixed(1)}</span>
                      </div>

                      {/* Continue preference */}
                      {lesson.wants_continue === true && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-lg">
                          <Heart className="w-3 h-3 fill-green-400" /> يرغب بالاستمرار
                        </span>
                      )}
                      {lesson.wants_continue === false && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                          <ThumbsDown className="w-3 h-3" /> لا يرغب بالاستمرار
                        </span>
                      )}
                    </div>

                    {/* Comment (clean — remove the continue markers) */}
                    {lesson.review_comment && (
                      <p className="text-xs text-white/40 mt-2 leading-relaxed bg-black/20 rounded-xl p-3">
                        {lesson.review_comment
                          .replace("✅ يرغب بالاستمرار مع المعلم", "")
                          .replace("❌ لا يرغب بالاستمرار مع المعلم", "")
                          .trim() || null}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-2">
            <p className="text-xs text-white/30 font-bold">
              {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filtered.length)} من {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-20"><ChevronsRight className="w-4 h-4" /></button>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-20"><ChevronRight className="w-4 h-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p); return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? <span key={`d-${idx}`} className="px-2 text-white/20 text-sm">...</span> : (
                    <button key={item} onClick={() => setCurrentPage(item as number)}
                      className={`min-w-[36px] h-9 rounded-xl text-sm font-bold ${
                        currentPage === item ? "bg-blue-600 text-white border border-blue-500" : "bg-white/5 border border-white/10 text-white/40 hover:text-white"
                      }`}>{item}</button>
                  )
                )}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-20"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-20"><ChevronsLeft className="w-4 h-4" /></button>
            </div>
          </div>
        )}
        {/* Subscription Activation Modal */}
        <AnimatePresence>
          {subscribeModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setSubscribeModal(null)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-[#111114] border border-white/10 rounded-[28px] p-6 md:p-8 space-y-5"
                onClick={(e) => e.stopPropagation()}>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-green-400" />
                    تفعيل اشتراك
                  </h3>
                  <button type="button" onClick={() => setSubscribeModal(null)} className="p-2 rounded-xl hover:bg-white/10 text-white/40">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4">
                  <p className="text-sm text-green-300">
                    تفعيل اشتراك شهري للطالب <strong className="text-white">{subscribeModal.studentName}</strong> — 12 حصة في الشهر.
                  </p>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">سعر الاشتراك الشهري (ريال)</label>
                  <input
                    type="number"
                    value={subscribePrice}
                    onChange={(e) => setSubscribePrice(e.target.value)}
                    placeholder="مثال: 500"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-green-500"
                  />
                </div>

                {/* Payment confirmation checkbox */}
                <label className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/10 rounded-2xl cursor-pointer hover:bg-white/[0.05] transition-all">
                  <input
                    type="checkbox"
                    checked={subscribePaid}
                    onChange={(e) => setSubscribePaid(e.target.checked)}
                    className="w-5 h-5 rounded accent-green-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">هل تم الدفع؟</p>
                    <p className="text-[10px] text-white/40">أؤكد أن الطالب قام بتحويل المبلغ وتم التحقق منه.</p>
                  </div>
                </label>

                {!subscribePaid && (
                  <p className="text-[11px] text-red-400/70 text-center font-bold">يجب تأكيد استلام الدفع قبل التفعيل</p>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setSubscribeModal(null)}
                    className="px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all">
                    إلغاء
                  </button>
                  <button type="button" onClick={handleActivateWithPrice}
                    disabled={!subscribePaid || isPending}
                    className="flex-1 bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-500 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    تأكيد وتفعيل الاشتراك
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm Action Modal */}
        <AnimatePresence>
          {confirmModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setConfirmModal(null)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm bg-[#111114] border border-white/10 rounded-[28px] p-6 md:p-8 space-y-5"
                onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-black">{confirmModal.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{confirmModal.description}</p>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setConfirmModal(null)}
                    className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all text-sm">
                    إلغاء
                  </button>
                  <button type="button" disabled={isPending}
                    onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
                    className={`flex-1 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-sm ${confirmModal.confirmColor}`}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmModal.confirmText}
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
