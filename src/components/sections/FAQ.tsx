"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircleQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    question: "كيف يمكنني اختيار المدرس المناسب لابني؟",
    answer: "نحن نساعدك في اختيار المدرس الأنسب بناءً على المستوى الأكاديمي والاحتياجات الخاصة بالطالب، وذلك بعد قيامك بتعبئة نموذج التسجيل أو إجراء تقييم المستوى المجاني."
  },
  {
    question: "هل تقدمون دروساً حضورية في المنزل أم أونلاين؟",
    answer: "نقدم لك الخيارين! تتوفر دروس منزلية مع أفضل المدرسين داخل تبوك، بالإضافة إلى دروس أونلاين تفاعلية عالية الجودة لجميع مناطق المملكة."
  },
  {
    question: "متى يمكنني ملاحظة التحسن في مستوى الطالب؟",
    answer: "نعتمد على خطة أكاديمية مخصصة ومتابعة دقيقة، وقد أظهر أكثر من 95% من طلابنا تحسناً ملموساً وارتفاعاً في الدرجات خلال أول 30 يوماً من المتابعة المستمرة."
  },
  {
    question: "هل جميع المدرسين معتمدون ومؤهلون؟",
    answer: "بالتأكيد. يخضع جميع المدرسين في مرتقى أكاديمي لعملية اختيار دقيقة وصارمة، وهم من ذوي الخبرات الطويلة والمعتمدين أكاديمياً لضمان تقديم أعلى مستويات الجودة التعليمية."
  },
  {
    question: "ما هي طرق وآليات الدفع المتاحة؟",
    answer: "نوفر باقات تعليمية متنوعة تناسب مختلف الاحتياجات بأسعار تنافسية وخيارات دفع مرنة. يمكنك التواصل معنا عبر الواتساب لمناقشة التفاصيل واختيار الباقة الأنسب لك."
  }
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <section id="faq" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_50%_50%,rgba(199,90,48,0.03),transparent_60%)] -z-10" />

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary px-4 py-1.5 rounded-full bg-primary/5 font-bold uppercase tracking-widest text-xs">
            <MessageCircleQuestion className="w-3.5 h-3.5 mr-2 inline-block -mt-0.5" />
            الأسئلة الشائعة
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight">
            كل ما يدور في <span className="text-primary">ذهنك</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            جمعنا لك إجابات لأكثر الأسئلة التي يطرحها أولياء الأمور لتكون على دراية تامة بكل خطواتنا.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isActive = activeIndex === index;

            return (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${isActive ? 'bg-card border-primary/30 shadow-[0_10px_30px_-15px_rgba(199,90,48,0.2)]' : 'bg-transparent border-border hover:border-primary/20'}`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-right focus:outline-none"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                      <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <span className={`font-black text-sm md:text-base leading-relaxed transition-colors ${isActive ? 'text-foreground' : 'text-foreground/80'}`}>
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${isActive ? 'rotate-180 text-primary' : ''}`} />
                </button>

                <AnimatePresence>
                  {isActive && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 md:p-6 pt-0 border-t border-border mt-2 text-muted-foreground text-xs md:text-sm leading-relaxed text-right pr-[4.5rem]">
                        {faq.answer}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
