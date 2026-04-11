"use client";

import { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CalendarCheck,
  Search,
  X,
  SlidersHorizontal,
  Laptop,
  Home,
  GraduationCap,
  ChevronDown,
  ArrowRight,
  Info,
  MapPin,
} from "lucide-react";
import { teachers, TIER_META } from "@/lib/teachers-data";
import {
  TierBadge,
  ScoreRing,
  ScoreBreakdown,
} from "@/components/TeacherScore";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";

const RegistrationForm = dynamic(
  () => import("@/components/sections/RegistrationForm"),
  { ssr: true },
);

// ─── Filter Options ───────────────────────────────────────
const CITIES = ["الكل", "الرياض", "جدة", "تبوك", "الدمام", "الأحساء"];
const SUBJECTS = [
  "الكل",
  "رياضيات",
  "إنجليزي",
  "علوم",
  "أحياء",
  "كيمياء",
  "قدرات",
  "تحصيلي",
  "تأسيس",
  "لغة عربية",
  "قرآن",
];
const STAGES = ["الكل", "ابتدائي", "متوسط", "ثانوي", "جامعي"];
const RATINGS = ["الكل", "5.0", "4.9+", "4.8+"];
const MODES = ["الكل", "أونلاين", "أوفلاين"];

type Filters = {
  search: string;
  city: string;
  subject: string;
  stage: string;
  rating: string;
  mode: string;
  tier: string;
  sortBy: "rating" | "experience" | "name" | "score";
};

const defaultFilters: Filters = {
  search: "",
  city: "الكل",
  subject: "الكل",
  stage: "الكل",
  rating: "الكل",
  mode: "الكل",
  tier: "الكل",
  sortBy: "experience",
};

