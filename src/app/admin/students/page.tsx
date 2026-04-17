"use client";

import { useState, useEffect, useMemo } from "react";
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
  ShieldAlert,
  ShieldCheck,
  Trash2,
  MoreVertical,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { GRADE_LEVELS } from "@/lib/constants/grade-levels";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const PAGE_SIZE = 15;

type StudentRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  grade_level: string | null;
  avatar_url: string | null;
  is_suspended: boolean | null;
  created_at?: string;
  booking_count: number;
  match_status: string | null; // suggested, accepted, or null
  matched_teacher: string | null;
};

type FilterType = "all" | "booked" | "not_booked" | "matched" | "unmatched";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [gradeFilter, setGradeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Get all student profiles (grade_level column may not exist yet)
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
          if (fallback.error) throw fallback.error;
          profiles = fallback.data;
        } else if (res.error) {
          throw res.error;
        } else {
          profiles = res.data;
        }
      }

      const studentIds = (profiles ?? []).map((p) => p.id);

      // Fetch booking counts
      const { data: bookings } = studentIds.length > 0
        ? await supabase
            .from("bookings")
            .select("student_id")
            .in("student_id", studentIds)
        : { data: [] };

      const bookingCountMap = new Map<string, number>();
      for (const b of bookings ?? []) {
        bookingCountMap.set(b.student_id, (bookingCountMap.get(b.student_id) ?? 0) + 1);
      }

      // Fetch active matches
      const { data: matches } = studentIds.length > 0
        ? await supabase
            .from("student_teacher_matches")
            .select("student_id, status, teacher_id")
            .in("student_id", studentIds)
            .in("status", ["suggested", "accepted"])
        : { data: [] };

      // Get teacher names for matches
      const matchedTeacherIds = [...new Set((matches ?? []).map((m) => m.teacher_id))];
      const { data: teacherProfiles } = matchedTeacherIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", matchedTeacherIds)
        : { data: [] };

      const teacherNameMap = new Map(
        (teacherProfiles ?? []).map((p: any) => [p.id, p.full_name])
      );

      const matchMap = new Map<string, { status: string; teacher_id: string }>();
      for (const m of matches ?? []) {
        // Keep the most recent (last) match per student
        matchMap.set(m.student_id, { status: m.status, teacher_id: m.teacher_id });
      }

      const enriched: StudentRow[] = (profiles ?? []).map((p) => {
        const match = matchMap.get(p.id);
        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          city: p.city,
          grade_level: p.grade_level,
          avatar_url: p.avatar_url,
          is_suspended: p.is_suspended,
          booking_count: bookingCountMap.get(p.id) ?? 0,
          match_status: match?.status ?? null,
          matched_teacher: match ? teacherNameMap.get(match.teacher_id) ?? null : null,
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
      // Text search
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        s.full_name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.phone?.includes(term) ||
        s.city?.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      // Grade filter
      if (gradeFilter && s.grade_level !== gradeFilter) return false;

      // Status filter
      if (filter === "booked") return s.booking_count > 0;
      if (filter === "not_booked") return s.booking_count === 0;
      if (filter === "matched") return s.match_status === "accepted";
      if (filter === "unmatched") return !s.match_status;

      return true;
    });
  }, [students, searchTerm, filter, gradeFilter]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter, gradeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Stats
  const stats = useMemo(() => ({
    total: students.length,
    booked: students.filter((s) => s.booking_count > 0).length,
    matched: students.filter((s) => s.match_status === "accepted").length,
    unmatched: students.filter((s) => !s.match_status).length,
  }), [students]);

  const getGradeLabel = (val: string | null) => {
    if (!val) return null;
    // Could be a raw value or a JSON array (from teacher flow)
    return GRADE_LEVELS.find((g) => g.value === val)?.label ?? val;
  };

  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal antialiased pt-20 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <Link href="/admin" className="text-white/40 hover:text-blue-500 transition-colors flex items-center gap-2 text-sm mb-4">
              <ArrowRight className="w-4 h-4" />
              العودة للوحة التحكم
            </Link>
            <h1 className="text-4xl font-black flex items-center gap-4">
              <Users className="text-blue-500 w-10 h-10" />
              إدارة الطلاب
            </h1>
          </div>
          <div className="text-sm text-white/40 font-bold">
            إجمالي {stats.total} طالب
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "إجمالي الطلاب", count: stats.total, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "حجزوا معلم", count: stats.booked, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "مرتبطين بمعلم", count: stats.matched, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: "بدون ترشيح", count: stats.unmatched, color: "text-yellow-400", bg: "bg-yellow-500/10" },
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
            <input
              type="text"
              placeholder="بحث بالاسم أو البريد أو الجوال أو المدينة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-6 outline-none focus:border-blue-500/50 w-full"
            />
          </div>

          <div className="relative">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-6 outline-none appearance-none focus:border-blue-500/50 font-bold text-sm min-w-[160px]"
            >
              <option value="all">الكل</option>
              <option value="booked">حجزوا معلم</option>
              <option value="not_booked">لم يحجزوا</option>
              <option value="matched">مرتبطين بمعلم</option>
              <option value="unmatched">بدون ترشيح</option>
            </select>
          </div>

          <div className="relative">
            <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-6 outline-none appearance-none focus:border-blue-500/50 font-bold text-sm min-w-[160px]"
            >
              <option value="">كل المراحل</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-white/40">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="p-5 text-xs font-black text-white/40 uppercase">الطالب</th>
                    <th className="p-5 text-xs font-black text-white/40 uppercase">المرحلة</th>
                    <th className="p-5 text-xs font-black text-white/40 uppercase">المدينة</th>
                    <th className="p-5 text-xs font-black text-white/40 uppercase">حالة الترشيح</th>
                    <th className="p-5 text-xs font-black text-white/40 uppercase">الحجوزات</th>
                    <th className="p-5 text-xs font-black text-white/40 uppercase text-left">التواصل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {paginated.map((student) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={student.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Student info */}
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 relative bg-blue-500/10">
                              {student.avatar_url ? (
                                <Image src={student.avatar_url} alt="" fill sizes="40px" className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-blue-400/60 text-sm font-black">
                                  {(student.full_name ?? "?")[0]}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate">{student.full_name ?? "طالب"}</p>
                              <p className="text-[10px] text-white/30 truncate">{student.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Grade */}
                        <td className="p-5">
                          {student.grade_level ? (
                            <span className="text-xs font-bold bg-green-500/10 text-green-300 border border-green-500/20 px-2.5 py-1 rounded-full">
                              {getGradeLabel(student.grade_level)}
                            </span>
                          ) : (
                            <span className="text-xs text-white/20">—</span>
                          )}
                        </td>

                        {/* City */}
                        <td className="p-5">
                          <span className="text-sm text-white/50">
                            {student.city || "—"}
                          </span>
                        </td>

                        {/* Match Status */}
                        <td className="p-5">
                          {student.match_status === "accepted" ? (
                            <div>
                              <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
                                <ShieldCheck className="w-3 h-3" />
                                مرتبط
                              </span>
                              {student.matched_teacher && (
                                <p className="text-[10px] text-white/30 mt-0.5">{student.matched_teacher}</p>
                              )}
                            </div>
                          ) : student.match_status === "suggested" ? (
                            <span className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                              <Sparkles className="w-3 h-3" />
                              مرشح
                            </span>
                          ) : (
                            <span className="text-xs text-white/20">بدون ترشيح</span>
                          )}
                        </td>

                        {/* Bookings */}
                        <td className="p-5">
                          {student.booking_count > 0 ? (
                            <span className="flex items-center gap-1.5 text-purple-400 text-xs font-bold">
                              <CalendarCheck className="w-3 h-3" />
                              {student.booking_count} حجز
                            </span>
                          ) : (
                            <span className="text-xs text-white/20">لا يوجد</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-5 text-left">
                          <div className="flex items-center justify-end gap-2">
                            {student.phone && (
                              <WhatsAppButton
                                phone={student.phone}
                                message={`مرحباً ${student.full_name}، نتواصل معك من منصة مرتقى أكاديمي.`}
                                size="sm"
                              />
                            )}
                            {student.email && (
                              <a
                                href={`mailto:${student.email}`}
                                className="p-2 bg-white/5 text-white/40 hover:text-blue-400 rounded-xl transition-all"
                                title="إرسال بريد"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                            {student.phone && (
                              <a
                                href={`tel:${student.phone}`}
                                className="p-2 bg-white/5 text-white/40 hover:text-blue-400 rounded-xl transition-all"
                                title="اتصال"
                              >
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {paginated.length === 0 && (
                <div className="text-center py-32 space-y-4">
                  <Users className="w-12 h-12 text-white/10 mx-auto" />
                  <p className="text-white/40 font-bold">لم يتم العثور على طلاب يطابقون بحثك</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="mt-6 flex items-center justify-between px-2">
            <p className="text-xs text-white/30 font-bold">
              عرض {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filtered.length)} من {filtered.length} طالب
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-white/20 text-sm">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item as number)}
                      className={`min-w-[36px] h-9 rounded-xl text-sm font-bold transition-all ${
                        currentPage === item
                          ? "bg-blue-600 text-white border border-blue-500"
                          : "bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
