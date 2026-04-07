"use client";

import { motion } from "framer-motion";
import { Edit3, Handshake, GraduationCap, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    num: "1",
    title: "سجل بياناتك",
    desc: "املأ النموذج البسيط في دقيقة واحدة لنعرف مستوى ابنك واحتياجاته.",
    icon: <Edit3 className="w-8 h-8" />,
  },
  {
    num: "2",
    title: "نرشح لك المدرس",
    desc: "نختار لك المدرس الأنسب لمستوى ابنك وشخصيته من بين نخبتا المعتمدة.",
    icon: <Handshake className="w-8 h-8" />,
  },
  {
    num: "3",
    title: "ابدأ خلال 24 ساعة",
    desc: "تبدأ أول حصة/تقييم مباشرة لنضع معاً خطة التحسن الفورية.",
    icon: <GraduationCap className="w-8 h-8" />,
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary px-4 py-1">
            <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
            طريقك للنجاح
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
            3 خطوات <span className="text-primary">بسيطة</span> للبدء
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connector lines (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
          
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="relative z-10 bg-background p-5 sm:p-6 rounded-3xl border border-border text-center hover:border-primary transition-colors group"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 sm:mb-5 text-xl sm:text-2xl font-black shadow-xl shadow-primary/20 transition-transform">
                {s.num}
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 sm:mb-5 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">
                {s.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm px-2">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
