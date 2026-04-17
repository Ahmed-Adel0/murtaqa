"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Star,
  BookOpen,
  GraduationCap,
  Users,
  Loader2,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { GRADE_LEVELS } from "@/lib/constants/grade-levels";
import { SUBJECTS } from "@/lib/constants/subjects";

const PAGE_SIZE = 12;

type TeacherCard = {
  teacher_id: string;
  bio: string | null;
  subjects: string[] | null;
  districts: string[] | null;
  grade_levels: string[] | null;
  hourly_rate: number | null;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  review_count: number;
  avg_rating: number;
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    (async () => {
      // Fetch published teachers
      const { data: profiles } = await supabase
        .from("teacher_public_profiles")
        .select("teacher_id, bio, subjects, districts, grade_levels, hourly_rate, is_published")
        .eq("is_published", true);

      if (!profiles || profiles.length === 0) {
        setLoading(false);
        return;
      }

      const ids = profiles.map((p) => p.teacher_id);

      // Fetch profile data
      const { data: userData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, city")
        .in("id", ids);

      // Fetch review stats
      const { data: reviews } = await supabase
        .from("reviews")
        .select("teacher_id, rating")
        .in("teacher_id", ids);

      const userMap = new Map((userData ?? []).map((u: any) => [u.id, u]));

      const ratingMap = new Map<string, { total: number; count: number }>();
      for (const r of reviews ?? []) {
        const e = ratingMap.get(r.teacher_id) ?? { total: 0, count: 0 };
        e.total += r.rating ?? 0;
        e.count += 1;
        ratingMap.set(r.teacher_id, e);
      }

      const cards: TeacherCard[] = profiles.map((p) => {
        const user = userMap.get(p.teacher_id);
        const stats = ratingMap.get(p.teacher_id);
        return {
          teacher_id: p.teacher_id,
          bio: p.bio,
          subjects: p.subjects as string[] | null,
          districts: p.districts as string[] | null,
          grade_levels: p.grade_levels as string[] | null,
          hourly_rate: p.hourly_rate,
          full_name: user?.full_name ?? null,
          avatar_url: user?.avatar_url ?? null,
          city: user?.city ?? null,
          review_count: stats?.count ?? 0,
          avg_rating: stats ? stats.total / stats.count : 5.0,
        };
      });

      // Sort by rating then review count
      cards.sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count);
      setTeachers(cards);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return teachers.filter((t) => {
      const term = searchTerm.toLowerCase();
      if (term && !t.full_name?.toLowerCase().includes(term) && !t.subjects?.some((s) => s.toLowerCase().includes(term))) {
        return false;
      }
      if (subjectFilter && !t.subjects?.includes(subjectFilter)) return false;
      if (gradeFilter && !t.grade_levels?.includes(gradeFilter)) return false;
      if (cityFilter && !t.city?.toLowerCase().includes(cityFilter.toLowerCase())) return false;
      return true;
    });
  }, [teachers, searchTerm, subjectFilter, gradeFilter, cityFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, subjectFilter, gradeFilter, cityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeFiltersCount = [subjectFilter, gradeFilter, cityFilter].filter(Boolean).length;

  const clearFilters = () => {
    setSubjectFilter("");
    setGradeFilter("");
    setCityFilter("");
    setSearchTerm("");
  };

  // Get unique subjects from teachers for filter
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => t.subjects?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [teachers]);

  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal antialiased" dir="rtl">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-[#060607]" />
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-purple-500/8 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              اكتشف <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-blue-600">أفضل المعلمين</span>
            </h1>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              معلمون مؤهلون ومعتمدون في جميع المواد والمراحل الدراسية
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم أو المادة..."
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pr-14 pl-14 outline-none focus:border-blue-500/50 transition-all text-base"
              />
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={`absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                  showFilters || activeFiltersCount > 0
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-white/40 hover:text-white"
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white/60">تصفية النتائج</span>
                      {activeFiltersCount > 0 && (
                        <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1">
                          <X className="w-3 h-3" /> مسح الكل
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/30 uppercase flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> المادة
                        </label>
                        <select
                          value={subjectFilter}
                          onChange={(e) => setSubjectFilter(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-sm font-bold outline-none focus:border-blue-500 appearance-none"
                        >
                          <option value="">الكل</option>
                          {availableSubjects.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/30 uppercase flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" /> المرحلة
                        </label>
                        <select
                          value={gradeFilter}
                          onChange={(e) => setGradeFilter(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-sm font-bold outline-none focus:border-blue-500 appearance-none"
                        >
                          <option value="">الكل</option>
                          {GRADE_LEVELS.map((g) => (
                            <option key={g.value} value={g.value}>{g.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-white/30 uppercase flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> المدينة
                        </label>
                        <input
                          type="text"
                          value={cityFilter}
                          onChange={(e) => setCityFilter(e.target.value)}
                          placeholder="مثال: تبوك"
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-sm font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Results count */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="font-bold">{filtered.length} معلم</span>
            {activeFiltersCount > 0 && (
              <span className="text-xs text-white/30">({activeFiltersCount} فلتر نشط)</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-white/40">جاري تحميل المعلمين...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-32 bg-white/[0.02] border border-white/5 rounded-[32px]">
            <Search className="w-16 h-16 text-white/5 mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
            <p className="text-white/40 text-sm mb-6">حاول تغيير معايير البحث أو التصفية</p>
            <button onClick={clearFilters} className="text-blue-400 hover:text-blue-300 font-bold text-sm underline">
              مسح جميع الفلاتر
            </button>
          </div>
        ) : (
          <>
            {/* Teacher Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {paginated.map((teacher, i) => (
                  <motion.div
                    key={teacher.teacher_id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link href={`/teachers/${teacher.teacher_id}`}>
                      <div className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-blue-500/30 rounded-[28px] p-6 transition-all duration-300 h-full flex flex-col">
                        {/* Top: Avatar + Info */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-blue-500/30 relative shrink-0 bg-blue-500/10 transition-colors">
                            {teacher.avatar_url ? (
                              <Image src={teacher.avatar_url} alt="" fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-blue-400/60 font-black text-xl">
                                {(teacher.full_name ?? "?")[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-base mb-1 truncate group-hover:text-blue-300 transition-colors">
                              {teacher.full_name ?? "معلم"}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-white/40">
                              <span className="flex items-center gap-1 text-yellow-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {teacher.avg_rating.toFixed(1)}
                              </span>
                              <span>({teacher.review_count} تقييم)</span>
                            </div>
                          </div>
                        </div>

                        {/* Subjects */}
                        {teacher.subjects && teacher.subjects.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {teacher.subjects.slice(0, 3).map((s) => (
                              <span key={s} className="text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/15 px-2 py-0.5 rounded-full">
                                {s}
                              </span>
                            ))}
                            {teacher.subjects.length > 3 && (
                              <span className="text-[10px] text-white/20">+{teacher.subjects.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Grade levels */}
                        {teacher.grade_levels && teacher.grade_levels.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {teacher.grade_levels.slice(0, 3).map((g) => (
                              <span key={g} className="text-[10px] font-bold bg-green-500/10 text-green-300 border border-green-500/15 px-2 py-0.5 rounded-full">
                                {GRADE_LEVELS.find((gl) => gl.value === g)?.label ?? g}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Bio */}
                        {teacher.bio && (
                          <p className="text-xs text-white/30 leading-relaxed line-clamp-2 mb-4 flex-1">
                            {teacher.bio}
                          </p>
                        )}

                        {/* Footer: City + Districts */}
                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                          {teacher.city && (
                            <span className="text-[11px] text-white/30 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {teacher.city}
                            </span>
                          )}
                          <span className="text-[11px] text-blue-400 font-bold group-hover:translate-x-[-4px] transition-transform flex items-center gap-1">
                            عرض الملف
                            <ChevronLeft className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span key={`d-${idx}`} className="px-2 text-white/20">...</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item as number)}
                        className={`min-w-[40px] h-10 rounded-xl text-sm font-bold transition-all ${
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
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
