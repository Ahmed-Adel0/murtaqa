"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Star, CalendarCheck, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const teachers = [
  {
    name: "أحمد هاشم سباق",
    role: "مدرس أساسي — ابتدائي",
    img: "/assets/imgs/ahmed-hashem.jpg",
    subjects: ["لغتي", "رياضيات", "تأسيس"],
    rating: "5.0",
    students: "120+",
    bio: "يركّز على تعليم الأطفال بطريقة تفاعلية تضمن الفهم العميق، مما يبني أساساً قويًا في القراءة والكتابة والحساب.",
    badge: " مدرس تأسيس",
    color: "primary"
  },
  {
    name: "عبدالناصر محمد إبراهيم",
    role: "خبير منهج سعودي — 14 عاماً",
    img: "/assets/imgs/abdelnaser.jpg",
    subjects: ["قدرات", "تحصيلي", "ثانوي"],
    rating: "4.9",
    students: "14 سنة خبرة",
    bio: "يساعد الطلاب على تحقيق نتائج متميزة في القدرات والتحصيلي باستراتيجيات ذكية مجربة على مدى 14 عاماً.",
    badge: "خبير قدرات",
    color: "primary"
  },
  {
    name: "أسامة علي عبدالجواد",
    role: "علوم وأحياء وقرآن كريم",
    img: "/assets/imgs/osama ali.jpg",
    subjects: ["علوم", "أحياء", "قرآن", "تجويد"],
    rating: "4.8",
    students: "5+ سنوات",
    bio: "يجمع بين العلوم الأكاديمية والتربوية، مع خبرة في تحفيظ القرآن والتجويد بأسلوب شيّق يحبب الطالب في العلم والدين.",
    badge: "محفظ قرآن",
    color: "primary"
  },
  {
    name: "الأستاذ بدر فايد",
    role: "مدرس اللغة الإنجليزية | مناهج متقدمة",
    img: "/assets/imgs/dr.badr.jpg",
    subjects: ["تأسيس لغة", "ماجستير ودكتوراه"],
    rating: "5.0",
    students: "22+ سنة خبرة",
    bio: "يمتلك خبرة طويلة في تدريس اللغة الإنجليزية وفق أحدث المناهج، ويركّز على بناء أساس قوي للطالب.",
    badge: "خبير إنجليزي",
    color: "primary"
  },
  {
    name: "أحمد عطا صابر",
    role: "معلم خبير لغة إنجليزية + تأسيس شامل",
    img: "/assets/imgs/احمد عطا صابر.jpg",
    subjects: ["إنجليزي", "رياضيات", "علوم", "تأسيس"],
    rating: "5.0",
    students: "25+ سنة خبرة",
    bio: "يتميز بقدرته على تأسيس الطلاب من الصفر وحتى الاحتراف، مع تبسيط المناهج بطريقة تناسب الجميع.",
    badge: "خبير تأسيس",
    color: "primary"
  },
  {
    name: "محمد أحمد سعد",
    role: "متخصص قدرات + تحصيلي + علوم",
    img: "/assets/imgs/محمد  احمد سعد.jpg",
    subjects: ["قدرات", "تحصيلي", "علوم"],
    rating: "4.9",
    students: "5 سنوات خبرة",
    bio: "يساعد الطلاب على تحسين نتائجهم من خلال التدريب المكثف على نماذج الاختبارات الحديثة.",
    badge: "خبير قدرات",
    color: "primary"
  },
  {
    name: "هاشم السواق",
    role: "متخصص في مادة الكيمياء",
    img: "/assets/imgs/هاشم السواق.jpg",
    subjects: ["كيمياء ثانوي", "تبسيط مفاهيم"],
    rating: "4.8",
    students: "3 سنوات خبرة",
    bio: "يقدّم شرحًا مبسطًا لمادة الكيمياء يساعد الطلاب على فهم الأساسيات بسهولة وتحقيق نتائج أفضل.",
    badge: "مدرس كيمياء",
    color: "primary"
  },
  {
    name: "محمد علي محجوب",
    role: "معلم خبير لغة إنجليزية",
    img: "/assets/imgs/محمد علي محجوب.jpeg",
    subjects: ["مناهج دولية", "جامعات", "محادثة"],
    rating: "5.0",
    students: "20+ سنة خبرة",
    bio: "يتميز بخبرة طويلة في تعليم اللغة إنجليزية لمختلف الأعمار، ويعتمد على أساليب تفاعلية حديثة.",
    badge: "خبير إنجليزي",
    color: "primary"
  },
  {
    name: "محمود مسلم",
    role: "معلم أحياء للمرحلة الثانوية",
    img: "/assets/imgs/محمود مسلم.jpeg",
    subjects: ["أحياء", "تحصيلي", "علوم"],
    rating: "4.9",
    students: "3 سنوات خبرة",
    bio: "حاصل على الرخصة المهنية التعليمية تخصص الأحياء، يتميز بمستوى ممتاز في المادة العلمية وشرح التحصيلي لطلاب الثانوي.",
    badge: "خبير أحياء",
    color: "primary"
  },
  {
    name: "ياسر صابر",
    role: "معلم متميز",
    img: "/assets/imgs/ياسر صابر.jpeg",
    subjects: ["تأسيس", "متابعة"],
    rating: "4.8",
    students: "خبرة واسعة",
    bio: "مدرس خبير يركز على تحسين مستوى الطلاب وتطوير مهاراتهم الدراسية بشكل ملحوظ.",
    badge: "معلم متميز",
    color: "primary"
  },
  {
    name: "فتوح قطب البسيوني",
    role: "معلم خبير",
    img: "/assets/imgs/فتوح قطب البسيوني.jpg",
    subjects: ["لغة عربية", "تأسيس"],
    rating: "5.0",
    students: "خبرة طويلة",
    bio: "معلم قدير يمتلك سنوات طويلة من الخبرة في التعليم وبناء مهارات الطلاب الأساسية.",
    badge: "خبير تعليمي",
    color: "primary"
  }
];

