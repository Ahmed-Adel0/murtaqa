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
            className="relative mx-auto w-full max-w-[480px] order-1 lg:order-2"
          >
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 rounded-full bg-primary/6 blur-3xl scale-110" />

            {/* Rotating decorative rings */}
            <div className="absolute inset-[5%] rounded-full border border-primary/10 animate-[spin_50s_linear_infinite]" />
            <div className="absolute inset-[12%] rounded-full border border-dashed border-accent/10 animate-[spin_30s_linear_infinite_reverse]" />

            {/* Glowing base circle */}
            <div className="relative mx-auto w-[85%] aspect-square rounded-full bg-gradient-to-br from-primary/18 via-primary/6 to-transparent border border-primary/15 shadow-[0_0_80px_rgba(42,169,224,0.12)] flex items-end justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(42,169,224,0.15),transparent_60%)]" />
              <m.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                className="relative z-10 w-full flex justify-center"
              >
                <Image
                  src="/assets/imgs/male-Photoroom.png"
                  alt="مُتقن أكاديمي"
                  width={520}
                  height={560}
                  priority
                  className="w-auto h-auto max-h-[340px] sm:max-h-[420px] lg:max-h-[500px] object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                />
              </m.div>
            </div>

            {/* Floating card — top right: Rating */}
            <m.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="absolute top-[8%] -right-4 sm:-right-8 z-20 flex items-center gap-3 bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl"
            >
              <div className="w-9 h-9 rounded-xl bg-yellow-400/15 flex items-center justify-center text-yellow-400 shrink-0">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground font-medium">تقييم ممتاز</div>
                <div className="text-sm font-black text-foreground">4.9 / 5.0</div>
              </div>
            </m.div>

            {/* Floating card — bottom left: Trusted */}
            <m.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.8 }}
              className="absolute bottom-[14%] -left-4 sm:-left-10 z-20 flex items-center gap-3 bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground font-medium">مدرسون موثوقون</div>
                <div className="text-sm font-black text-foreground">+70 مدرس</div>
              </div>
            </m.div>

            {/* Floating card — top left: Cities */}
            <m.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1.2 }}
              className="absolute top-[30%] -left-2 sm:-left-6 z-20 flex items-center gap-3 bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2.5 shadow-2xl"
            >
              <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="text-[9px] text-muted-foreground">متاح في</div>
                <div className="text-xs font-black text-foreground">كل المدن</div>
              </div>
            </m.div>

            {/* Bottom glow */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-8 bg-primary/20 blur-2xl" />
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
