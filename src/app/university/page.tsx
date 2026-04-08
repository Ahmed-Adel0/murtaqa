"use client";

import { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  GraduationCap, Star, CalendarCheck, Search, X, SlidersHorizontal,
  Laptop, Home, ArrowRight, Microscope, FlaskConical, Calculator,
  BookOpen, Brain, Stethoscope, Pill, Dna, Check, ChevronLeft,
  MapPin, Zap, Shield, Trophy, Users
} from "lucide-react";
import { teachers } from "@/lib/teachers-data";
import { TierBadge, ScoreRing, ScoreBreakdown } from "@/components/TeacherScore";
import Navbar from "@/components/Navbar";

const RegistrationForm = dynamic(() => import("@/components/sections/RegistrationForm"), { ssr: true });

// ─── University teachers = those with "جامعي" in stages ───
const universityTeachers = teachers.filter((t) =>
  t.stages.includes("جامعي")
);

const SUBJECTS_UNI = [
  "الكل", "كيمياء", "علوم", "رياضيات", "أحياء", "إنجليزي", "chemistry", "science"
];
const MODES = ["الكل", "أونلاين", "أوفلاين"];

// ─── Stats ───────────────────────────────────
const stats = [
  { icon: <GraduationCap className="w-6 h-6" />, value: "+10", label: "مدرس جامعي" },
  { icon: <Stethoscope className="w-6 h-6" />, value: "5+", label: "تخصصات طبية" },
  { icon: <Star className="w-6 h-6 fill-current" />, value: "4.9", label: "متوسط التقييم" },
  { icon: <Zap className="w-6 h-6" />, value: "24h", label: "رد سريع" },
];

