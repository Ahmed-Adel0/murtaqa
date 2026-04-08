"use client";

import { m } from "framer-motion";
import { Laptop, Home, ChartLine, Target, Users, Languages, Check, GraduationCap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const services = [
  {
    title: "دروس منزلية",
    icon: <Home className="w-6 h-6" />,
    desc: "يصل المدرس المعتمد إلى منزلك في الوقت المناسب لك، مع بيئة تعليمية آمنة ومريحة.",
    features: ["مدرس يصل إليك", "جدول مرن حسب رغبتك", "متابعة أسبوعية", "تقارير دورية"],
    color: "primary",
    badge: null,
  },
  {
    title: "دروس أونلاين",
    icon: <Laptop className="w-6 h-6" />,
    desc: "تواصل مع أفضل المدرسين عبر تقنيات التعليم الحديثة من راحة منزلك في أي وقت.",
    features: ["فيديو تفاعلي عالي الجودة", "سبورة إلكترونية مشتركة", "تسجيل الحصص", "متاح من أي مكان"],
    color: "primary",
    badge: null,
  },
  {
    title: "متابعة أكاديمية",
    icon: <ChartLine className="w-6 h-6" />,
    desc: "برنامج شامل لمتابعة مستوى الطالب وتحديد نقاط القوة والضعف وتطوير خطة تحسين.",
    features: ["تحليل مستوى الطالب", "خطة دراسية مخصصة", "تقارير شهرية", "تواصل مستمر"],
    color: "primary",
    badge: null,
  },
  {
    title: "التحضير للاختبارات",
    icon: <Target className="w-6 h-6" />,
    desc: "برامج مكثفة للتحضير لاختبارات القدرات والتحصيل والاختبارات الدولية.",
    features: ["اختبار قياس - القدرات", "نماذج محاكاة حقيقية", "ضمان رفع الدرجة"],
    color: "primary",
    badge: null,
  },
  {
    title: "مجموعات صغيرة",
    icon: <Users className="w-6 h-6" />,
    desc: "دروس جماعية بمجموعات صغيرة (3-5 طلاب) بأسعار مميزة وجودة التعليم الفردي.",
    features: ["تفاعل بين الطلاب", "أسعار مخفضة", "تنافس صحي", "حصص منزلية/أونلاين"],
    color: "primary",
    badge: null,
  },
  {
    title: "اللغات الأجنبية",
    icon: <Languages className="w-6 h-6" />,
    desc: "تعلم الإنجليزية والفرنسية والألمانية مع مدرسين متخصصين بأساليب حديثة.",
    features: ["جميع المستويات", "محادثة يومية", "تحضير للشهادات"],
    color: "primary",
    badge: null,
  },
];

// University & Girls featured services
const featuredServices = [
  {
    id: "university",
    icon: <GraduationCap className="w-8 h-8" />,
    title: "طلبة الجامعات",
    subtitle: "أونلاين وأوفلاين",
    desc: "نخصص مدرسين متخصصين لمساعدة طلاب الجامعات في مواد التخصص، مع خيار الحضور لمقر الطالب أو عبر الفيديو التفاعلي.",
    features: [
      "تدريس مواد الكليات التخصصية",
      "شرح المحاضرات وحل الواجبات",
      "مراجعة ما قبل الاختبارات النهائية",
      "أونلاين من أي مكان • أوفلاين في منزلك",
    ],
    gradient: "from-cyan-500/15 via-primary/8 to-transparent",
    borderColor: "border-primary/30",
    badgeText: "جديد",
    badgeClass: "bg-primary/20 text-primary border-primary/30",
  },
  {
    id: "girls",
    icon: <Shield className="w-8 h-8" />,
    title: "دروس البنات أونلاين",
    subtitle: "بيئة آمنة ومتخصصة",
    desc: "بيئة تعليمية خاصة ومخصصة للطالبات بجميع المراحل، مع مدرسات معتمدات وجلسات فيديو مشفرة آمنة 100%.",
    features: [
      "مدرسات متخصصات ومعتمدات",
      "خصوصية تامة وبيئة تعليمية آمنة",
      "جميع المراحل: ابتدائي → جامعي",
      "جلسات فيديو مشفرة ومسجلة",
    ],
    gradient: "from-rose-500/10 via-pink-500/5 to-transparent",
    borderColor: "border-rose-500/25",
    badgeText: "مميز",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 -ml-48" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48" />
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16 sm:mb-24 px-4 sm:px-0">
          <Badge variant="outline" className="mb-6 sm:mb-8 border-primary/20 text-primary px-6 py-2 rounded-full bg-primary/5 font-bold uppercase tracking-widest text-xs sm:text-sm">
            خدماتنا التعليمية
          </Badge>
          <h2 className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-black text-foreground mb-8 leading-[1.15]">
             كل ما تحتاجه <br className="hidden sm:block" />
             <span className="text-gradient">للتفوق الدراسي</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            نقدم حلولاً تعليمية ذكية ومبتكرة تضمن تطور مستوى أبنائكم وتحقيق نتائج ملموسة في أسرع وقت.
          </p>
        </div>

        {/* ===== FEATURED: University & Girls ===== */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {featuredServices.map((s, i) => (
            <m.div
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              viewport={{ once: true }}
              className={`group relative p-7 rounded-3xl bg-gradient-to-br ${s.gradient} border ${s.borderColor} hover:shadow-2xl hover:shadow-primary/8 transition-all duration-500 overflow-hidden`}
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

              {/* Badge */}
              <div className="absolute top-5 left-5">
                <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${s.badgeClass}`}>
                  {s.badgeText}
                </span>
              </div>

              <div className="relative z-10">
                {/* Icon + Title */}
                <div className="flex items-start gap-4 mb-5 mt-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 shadow-lg">
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground leading-tight">{s.title}</h3>
                    <p className="text-xs text-primary font-bold mt-0.5 opacity-80">{s.subtitle}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{s.desc}</p>

                <ul className="space-y-2.5">
                  {s.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => document.getElementById("register")?.scrollIntoView({ behavior: "smooth" })}
                  className="mt-6 w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/25 hover:border-primary rounded-xl py-3 text-sm font-black transition-all duration-300 cursor-pointer"
                >
                  احجز جلسة الآن →
                </button>
              </div>
            </m.div>
          ))}
        </div>

        {/* ===== Regular Services Grid ===== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((s, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative p-6 sm:p-8 rounded-3xl bg-card border border-border hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full overflow-hidden"
            >
              {/* Card Hover Effect: Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg shadow-primary/10">
                  {s.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3 leading-tight">{s.title}</h3>
                <p className="text-muted-foreground mb-6 text-xs sm:text-sm leading-relaxed">
                  {s.desc}
                </p>
                <ul className="space-y-3 mt-auto">
                  {s.features.map((f, j) => (
                    <li key={j} className="flex items-center justify-start gap-2 text-xs sm:text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors text-right">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span className="flex-1">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
