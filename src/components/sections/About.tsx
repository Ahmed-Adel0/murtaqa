"use client";

import { m } from "framer-motion";
import {
  ShieldCheck, Users, Trophy, Clock, ArrowLeft,
  Star, Zap, GraduationCap, Heart
} from "lucide-react";

const stats = [
  { value: "+70",   label: "مدرس معتمد",    icon: <GraduationCap className="w-5 h-5" /> },
  { value: "+1200", label: "طالب مستفيد",   icon: <Users className="w-5 h-5" /> },
  { value: "4.9",   label: "تقييم الأهالي", icon: <Star className="w-5 h-5 fill-current" /> },
  { value: "24h",   label: "رد سريع",        icon: <Clock className="w-5 h-5" /> },
];

const values = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "مدرسون معتمدون",
    desc: "كل مدرس يمر بعملية اختيار صارمة تشمل التحقق من المؤهلات والتجربة العملية.",
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "نتائج مضمونة",
    desc: "التزامنا بتحسين مستوى الطالب أو نعيد لك حقك كاملاً — بلا أي تعقيد.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "استجابة فورية",
    desc: "فريقنا متاح على مدار الساعة للرد على استفساراتك وجدولة حصصك في دقائق.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "اهتمام حقيقي",
    desc: "نؤمن أن التعليم رسالة. كل طالب عندنا يحظى باهتمام شخصي وخطة دراسية مخصصة.",
  },
];

const timeline = [
  { year: "التأسيس", label: "انطلقت المنصة بهدف واحد: تعليم عالي الجودة للجميع." },
  { year: "التوسع",  label: "وصلنا إلى أكثر من 15 مدينة في المملكة بفريق متميز." },
  { year: "اليوم",   label: "أكثر من 1200 طالب مستفيد وشركاء نجاح حقيقيون." },
];

const About = () => {
  return (
    <section id="about" className="py-24 md:py-36 bg-section-alt relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-accent/4 rounded-full blur-[120px]" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6">

        {/* ─── Section Header ─── */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            من نحن
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground leading-[1.15] mb-6">
            نصنع جيلاً{" "}
            <span className="relative inline-block text-primary">
              يتفوق
              <svg
                className="absolute -bottom-2 right-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 8 C50 2, 150 12, 198 6"
                  stroke="hsl(199,90%,48%)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            مُتقن أكاديمي منصة سعودية متخصصة في توفير أفضل المدرسين الخصوصيين —
            منزلياً وأونلاين — لجميع المراحل الدراسية.
          </p>
        </m.div>

        {/* ─── Stats Bar ─── */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24"
        >
          {stats.map((s, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative group bg-card border border-border hover:border-primary/40 rounded-2xl p-5 text-center overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {s.icon}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
              </div>
            </m.div>
          ))}
        </m.div>

        {/* ─── Main Grid ─── */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">

          {/* Left: Visual Timeline */}
          <m.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Big decorative quote */}
            <div className="absolute -top-6 -right-4 text-[120px] leading-none text-primary/8 font-black select-none pointer-events-none">"</div>

            {/* Story Card */}
            <div className="relative bg-card border border-border rounded-3xl p-8 sm:p-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/8 rounded-full blur-3xl" />

              <h3 className="text-xl sm:text-2xl font-black text-foreground mb-4 relative z-10">
                قصتنا — لماذا تأسسنا؟
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base relative z-10 mb-8">
                لاحظنا معاناة حقيقية لدى أولياء الأمور في العثور على مدرس موثوق يصل إليهم، 
                ويتابع ابنهم بانتظام، ويُثبت نتائج ملموسة. قررنا أن نحل هذه المشكلة بمنصة
                تجمع أفضل الكفاءات التعليمية في مكان واحد موثوق.
              </p>

              {/* Timeline */}
              <div className="relative space-y-6 z-10">
                <div className="absolute right-[11px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary via-primary/40 to-transparent" />
                {timeline.map((t, i) => (
                  <m.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.12 }}
                    className="flex items-start gap-4 pr-7 relative"
                  >
                    <div className="absolute right-0 top-1 w-6 h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-black text-primary uppercase tracking-widest">{t.year}</span>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{t.label}</p>
                    </div>
                  </m.div>
                ))}
              </div>
            </div>
          </m.div>

          {/* Right: Values */}
          <m.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-5"
          >
            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-3 text-right">
                ما يميّزنا عن الجميع
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base text-right leading-relaxed">
                أربعة مبادئ راسخة تجعل تجربتك مع مُتقن فريدة من نوعها.
              </p>
            </div>

            {values.map((v, i) => (
              <m.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className="group flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-card/80 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 cursor-default"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                  {v.icon}
                </div>
                {/* Text */}
                <div className="text-right flex-1">
                  <h4 className="font-black text-foreground mb-1">{v.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </m.div>
            ))}
          </m.div>
        </div>

        {/* ─── Bottom CTA Banner ─── */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(42,169,224,0.12),transparent_60%)]" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 px-8 sm:px-12 py-10">
            <div className="text-center sm:text-right">
              <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-2">جاهز للبدء؟</p>
              <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
                اضمن مستقبل ابنك اليوم
              </h3>
              <p className="text-muted-foreground text-sm">
                انضم لأكثر من <span className="text-foreground font-bold">1200 أسرة</span> يثقون بمُتقن أكاديمي.
              </p>
            </div>

            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("teacherSelected", { detail: { name: "", subject: "" } }));
                document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl px-8 py-4 shadow-lg shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              احجز جلستك الأولى
            </button>
          </div>
        </m.div>

      </div>
    </section>
  );
};

export default About;