const Teachers = () => {
  const [activeFilter, setActiveFilter] = useState("الكل");
  const filters = ["الكل", "تأسيس", "إنجليزي", "قدرات وتحصيلي", "كيمياء وعلوم"];

  const filteredTeachers = teachers.filter((t) => {
    if (activeFilter === "الكل") return true;
    if (activeFilter === "قدرات وتحصيلي") return t.subjects.some(s => s.includes("قدرات") || s.includes("تحصيلي"));
    if (activeFilter === "إنجليزي") return t.subjects.some(s => s.includes("إنجليزي") || s.includes("لغة"));
    if (activeFilter === "تأسيس") return t.subjects.some(s => s.includes("تأسيس") || s.includes("لغتي"));
    if (activeFilter === "كيمياء وعلوم") return t.subjects.some(s => s.includes("علوم") || s.includes("كيمياء") || s.includes("أحياء"));
    return true;
  });

  return (
    <section id="teachers" className="py-16 md:py-24 relative overflow-hidden bg-background">
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-section-alt to-transparent" />
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary px-4 py-1">
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
            نخبة المدرسين
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
            تعرف على <span className="text-primary">أفضل المدرسين</span> بتبوك
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 sm:mb-12">
            فريق من المدرسين المؤهلين والمعتمدين — كل واحد منهم قصة نجاح بحد ذاتها
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer border ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredTeachers.map((t, i) => (
              <motion.div
                layout
                key={t.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
              >
              <div className="relative h-72 overflow-hidden bg-gradient-to-b from-muted/40 to-muted/20">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-full h-full object-contain object-bottom"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1000";
                    e.currentTarget.className = "w-full h-full object-cover";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary/90 backdrop-blur-md border-none px-3 py-1 text-sm font-bold shadow-lg">
                    {t.badge}
                  </Badge>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full border-2 border-primary/20 overflow-hidden shrink-0">
                    <img src={t.img} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-lg text-foreground leading-tight">{t.name}</h4>
                    <span className="text-[10px] text-primary font-bold">{t.role}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 justify-end">
                  {t.subjects.map((s, j) => (
                    <span key={j} className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-muted text-muted-foreground border border-border">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 border-y border-border py-3 mb-4 text-center">
                  <div>
                    <div className="text-xs font-black flex items-center justify-center gap-1">
                      {t.rating} <Star className="w-2.5 h-2.5 fill-accent text-accent" />
                    </div>
                    <div className="text-[9px] text-muted-foreground uppercase">التقييم</div>
                  </div>
                  <div className="border-x border-border">
                    <div className="text-xs font-black">{t.students}</div>
                    <div className="text-[9px] text-muted-foreground uppercase">الخبرة</div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-primary">★★★★★</div>
                    <div className="text-[9px] text-muted-foreground uppercase">رضا الأهل</div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-6 line-clamp-2 min-h-[32px] text-right">
                  {t.bio}
                </p>

                <Button 
                  onClick={() => { 
                    window.history.pushState(null, "", `/?teacher=${encodeURIComponent(t.name)}#register`); 
                    window.dispatchEvent(new CustomEvent('teacherSelected', { 
                      detail: { name: t.name, subject: t.subjects[0] } 
                    }));
                    document.getElementById("register")?.scrollIntoView({ behavior: "smooth" }); 
                  }}
                  className="w-full rounded-xl py-5 gap-2 font-bold shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform text-sm cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4" />
                  احجز معه الآن
                </Button>
              </div>
            </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-3xl bg-section-alt border border-border flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="text-center md:text-right relative z-10">
             <div className="text-lg sm:text-xl font-black text-foreground mb-1">هل تريد مدرساً بمواصفات معينة؟</div>
             <div className="text-sm sm:text-base text-muted-foreground">أخبرنا واحنا نلاقيك المدرس المناسب خلال 24 ساعة</div>
          </div>
          <Button 
            onClick={() => { document.getElementById("register")?.scrollIntoView({ behavior: "smooth" }); }}
            size="lg" 
            className="rounded-full px-8 sm:px-10 py-5 sm:py-6 font-black text-base sm:text-lg bg-foreground text-background hover:bg-foreground/90 relative z-10 w-full md:w-auto cursor-pointer"
          >
            ساعدني أختار المدرس
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Teachers;
