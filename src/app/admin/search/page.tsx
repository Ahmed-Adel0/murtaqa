"use client";

import { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Clock,
  MapPin,
  BookOpen,
  GraduationCap,
  UserCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { searchTeachers } from "@/actions/search";
import { GRADE_LEVELS } from "@/lib/constants/grade-levels";
import type { GradeLevel } from "@/lib/constants/grade-levels";
import { getSubjectsForGrade, SUBJECTS } from "@/lib/constants/subjects";
import { AvailabilityDisplay } from "@/components/shared/AvailabilityDisplay";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const DAYS = [
  { value: -1, label: "الكل" },
  { value: 0, label: "الأحد" },
  { value: 1, label: "الإثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
];

export default function AdminSearchPage() {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const [filters, setFilters] = useState({
    subject: "",
    gradeLevel: "",
    dayOfWeek: -1,
    timeStart: "",
    timeEnd: "",
    city: "",
    district: "",
  });

  const availableSubjects = useMemo(() => {
    if (filters.gradeLevel) {
      return getSubjectsForGrade(filters.gradeLevel as GradeLevel);
    }
    return SUBJECTS;
  }, [filters.gradeLevel]);

  const handleSearch = () => {
    startTransition(async () => {
      const res = await searchTeachers({
        subject: filters.subject || undefined,
        gradeLevel: filters.gradeLevel || undefined,
        dayOfWeek: filters.dayOfWeek >= 0 ? filters.dayOfWeek : undefined,
        timeStart: filters.timeStart || undefined,
        timeEnd: filters.timeEnd || undefined,
        city: filters.city || undefined,
        district: filters.district || undefined,
      });
      setResults(res.results ?? []);
      setSearched(true);
    });
  };

  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal p-6  md:p-10" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8 pt-20">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Search className="w-8 h-8 text-blue-400" />
            بحث المعلمين
          </h1>
          <p className="text-white/40 text-sm">ابحث عن المعلم المناسب حسب المادة والمرحلة والوقت والمنطقة.</p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold">معايير البحث</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Grade Level — select first so subjects filter accordingly */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> المرحلة الدراسية
              </label>
              <div className="relative">
                <select
                  value={filters.gradeLevel}
                  onChange={(e) => setFilters((f) => ({ ...f, gradeLevel: e.target.value, subject: "" }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="">الكل</option>
                  {GRADE_LEVELS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </div>

            {/* Subject — filtered by selected grade level */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> المادة
              </label>
              <div className="relative">
                <select
                  value={filters.subject}
                  onChange={(e) => setFilters((f) => ({ ...f, subject: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="">الكل</option>
                  {availableSubjects.map((s) => (
                    <option key={s.value} value={s.label}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> المدينة
              </label>
              <input
                type="text"
                placeholder="مثال: تبوك"
                value={filters.city}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>

            {/* Day of Week */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 flex items-center gap-1">
                <Clock className="w-3 h-3" /> اليوم
              </label>
              <div className="relative">
                <select
                  value={filters.dayOfWeek}
                  onChange={(e) => setFilters((f) => ({ ...f, dayOfWeek: parseInt(e.target.value) }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500 appearance-none"
                >
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </div>

            {/* Time Start */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40">من الساعة</label>
              <input
                type="time"
                value={filters.timeStart}
                onChange={(e) => setFilters((f) => ({ ...f, timeStart: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>

            {/* Time End */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40">إلى الساعة</label>
              <input
                type="time"
                value={filters.timeEnd}
                onChange={(e) => setFilters((f) => ({ ...f, timeEnd: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* District */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> الحي
            </label>
            <input
              type="text"
              placeholder="مثال: المروج"
              value={filters.district}
              onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            بحث
          </button>
        </div>

        {/* Results */}
        {searched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">النتائج</h2>
              <span className="text-sm text-white/40 font-bold">{results.length} معلم</span>
            </div>

            {results.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-[28px] p-12 text-center">
                <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">لا توجد نتائج</h3>
                <p className="text-white/40 text-sm">حاول تعديل معايير البحث للحصول على نتائج.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((teacher: any) => (
                  <div
                    key={teacher.teacher_id}
                    className="bg-white/5 border border-white/10 rounded-[24px] p-6 space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-white/10 overflow-hidden relative shrink-0">
                        {teacher.avatar_url ? (
                          <Image src={teacher.avatar_url} alt="" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserCircle className="w-8 h-8 text-blue-400/60" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg">{teacher.full_name ?? "معلم"}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-white/50">
                          {teacher.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {teacher.city}
                            </span>
                          )}
                          {teacher.email && (
                            <span className="text-white/30">{teacher.email}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {teacher.phone && (
                          <WhatsAppButton
                            phone={teacher.phone}
                            message={`مرحباً ${teacher.full_name}، لديك حصة مطلوبة من خلال منصة مرتقى أكاديمي.`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects?.map((s: string) => (
                        <span key={s} className="text-[11px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                      {teacher.grade_levels?.map((g: string) => (
                        <span key={g} className="text-[11px] font-bold bg-green-500/10 text-green-300 border border-green-500/20 px-2.5 py-1 rounded-full">
                          {GRADE_LEVELS.find((gl) => gl.value === g)?.label ?? g}
                        </span>
                      ))}
                      {teacher.districts?.map((d: string) => (
                        <span key={d} className="text-[11px] font-bold bg-white/5 text-white/40 border border-white/10 px-2.5 py-1 rounded-full">
                          {d}
                        </span>
                      ))}
                    </div>

                    {/* Availability */}
                    {teacher.availability?.length > 0 && (
                      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                        <h4 className="text-xs font-bold text-white/40 mb-3 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> الأوقات المتاحة
                        </h4>
                        <AvailabilityDisplay slots={teacher.availability} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
