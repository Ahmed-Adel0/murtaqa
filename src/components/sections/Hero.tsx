"use client";

import { m } from "framer-motion";
import Image from "next/image";
import { CalendarCheck, GraduationCap, Star, ShieldCheck, MapPin, Users } from "lucide-react";


const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-28 sm:pt-32 lg:pt-44 pb-16 overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 -z-10">
        {/* Grid dots */}
        <div className="absolute inset-0 bg-[radial-gradient(#2aa9e015_1px,transparent_1px)] [background-size:28px_28px] opacity-60" />
        {/* Radial hero glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(42,169,224,0.08),transparent_65%)]" />
        {/* Side orbs */}
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[120px] -mr-40 animate-float-slow" />
        <div className="absolute bottom-1/4 left-0 w-[350px] h-[350px] bg-accent/6 rounded-full blur-[100px] -ml-32 animate-float-reverse" />
        {/* Bottom separator */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Left: Text Content ── */}
          <m.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="text-right order-2 lg:order-1"
          >


            {/* Headline */}
            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-black text-foreground leading-[1.15] mb-6"
            >
              درّس أبناءك مع{" "}
              <span className="relative inline-block text-primary">
                أفضل المدرسين
                <svg
                  className="absolute -bottom-1 right-0 w-full"
                  viewBox="0 0 300 10"
                  fill="none"
                >
                  <path
                    d="M2 7 C70 1, 230 9, 298 5"
                    stroke="hsl(199,90%,48%)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </span>{" "}
              <br className="hidden sm:block" />
              الخصوصيين في{" "}
              <span
                className="relative inline-block"
                style={{
                  background: "linear-gradient(135deg, hsl(199,90%,55%), hsl(199,80%,70%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                المملكة
              </span>
            </m.h1>

            {/* Sub-headline */}
            <m.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.55 }}
              className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 max-w-lg mr-0 ml-auto lg:ml-0"
            >
              نضمن لك أفضل الكوادر التعليمية المعتمدة — منزلياً أو أونلاين — لمتابعة
              أكاديمية مستمرة ونتائج مضمونة{" "}
              <strong className="text-foreground">100%</strong>.
            </m.p>

            {/* CTA Buttons */}
            <m.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-8 mb-10"
            >
              {/* Primary CTA */}
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("teacherSelected", { detail: { name: "", subject: "" } }));
                  document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group relative flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl px-10 py-4 text-base shadow-[0_16px_40px_-8px_rgba(42,169,224,0.45)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden cursor-pointer flex-1 sm:flex-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <CalendarCheck className="w-5 h-5 relative z-10 shrink-0" />
                <span className="relative z-10">اضمن مستقبل ابنك</span>
              </button>

              {/* Secondary CTA */}
              <button
                onClick={() => document.getElementById("teachers")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center justify-center gap-3 bg-transparent border border-primary/30 hover:border-primary/60 hover:bg-primary/6 text-foreground font-black rounded-2xl px-10 py-4 text-base transition-all duration-300 cursor-pointer flex-1 sm:flex-none"
              >
                <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                تصفح المدرسين
              </button>
            </m.div>

          </m.div>

          {/* ── Right: Visual ── */}
          <m.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-[420px] order-1 lg:order-2"
          >
            {/* ── Main card ── */}
            <div className="relative rounded-3xl overflow-hidden border border-primary/20 shadow-[0_32px_80px_-12px_rgba(42,169,224,0.25)]">

              {/* Card gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/60 to-accent/5" />

              {/* Diagonal decorative stripes */}
              <div className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: "repeating-linear-gradient(135deg, hsl(199,90%,55%) 0px, hsl(199,90%,55%) 1px, transparent 1px, transparent 22px)"
                }}
              />

              {/* Top glowing bar */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

              {/* Corner accent — top-right */}
              <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-primary/10 blur-2xl" />
              {/* Corner accent — bottom-left */}
              <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full bg-accent/10 blur-2xl" />

              {/* Image */}
              <m.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                className="relative z-10 flex justify-center items-end pt-4 px-4"
              >
                <Image
                  src="/logos/heroo-Photoroom.png"
                  alt="عائلة سعيدة مع بيبوكاديمي"
                  width={600}
                  height={640}
                  priority
                  className="w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[320px] h-auto max-h-[360px] lg:max-h-[400px] object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
                />
              </m.div>

              {/* Bottom platform band */}
              <div className="relative z-10 px-5 py-4 border-t border-primary/10 bg-primary/5 backdrop-blur-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-muted-foreground font-medium">متاح الآن للحجز</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-xs font-black text-foreground mr-1">4.9</span>
                </div>
              </div>
            </div>

            {/* Floating card — top-right: Trusted */}
            <m.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="absolute -top-5 -right-4 sm:-right-8 z-20 flex items-center gap-3 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground font-medium">مدرسون موثوقون</div>
                <div className="text-sm font-black text-foreground">+70 مدرس</div>
              </div>
            </m.div>

            {/* Floating card — mid-left: Cities */}
            <m.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.8 }}
              className="absolute top-[38%] -left-4 sm:-left-10 z-20 flex items-center gap-3 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl"
            >
              <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground font-medium">متاح في</div>
                <div className="text-sm font-black text-foreground">كل المدن</div>
              </div>
            </m.div>

            {/* Floating card — bottom-right: Users */}
            <m.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1.2 }}
              className="absolute -bottom-5 -right-4 sm:-right-8 z-20 flex items-center gap-3 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground font-medium">أسر راضية</div>
                <div className="text-sm font-black text-foreground">+200 أسرة</div>
              </div>
            </m.div>

            {/* Outer ambient glow */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/6 blur-3xl" />
          </m.div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer opacity-0 lg:opacity-100 group"
        onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/40 group-hover:text-primary/70 transition-colors">
          اكتشف المزيد
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-primary/40 to-transparent animate-bounce" />
      </div>
    </section>
  );
};

export default Hero;
