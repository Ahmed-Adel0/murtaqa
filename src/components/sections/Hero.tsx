"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CalendarCheck, GraduationCap, Star, Clock } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center pt-40 pb-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(195,90,40,0.05),transparent_50%)]" />
        <div className="absolute top-1/4 right-0 w-72 h-72 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[100px] -mr-32 md:-mr-48" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 md:w-96 md:h-96 bg-accent/10 rounded-full blur-[100px] -ml-32 md:-ml-48" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-right"
          >


            <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-black text-foreground leading-[1.2] mb-4 sm:mb-6">
              درس أبنائك مع أفضل المدرسين الخصوصيين في السعودية
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto lg:ml-auto lg:mr-0 text-center lg:text-right">
              نحن نضمن لك أفضل الكوادر التعليمية المعتمدة لمتابعة أكاديمية مستمرة ونتائج مضمونة 100%.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 justify-center lg:justify-end">
              <Button 
                onClick={() => { 
                  window.dispatchEvent(new CustomEvent('teacherSelected', { detail: { name: '', subject: '' } }));
                  document.getElementById("register")?.scrollIntoView({ behavior: "smooth" }); 
                }}
                size="lg" 
                className="group relative rounded-full px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-black bg-primary hover:bg-primary/90 shadow-[0_20px_50px_-15px_rgba(199,90,48,0.4)] transition-all hover:translate-y-[-2px] active:translate-y-[0px] overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-transform" />
                <CalendarCheck className="ml-2 w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
                <span className="relative z-10">اضمن مستقبل ابنك الآن</span>
              </Button>
              <Button 
                onClick={() => { document.getElementById("teachers")?.scrollIntoView({ behavior: "smooth" }); }}
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-bold border-primary/30 text-foreground hover:bg-primary/5 hover:border-primary cursor-pointer"
              >
                <GraduationCap className="ml-2 w-5 h-5 sm:w-6 sm:h-6" />
                تصفح المدرسين
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-foreground">+70</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-1">مدرس خبير</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="text-2xl sm:text-3xl font-black text-foreground">+1200</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-1">طالب مستفيد</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-foreground">4.9</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
                  تقييم الأهالي <Star className="w-3 h-3 fill-accent text-accent" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block mx-auto w-full max-w-lg"
          >
            <div className="relative z-10 p-4">
              {/* Main Circular Base */}
              <div className="absolute w-[85%] h-[85%] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full border border-primary/10 shadow-[0_0_40px_rgba(199,90,48,0.1)] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(199,90,48,0.15),transparent_70%)]" />
              </div>
              
              {/* Rotating Rings */}
              <div className="absolute w-[95%] h-[95%] border border-primary/5 rounded-full animate-[spin_30s_linear_infinite]" />
              <div className="absolute w-[75%] h-[75%] border border-accent/10 rounded-full animate-[spin_20s_linear_infinite_reverse] border-dashed" />
              
              {/* The Image (Emerging) */}
              <div className="relative z-10 w-full h-full flex items-end justify-center pt-8 overflow-hidden">
                <img
                  src="/assets/imgs/female.webp"
                  alt="مُتقن أكاديمي Education"
                  className="w-[90%] h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)] transform translate-y-12"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=2070";
                  }}
                />
              </div>
              {/* Floating Element */}
              <motion.div
                 animate={{ y: [0, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                 className="absolute -bottom-6 -left-6 glass p-6 rounded-2xl shadow-xl border-white/40"
              >
                <div className="flex items-center gap-4 z-999">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xl">
                    %95
                  </div>
                  <div>
                    <div className="font-black text-foreground text-sm">متوسط التحسن</div>
                    <div className="text-xs text-muted-foreground">خلال أول 30 يوم</div>
                  </div>
                </div>
              </motion.div>
            </div>
            {/* Background geometric shapes */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10">
               <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_20s_linear_infinite]" />
               <div className="absolute inset-10 border border-accent/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