// ─── Specialties ──────────────────────────────
const specialties = [
  { icon: <Stethoscope className="w-7 h-7" />, label: "كلية الطب", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  { icon: <Microscope className="w-7 h-7" />, label: "كلية العلوم", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { icon: <Pill className="w-7 h-7" />, label: "كلية الصيدلة", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  { icon: <Calculator className="w-7 h-7" />, label: "كلية الهندسة", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { icon: <Dna className="w-7 h-7" />, label: "طب الأسنان", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { icon: <FlaskConical className="w-7 h-7" />, label: "طب بيطري", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { icon: <Brain className="w-7 h-7" />, label: "الكليات التقنية", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { icon: <BookOpen className="w-7 h-7" />, label: "مواد التخصص", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
];

// ─── Features ─────────────────────────────────
const features = [
  { icon: <Shield className="w-6 h-6" />, title: "شرح المحاضرات", desc: "تبسيط وشرح المحاضرات الجامعية الصعبة بطريقة مفهومة وميسرة." },
  { icon: <Trophy className="w-6 h-6" />, title: "حل الواجبات", desc: "مساعدة الطلاب في حل الواجبات والتقارير والأبحاث الجامعية." },
  { icon: <Zap className="w-6 h-6" />, title: "مراجعة الاختبارات", desc: "جلسات مكثفة للمراجعة قبيل الاختبارات النهائية والنصفية." },
  { icon: <Users className="w-6 h-6" />, title: "مجموعات صغيرة", desc: "تدريس جماعي بمجموعات 3–5 طلاب بأسعار مميزة وجودة فردية." },
];

// ─── Teacher Card ─────────────────────────────
function UniTeacherCard({ t }: { t: (typeof teachers)[0] }) {
  const [showScore, setShowScore] = useState(false);

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.3 }}
      className="group bg-card border border-border hover:border-primary/40 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col"
    >
      {/* Image */}
      <div className="relative h-60 bg-gradient-to-b from-muted/40 to-muted/10 overflow-hidden shrink-0">
        <Image
          src={t.img}
          alt={t.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-70" />
        <div className="absolute top-3 right-3">
          <TierBadge tier={t.tier} size="sm" />
        </div>
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
        <div className="flex items-start gap-3 mb-3">
          <div className="relative w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden shrink-0">
            <Image src={t.img} alt="" fill sizes="40px" className="object-cover" />
          </div>
          <div className="text-right flex-1 min-w-0">
            <h3 className="font-black text-foreground text-sm leading-snug truncate">{t.name}</h3>
            <p className="text-[10px] text-primary font-bold mt-0.5 truncate">{t.role}</p>
          </div>
          <div className="relative shrink-0">
            <button onClick={() => setShowScore(!showScore)} className="cursor-pointer" title="مُتقن سكور">
              <ScoreRing score={t.motqenScore} tier={t.tier} />
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

        <div className="flex flex-wrap gap-1 mb-3 justify-end">
          {t.subjects.slice(0, 4).map((s, i) => (
            <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
              {s}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1 bg-muted/30 rounded-xl p-2 mb-3 text-center">
          <div>
            <div className="text-xs font-black text-foreground flex items-center justify-center gap-0.5">
              {t.rating} <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="text-[8px] text-muted-foreground">تقييم</div>
          </div>
          <div className="border-x border-border">
            <div className="text-xs font-black text-foreground">{t.experienceYears}س</div>
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

        <p className="text-[11px] text-muted-foreground line-clamp-2 text-right mb-4 flex-1">{t.bio}</p>

        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("teacherSelected", { detail: { name: t.name, subject: t.subjects[0] } }));
            document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
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

// ─── Main Page ────────────────────────────────
export default function UniversityPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("الكل");
  const [mode, setMode] = useState("الكل");

  const filtered = useMemo(() => {
    let list = [...universityTeachers];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.name.includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q)) ||
        t.role.includes(q)
      );
    }

    if (subject !== "الكل") {
      list = list.filter((t) =>
        t.subjects.some((s) => s.toLowerCase().includes(subject.toLowerCase()))
      );
    }

    if (mode === "أونلاين") list = list.filter((t) => t.online);
    else if (mode === "أوفلاين") list = list.filter((t) => t.offline);

    return list.sort((a, b) => b.experienceYears - a.experienceYears);
  }, [search, subject, mode]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">

        {/* ── HERO SECTION ── */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-section-alt">
          {/* Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(#2aa9e010_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(42,169,224,0.1),transparent_65%)]" />
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/8 rounded-full blur-[100px] -mr-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/6 rounded-full blur-[100px] -ml-48" />
          </div>

          <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm font-bold mb-8 transition-colors">
              <ArrowRight className="w-4 h-4" />
              العودة للرئيسية
            </Link>

            <div className="text-center max-w-4xl mx-auto">
              <m.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                خدمة طلبة الجامعات
              </m.span>

              <m.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-[1.15] mb-6"
              >
                دروس خصوصية{" "}
                <span className="text-primary relative inline-block">
                  للجامعيين
                  <svg className="absolute -bottom-1 right-0 w-full" viewBox="0 0 280 10" fill="none">
                    <path d="M2 7 C70 1, 210 9, 278 5" stroke="hsl(199,90%,48%)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                  </svg>
                </span>
                <br />
                في جميع الكليات العلمية
              </m.h1>

              <m.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
              >
                نوفر لك أفضل المدرسين المتخصصين في مواد الجامعة — أونلاين وأوفلاين — لمساعدتك في شرح المحاضرات وحل الواجبات والاستعداد للاختبارات.
              </m.p>

              <m.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <button
                  onClick={() => document.getElementById("teachers-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="group relative flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl px-10 py-4 text-base shadow-[0_16px_40px_-8px_rgba(42,169,224,0.45)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <GraduationCap className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">تصفح المدرسين</span>
                </button>
                <button
                  onClick={() => document.getElementById("register")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center justify-center gap-3 border border-primary/30 hover:border-primary/60 hover:bg-primary/6 text-foreground font-black rounded-2xl px-10 py-4 text-base transition-all duration-300 cursor-pointer"
                >
                  <CalendarCheck className="w-5 h-5 text-primary" />
                  احجز جلسة الآن
                </button>
              </m.div>
            </div>
          </div>

          {/* Bottom separator */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        </section>

        {/* ── STATS ── */}
        <section className="py-10 bg-background border-b border-border">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <m.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex flex-col items-center gap-2 p-5 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    {s.icon}
                  </div>
                  <div className="text-2xl font-black text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground text-center">{s.label}</div>
                </m.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SPECIALTIES ── */}
        <section className="py-20 bg-section-alt relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
                الكليات والتخصصات التي{" "}
                <span className="text-primary">نغطيها</span>
              </h2>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                مدرسون متخصصون لكل كلية ومادة — سواء كنت في الطب أو العلوم أو الهندسة أو غيرها
              </p>
            </m.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {specialties.map((s, i) => (
                <m.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${s.bg} ${s.border} cursor-default`}
                >
                  <div className={`${s.color}`}>{s.icon}</div>
                  <span className="text-sm font-black text-foreground text-center">{s.label}</span>
                </m.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW WE HELP ── */}
        <section className="py-20 bg-background">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
                كيف <span className="text-primary">نساعدك</span>؟
              </h2>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                خدمات متكاملة تغطي كل احتياجات الطالب الجامعي
              </p>
            </m.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, i) => (
                <m.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="group flex flex-col gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {f.icon}
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </m.div>
              ))}
            </div>

            {/* Features list */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12 relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 sm:p-10"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-right">
                  <span className="text-[11px] font-black text-primary uppercase tracking-widest">خدمة متميزة</span>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground my-3">
                    لماذا تختار مُتقن للجامعة؟
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    نتفهم أن مرحلة الجامعة مختلفة ومرهقة — لذلك نوفر مدرسين متخصصين في مواد الجامعة تحديداً وليس فقط المناهج المدرسية.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "مدرسون متخصصون في مواد كل كلية",
                    "شرح بالعربي والإنجليزي حسب المنهج",
                    "أونلاين ومنزلي — أنت تختار",
                    "جلسات قصيرة أو طويلة حسب حاجتك",
                    "نتائج مضمونة أو استرداد كامل",
                    "خبرة في جامعة الملك فيصل وغيرها",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-right">
                      <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span className="text-sm font-semibold text-foreground/80 flex-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </m.div>
          </div>
        </section>

        {/* ── TEACHERS SECTION ── */}
        <section id="teachers-section" className="py-20 bg-section-alt relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">

            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
                مدرسو <span className="text-primary">الجامعات</span>
              </h2>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                مدرسون معتمدون بخبرة في تدريس مواد الكليات العلمية
              </p>
            </m.div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-8 justify-center">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو المادة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-card border border-border rounded-xl px-4 py-2.5 pr-10 text-sm text-right placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all w-56"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Subject chips */}
              <div className="flex flex-wrap gap-2 justify-center">
                {SUBJECTS_UNI.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSubject(s)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-black border transition-all cursor-pointer whitespace-nowrap ${
                      subject === s
                        ? "bg-primary text-white border-primary"
                        : "bg-card border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Mode chips */}
              <div className="flex gap-2">
                {MODES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-black border transition-all cursor-pointer whitespace-nowrap ${
                      mode === m
                        ? "bg-primary text-white border-primary"
                        : "bg-card border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Result count */}
            <p className="text-center text-sm text-muted-foreground mb-6">
              <span className="font-black text-primary">{filtered.length}</span> مدرس متاح
            </p>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-24 text-muted-foreground">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-black text-foreground text-lg">لا توجد نتائج مطابقة</p>
                <p className="text-sm mt-2">جرّب تغيير الفلاتر أو البحث بكلمات أخرى</p>
                <button onClick={() => { setSearch(""); setSubject("الكل"); setMode("الكل"); }} className="mt-4 text-primary font-bold text-sm underline cursor-pointer">
                  مسح جميع الفلاتر
                </button>
              </div>
            ) : (
              <m.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filtered.map((t) => (
                    <UniTeacherCard key={t.id} t={t} />
                  ))}
                </AnimatePresence>
              </m.div>
            )}

            {/* Link to all teachers */}
            <m.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <Link
                href="/teachers"
                className="inline-flex items-center gap-2 text-primary font-black text-sm hover:underline transition-all"
              >
                <ChevronLeft className="w-4 h-4 rotate-180" />
                تصفح جميع المدرسين
              </Link>
            </m.div>
          </div>
        </section>

        {/* ── REGISTRATION FORM ── */}
        <RegistrationForm />

      </main>
    </>
  );
}
