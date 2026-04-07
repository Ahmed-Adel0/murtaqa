"use client";

import { motion } from "framer-motion";
import { Laptop, Home, ChartLine, Target, Users, Languages, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const services = [
  {
    title: "دروس منزلية",
    icon: <Home className="w-6 h-6" />,
    desc: "يصل المدرس المعتمد إلى منزلك في الوقت المناسب لك، مع بيئة تعليمية آمنة ومريحة.",
    features: ["مدرس يصل إليك", "جدول مرن حسب رغبتك", "متابعة أسبوعية", "تقارير دورية"],
    color: "primary"
  },
  {
    title: "دروس أونلاين",
    icon: <Laptop className="w-6 h-6" />,
    desc: "تواصل مع أفضل المدرسين عبر تقنيات التعليم الحديثة من راحة منزلك في أي وقت.",
    features: ["فيديو تفاعلي عالي الجودة", "سبورة إلكترونية مشتركة", "تسجيل الحصص", "متاح من أي مكان"],
    color: "primary"
  },
  {
    title: "متابعة أكاديمية",
    icon: <ChartLine className="w-6 h-6" />,
    desc: "برنامج شامل لمتابعة مستوى الطالب وتحديد نقاط القوة والضعف وتطوير خطة تحسين.",
    features: ["تحليل مستوى الطالب", "خطة دراسية مخصصة", "تقارير شهرية", "تواصل مستمر"],
    color: "primary"
  },
  {
    title: "التحضير للاختبارات",
    icon: <Target className="w-6 h-6" />,
    desc: "برامج مكثفة للتحضير لاختبارات القدرات والتحصيل والاختبارات الدولية.",
    features: ["اختبار قياس - القدرات", "نماذج محاكاة حقيقية", "ضمان رفع الدرجة"],
    color: "primary"
  },
  {
    title: "مجموعات صغيرة",
    icon: <Users className="w-6 h-6" />,
    desc: "دروس جماعية بمجموعات صغيرة (3-5 طلاب) بأسعار مميزة وجودة التعليم الفردي.",
    features: ["تفاعل بين الطلاب", "أسعار مخفضة", "تنافس صحي", "حصص منزلية/أونلاين"],
    color: "primary"
  },
  {
    title: "اللغات الأجنبية",
    icon: <Languages className="w-6 h-6" />,
    desc: "تعلم الإنجليزية والفرنسية والألمانية مع مدرسين متخصصين بأساليب حديثة.",
    features: ["جميع المستويات", "محادثة يومية", "تحضير للشهادات"],
    color: "primary"
  }
];

const Services = () => {
  return (
    <section id="services" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 -ml-48" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48" />
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16 sm:mb-24">
          <Badge variant="outline" className="mb-6 border-primary/20 text-primary px-6 py-1.5 rounded-full bg-primary/5 font-bold uppercase tracking-widest text-xs">
            خدماتنا التعليمية
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
             كل ما تحتاجه <br className="hidden sm:block" />
             <span className="text-gradient">للتفوق الدراسي</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            نقدم حلولاً تعليمية ذكية ومبتكرة تضمن تطور مستوى أبنائكم وتحقيق نتائج ملموسة في أسرع وقت.
          </p>
        </div>
 
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((s, i) => (
            <motion.div
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
