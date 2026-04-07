"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-section-alt relative overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Visual/Illustration Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🏠", label: "منزلي", color: "bg-primary/20 text-primary border-primary/20" },
                { icon: "💻", label: "أونلاين", color: "bg-primary/10 text-primary/80 border-primary/10" },
                { icon: "📚", label: "جميع المواد", color: "bg-primary/10 text-primary border-primary/10" },
                { icon: "🏆", label: "نتائج مضمونة", color: "bg-primary/20 text-primary/90 border-primary/20" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-8 rounded-3xl ${item.color} flex flex-col items-center justify-center gap-3 backdrop-blur-sm border`}
                >
                  <span className="text-4xl">{item.icon}</span>
                  <span className="font-bold text-lg">{item.label}</span>
                </motion.div>
              ))}
            </div>
            

          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-right mt-12 lg:mt-0"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4 font-bold text-xs sm:text-sm">
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              من نحن
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4 sm:mb-6 leading-tight">
              منصة تعليمية تضع <span className="text-primary underline decoration-accent decoration-[3px] sm:decoration-4 underline-offset-4 sm:underline-offset-8">نجاح أبنائك</span> أولى أولوياتها
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
              بيبو كاديمي منصة متخصصة في توفير دروس خصوصية منزلية وأونلاين عالية الجودة، تأسست بهدف سد الفجوة بين المدرسين المؤهلين وأولياء الأمور الباحثين عن تميز أكاديمي لأبنائهم.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
              <div className="p-6 rounded-2xl bg-muted/30 border border-border">
                <h5 className="flex items-center gap-2 text-foreground font-black mb-4 justify-end">
                  المشكلة
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                </h5>
                <ul className="space-y-2 text-sm text-muted-foreground mr-2">
                  <li className="flex items-center justify-start gap-2"><span className="text-muted-foreground">•</span> <span className="flex-1 text-right">صعوبة إيجاد مدرسين موثوقين</span></li>
                  <li className="flex items-center justify-start gap-2"><span className="text-muted-foreground">•</span> <span className="flex-1 text-right">عدم الانتظام والمتابعة</span></li>
                  <li className="flex items-center justify-start gap-2"><span className="text-muted-foreground">•</span> <span className="flex-1 text-right">غياب تقارير تقدم الطالب</span></li>
                </ul>
              </div>
              
              <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20">
                <h5 className="flex items-center gap-2 text-primary font-black mb-4 justify-end">
                  حلنا
                  <CheckCircle2 className="w-5 h-5" />
                </h5>
                <ul className="space-y-2 text-sm text-foreground/80 mr-2">
                  <li className="flex items-center justify-start gap-2"><span className="text-primary">•</span> <span className="flex-1 text-right">مدرسون معتمدون وموثوقون</span></li>
                  <li className="flex items-center justify-start gap-2"><span className="text-primary">•</span> <span className="flex-1 text-right">متابعة أسبوعية مستمرة</span></li>
                  <li className="flex items-center justify-start gap-2"><span className="text-primary">•</span> <span className="flex-1 text-right">تقارير دورية لولي الأمر</span></li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={() => { 
                window.dispatchEvent(new CustomEvent('teacherSelected', { detail: { name: '', subject: '' } }));
                document.getElementById("register")?.scrollIntoView({ behavior: "smooth" }); 
              }}
              size="lg" 
              variant="secondary" 
              className="rounded-full px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base gap-2 font-bold group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-2" />
              اضمن مستقبل ابنك الآن
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