// ─── Chip component ───────────────────────────────────────
function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[11px] font-black border transition-all duration-200 cursor-pointer whitespace-nowrap ${
        active
          ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
          : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Teacher Card ─────────────────────────────────────────
function TeacherCard({ t }: { t: (typeof teachers)[0] }) {
  const [showScore, setShowScore] = useState(false);
  const tierMeta = TIER_META[t.tier];

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.3 }}
      className={`group bg-card border rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col ${tierMeta.border} hover:border-primary/40`}
    >
      {/* Image */}
      <div className="relative h-60 bg-gradient-to-b from-muted/40 to-muted/10 overflow-hidden shrink-0">
        <Image
          src={t.img || "/assets/imgs/male-Photoroom.png"}
          alt={t.name}
          fill
          className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-70" />
        {/* Tier badge top-right */}
        <div className="absolute top-3 right-3">
          <TierBadge tier={t.tier} size="sm" />
        </div>
        {/* Mode badges bottom-left */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {t.online && (
            <span className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[9px] font-black px-2 py-0.5 rounded-full backdrop-blur-sm">
              <Laptop className="w-2.5 h-2.5" /> أونلاين
            </span>
          )}
          {t.offline && (
            <span className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 text-green-400 text-[9px] font-black px-2 py-0.5 rounded-full backdrop-blur-sm">
              <Home className="w-2.5 h-2.5" /> منزلي
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Header: avatar + name + score ring */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden shrink-0">
            <Image
              src={t.img || "/assets/imgs/male-Photoroom.png"}
              alt={t.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="text-right flex-1 min-w-0">
            <h3 className="font-black text-foreground text-sm leading-snug truncate">
              {t.name}
            </h3>
            <p className="text-[10px] text-primary font-bold mt-0.5 truncate">
              {t.role}
            </p>
          </div>
          {/* Score ring with tooltip */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowScore(!showScore)}
              className="cursor-pointer"
              title="مُرتقى سكور"
            >
              <ScoreRing score={t.murtaqaScore} tier={t.tier} />
            </button>
            <AnimatePresence>
              {showScore && (
                <m.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50"
                >
                  <ScoreBreakdown t={t} />
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Subjects */}
        <div className="flex flex-wrap gap-1 mb-3 justify-end">
          {t.subjects.slice(0, 4).map((s, i) => (
            <span
              key={i}
              className="text-[9px] font-bold px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 bg-muted/30 rounded-xl p-2 mb-3 text-center">
          <div>
            <div className="text-xs font-black text-foreground flex items-center justify-center gap-0.5">
              {t.rating}{" "}
              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="text-[8px] text-muted-foreground">تقييم</div>
          </div>
          <div className="border-x border-border">
            <div className="text-xs font-black text-foreground">
              {t.experienceYears}س
            </div>
            <div className="text-[8px] text-muted-foreground">خبرة</div>
          </div>
          <div>
            <div className="text-[10px] font-black text-foreground flex items-center justify-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 text-primary" />
              {t.city}
            </div>
            <div className="text-[8px] text-muted-foreground">المدينة</div>
          </div>
        </div>

        {/* Stages */}
        <div className="flex flex-wrap gap-1 mb-4 justify-end">
          {t.stages.map((s, i) => (
            <span
              key={i}
              className="text-[9px] font-black text-primary/80 bg-primary/8 border border-primary/15 px-2 py-0.5 rounded-full"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Bio */}
        <p className="text-[11px] text-muted-foreground line-clamp-2 text-right mb-4 flex-1">
          {t.bio}
        </p>

        {/* CTA */}
        <button
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent("teacherSelected", {
                detail: { name: t.name, subject: t.subjects[0] },
              }),
            );
            document
              .getElementById("register")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-black rounded-xl py-3 text-sm transition-all duration-200 cursor-pointer shadow-sm shadow-primary/20"
        >
          <CalendarCheck className="w-4 h-4" />
          احجز معه الآن
        </button>
      </div>
    </m.div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function TeachersPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const activeCount = Object.entries(filters).filter(
    ([k, v]) => k !== "sortBy" && v !== "الكل" && v !== "",
  ).length;

  const set = (key: keyof Filters, val: string) =>
    setFilters((f) => ({ ...f, [key]: val }));

  const reset = () => setFilters(defaultFilters);

  // ─── Normalization Helper ───
  const normalize = (txt: string) => {
    return txt
      .toLowerCase()
      .replace(/[أإآ]/g, "ا")
      .replace(/[ة]/g, "ه")
      .replace(/[ى]/g, "ي")
      .replace(/\s+/g, "")
      .trim();
  };

  const filtered = useMemo(() => {
    let list = [...teachers];

    // 1. Search Filter (Normalized)
    if (filters.search.trim()) {
      const q = normalize(filters.search);
      list = list.filter((t) => {
        const nameMatch = normalize(t.name).includes(q);
        const subjectMatch = t.subjects.some((s) => normalize(s).includes(q));
        const cityMatch = normalize(t.city).includes(q);
        const roleMatch = normalize(t.role).includes(q);
        return nameMatch || subjectMatch || cityMatch || roleMatch;
      });
    }

    // 2. City Filter
    if (filters.city !== "الكل") {
      list = list.filter((t) => t.city === filters.city);
    }

    // 3. Subject Filter (Flexible Matching)
    if (filters.subject !== "الكل") {
      const sFilter = normalize(filters.subject);
      list = list.filter((t) => {
        return t.subjects.some((sub) => {
          const sNormalized = normalize(sub);
          // Precise mapping for common variations
          if (
            sFilter === "انجليزي" &&
            (sNormalized.includes("انجليزي") || sNormalized.includes("english"))
          )
            return true;
          if (
            sFilter === "لغه‌عربيه" &&
            (sNormalized.includes("عربي") ||
              sNormalized.includes("لغتي") ||
              sNormalized.includes("بلاغه"))
          )
            return true;
          if (
            sFilter === "رياضيات" &&
            (sNormalized.includes("رياضيات") ||
              sNormalized.includes("كمي") ||
              sNormalized.includes("احصاء"))
          )
            return true;
          return sNormalized.includes(sFilter);
        });
      });
    }

    // 4. Stage Filter
    if (filters.stage !== "الكل") {
      list = list.filter((t) => t.stages.includes(filters.stage));
    }

    // 5. Rating Filter
    if (filters.rating === "5.0") list = list.filter((t) => t.rating === "5.0");
    else if (filters.rating === "4.9+")
      list = list.filter((t) => parseFloat(t.rating) >= 4.9);
    else if (filters.rating === "4.8+")
      list = list.filter((t) => parseFloat(t.rating) >= 4.8);

    // 6. Mode Filter
    if (filters.mode === "أونلاين") list = list.filter((t) => t.online);
    else if (filters.mode === "أوفلاين") list = list.filter((t) => t.offline);

    // 7. Tier Filter
    if (filters.tier !== "الكل") {
      const tierMap: Record<string, string> = {
        بلاتيني: "platinum",
        ذهبي: "gold",
        فضي: "silver",
        برونزي: "bronze",
      };
      list = list.filter((t) => t.tier === tierMap[filters.tier]);
    }

    // Sort
    if (filters.sortBy === "score")
      list.sort((a, b) => b.murtaqaScore - a.murtaqaScore);
    else if (filters.sortBy === "rating")
      list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    else if (filters.sortBy === "experience")
      list.sort((a, b) => b.experienceYears - a.experienceYears);
    else list.sort((a, b) => a.name.localeCompare(b.name, "ar"));

    return list;
  }, [filters]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-20">
        {/* ── Header ── */}
        <div className="relative bg-section-alt border-b border-border overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,rgba(42,169,224,0.06),transparent_60%)]" />
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm font-bold mb-6 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              العودة للرئيسية
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[11px] font-black px-3 py-1 rounded-full mb-3">
                  <GraduationCap className="w-3.5 h-3.5" /> جميع المدرسين
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-foreground">
                  تصفح <span className="text-primary">+90 مدرس</span> معتمد
                </h1>
                <p className="text-muted-foreground text-sm mt-2">
                  ابحث وفلتر للعثور على المدرس المثالي لأبنائك
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-primary">
                  {filtered.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  نتيجة مطابقة
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <div className="flex gap-6">
            {/* ── Sidebar Filters (Desktop) ── */}
            <aside className="hidden lg:flex flex-col gap-5 w-64 shrink-0 self-start sticky top-24">
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={reset}
                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer font-bold"
                  >
                    مسح الفلاتر
                  </button>
                  <span className="text-sm font-black text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    الفلاتر
                  </span>
                </div>

                {/* Search */}
                <div className="relative mb-5">
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو المادة..."
                    value={filters.search}
                    onChange={(e) => set("search", e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 pr-9 text-sm text-right placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                </div>

                <FilterGroup
                  label="المدينة"
                  options={CITIES}
                  value={filters.city}
                  onChange={(v) => set("city", v)}
                />
                <FilterGroup
                  label="المادة"
                  options={SUBJECTS}
                  value={filters.subject}
                  onChange={(v) => set("subject", v)}
                />
                <FilterGroup
                  label="المرحلة"
                  options={STAGES}
                  value={filters.stage}
                  onChange={(v) => set("stage", v)}
                />
                <FilterGroup
                  label="التقييم"
                  options={RATINGS}
                  value={filters.rating}
                  onChange={(v) => set("rating", v)}
                />
                <FilterGroup
                  label="نوع الدرس"
                  options={MODES}
                  value={filters.mode}
                  onChange={(v) => set("mode", v)}
                />
                <FilterGroup
                  label="الشارة"
                  options={["الكل", "بلاتيني", "ذهبي", "فضي", "برونزي"]}
                  value={filters.tier}
                  onChange={(v) => set("tier", v)}
                />

                {/* Sort */}
                <div className="mt-4">
                  <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2 text-right">
                    ترتيب حسب
                  </p>
                  <div className="relative">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => set("sortBy", e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-right appearance-none focus:outline-none focus:border-primary/60 cursor-pointer"
                    >
                      <option value="score">مُرتقى سكور ⭐</option>
                      <option value="rating">التقييم</option>
                      <option value="experience">سنوات الخبرة</option>
                      <option value="name">الاسم</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Tier Legend */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-3 text-right flex items-center justify-end gap-1">
                  <Info className="w-3 h-3" /> مُرتقى سكور
                </p>
                <div className="space-y-2">
                  {(
                    Object.entries(TIER_META) as [
                      string,
                      (typeof TIER_META)[keyof typeof TIER_META],
                    ][]
                  ).map(([key, meta]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span className={`text-[10px] font-black ${meta.color}`}>
                        {key === "platinum"
                          ? "≥ 90"
                          : key === "gold"
                            ? "80–89"
                            : key === "silver"
                              ? "70–79"
                              : "< 70"}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full border ${meta.bg} ${meta.border} ${meta.color}`}
                      >
                        {meta.emoji} {meta.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filter Bar */}
              <div className="lg:hidden mb-4 flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="ابحث..."
                    value={filters.search}
                    onChange={(e) => set("search", e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2.5 pr-9 text-sm text-right placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-bold cursor-pointer hover:border-primary/40 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  فلترة
                  {activeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Mobile Filter Panel */}
              <AnimatePresence>
                {showFilters && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="lg:hidden overflow-hidden mb-4"
                  >
                    <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
                      <FilterGroup
                        label="المدينة"
                        options={CITIES}
                        value={filters.city}
                        onChange={(v) => set("city", v)}
                      />
                      <FilterGroup
                        label="المادة"
                        options={SUBJECTS}
                        value={filters.subject}
                        onChange={(v) => set("subject", v)}
                      />
                      <FilterGroup
                        label="المرحلة"
                        options={STAGES}
                        value={filters.stage}
                        onChange={(v) => set("stage", v)}
                      />
                      <FilterGroup
                        label="التقييم"
                        options={RATINGS}
                        value={filters.rating}
                        onChange={(v) => set("rating", v)}
                      />
                      <FilterGroup
                        label="نوع الدرس"
                        options={MODES}
                        value={filters.mode}
                        onChange={(v) => set("mode", v)}
                      />
                      <div className="flex justify-between pt-2">
                        <button
                          onClick={reset}
                          className="text-sm text-primary font-bold cursor-pointer"
                        >
                          مسح الفلاتر
                        </button>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="text-sm text-muted-foreground font-bold cursor-pointer"
                        >
                          إغلاق
                        </button>
                      </div>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>

              {/* Active Filter Chips */}
              {activeCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 justify-end">
                  {filters.search && (
                    <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[11px] font-black px-3 py-1 rounded-full">
                      بحث: {filters.search}
                      <button onClick={() => set("search", "")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.city !== "الكل" && (
                    <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[11px] font-black px-3 py-1 rounded-full">
                      {filters.city}
                      <button onClick={() => set("city", "الكل")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.subject !== "الكل" && (
                    <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[11px] font-black px-3 py-1 rounded-full">
                      {filters.subject}
                      <button onClick={() => set("subject", "الكل")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.stage !== "الكل" && (
                    <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[11px] font-black px-3 py-1 rounded-full">
                      {filters.stage}
                      <button onClick={() => set("stage", "الكل")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.mode !== "الكل" && (
                    <span className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[11px] font-black px-3 py-1 rounded-full">
                      {filters.mode}
                      <button onClick={() => set("mode", "الكل")}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Grid */}
              {filtered.length === 0 ? (
                <div className="text-center py-24 text-muted-foreground">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="font-black text-foreground text-lg">
                    لا توجد نتائج مطابقة
                  </p>
                  <p className="text-sm mt-2">
                    جرّب تغيير الفلاتر أو البحث بكلمات أخرى
                  </p>
                  <button
                    onClick={reset}
                    className="mt-4 text-primary font-bold text-sm underline cursor-pointer"
                  >
                    مسح جميع الفلاتر
                  </button>
                </div>
              ) : (
                <m.div
                  layout
                  className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  <AnimatePresence>
                    {filtered.map((t) => (
                      <TeacherCard key={t.id} t={t} />
                    ))}
                  </AnimatePresence>
                </m.div>
              )}
            </div>
          </div>
        </div>
        <RegistrationForm />
      </main>
    </>
  );
}

// ─── Filter Group Helper ──────────────────────────────────
function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-2 text-right">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5 justify-end">
        {options.map((o) => (
          <Chip
            key={o}
            label={o}
            active={value === o}
            onClick={() => onChange(o)}
          />
        ))}
      </div>
    </div>
  );
}
