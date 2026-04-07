"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, BookOpen, GraduationCap, MessageSquare, Briefcase, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RegistrationFormContent = () => {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    studentName: "",
    grade: "",
    subject: "",
    teacherName: "",
    details: "",
  });

  const [submitted, setSubmitted] = useState(false);

  // Sync with URL params on load and change
  useEffect(() => {
    const teacher = searchParams.get("teacher");
    if (teacher) {
      setFormData(prev => ({ ...prev, teacherName: teacher }));
    }
  }, [searchParams]);

  // Sync with cross-component events (for instant smooth scroll without refresh)
  useEffect(() => {
    const handleTeacherSelect = (e: any) => {
      const data = e.detail;
      if (typeof data === 'string') {
        setFormData(prev => ({ ...prev, teacherName: data }));
      } else if (data && typeof data === 'object') {
        setFormData(prev => ({ 
          ...prev, 
          teacherName: data.name ?? prev.teacherName,
          subject: data.subject ?? prev.subject 
        }));
      }
    };

    window.addEventListener('teacherSelected', handleTeacherSelect);
    return () => window.removeEventListener('teacherSelected', handleTeacherSelect);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct WhatsApp message
    const message = `السلام عليكم متقن أكاديمي، أود الاستفسار والتسجيل:%0A%0A`
      + `👤 اسم الطالب: ${formData.studentName}%0A`
      + `🎓 المرحلة الدراسية: ${formData.grade}%0A`
      + `📚 المادة/الخدمة المطلوبة: ${formData.subject}%0A`
      + (formData.teacherName ? `👨‍🏫 المدرس المطلوب: ${formData.teacherName}%0A` : "")
      + `📝 تفاصيل إضافية: ${formData.details ? formData.details : "لا يوجد"}`;

    // WhatsApp number: +966 50 585 5924
    const whatsappUrl = `https://wa.me/966505855924?text=${message}`;
    window.open(whatsappUrl, "_blank");
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="register" className="py-20 md:py-32 bg-section-alt relative overflow-hidden">
      {/* Success Modal Overlay */}
      <AnimatePresence>
        {submitted && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="glass p-8 sm:p-12 rounded-[2.5rem] border border-primary/20 shadow-2xl max-w-md w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-primary" />
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3">تم إرسال طلبك بنجاح!</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                شكراً لثقتكم بمتقن أكاديمي. تم توجيهك للواتساب، وسيقوم فريقنا بمتابعة طلبك فوراً لترتيب موعد الحصة الأولى.
              </p>
              <Button 
                onClick={() => setSubmitted(false)}
                size="lg"
                className="w-full rounded-2xl py-6 font-bold"
              >
                فهمت، شكراً لكم
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -ml-48" />

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary px-4 py-1.5 rounded-full bg-primary/5 font-bold uppercase tracking-widest text-xs">
            احجز مقعدك الآن
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground mb-4">
            انضم إلى <span className="text-primary">متقن أكاديمي</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            املأ النموذج التالي لنتواصل معك ونحدد خطة تعليمية مخصصة تلبي احتياجات ابنك لضمان التفوق.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass p-8 sm:p-12 rounded-[2.5rem] border border-border shadow-2xl relative"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Student Name */}
              <div className="space-y-2 text-right">
                <label className="text-sm font-bold text-foreground/90 flex items-center gap-2 justify-end">
                  اسم الطالب <User className="w-4 h-4 text-primary" />
                </label>
                <input
                  type="text"
                  name="studentName"
                  required
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="أدخل اسم الطالب المكتمل"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 sm:py-4 text-right text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                />
              </div>

              {/* Grade */}
              <div className="space-y-2 text-right">
                <label className="text-sm font-bold text-foreground/90 flex items-center gap-2 justify-end">
                  المرحلة الدراسية <GraduationCap className="w-4 h-4 text-primary" />
                </label>
                <select
                  name="grade"
                  required
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 sm:py-4 text-right text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                  dir="rtl"
                >
                  <option value="" disabled>اختر المرحلة الدراسية</option>
                  <option value="الابتدائية">الابتدائية</option>
                  <option value="المتوسطة">المتوسطة</option>
                  <option value="الثانوية">الثانوية</option>
                  <option value="الجامعية">الجامعية</option>
                  <option value="قدرات / تحصيلي">تأسيس قدرات / تحصيلي</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            </div>

            {/* Subject and Teacher Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Teacher Name (Optional Auto-fill) */}
              <div className="space-y-2 text-right relative">
                <label className="text-sm font-bold text-foreground/90 flex items-center gap-2 justify-end">
                  المدرس المطلوب (اختياري) <Briefcase className="w-4 h-4 text-primary" />
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="teacherName"
                    value={formData.teacherName}
                    onChange={handleChange}
                    placeholder="إذا كنت ترغب بمدرس معين..."
                    className={`w-full bg-background border rounded-xl px-4 py-3 sm:py-4 text-right text-sm text-foreground focus:outline-none transition-all placeholder:text-muted-foreground ${formData.teacherName ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border'}`}
                  />
                  {formData.teacherName && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2 text-right">
                <label className="text-sm font-bold text-foreground/90 flex items-center gap-2 justify-end">
                  المادة أو الخدمة المطلوبة <BookOpen className="w-4 h-4 text-primary" />
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="مثال: رياضيات، لغة إنجليزية، تأسيس شامل..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 sm:py-4 text-right text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-right">
              <label className="text-sm font-bold text-foreground/90 flex items-center gap-2 justify-end">
                تفاصيل إضافية (اختياري) <MessageSquare className="w-4 h-4 text-primary" />
              </label>
              <textarea
                name="details"
                rows={4}
                value={formData.details}
                onChange={handleChange}
                placeholder="أي ملاحظات إضافية حول احتياجات الطالب أو الأوقات المفضلة..."
                className="w-full bg-background border border-border rounded-xl px-4 py-3 sm:py-4 text-right text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full rounded-xl py-6 sm:py-7 text-base sm:text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_10px_40px_-10px_rgba(199,90,48,0.5)] transition-all hover:-translate-y-1 group">
                <span className="flex items-center justify-center gap-2">
                  أرسل طلبك الآن وباشر الدراسة <Send className="w-5 h-5 rtl:-scale-x-100 transition-transform group-hover:translate-x-[-4px]" />
                </span>
              </Button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              بالنقر على هذا الزر، سيتم تحويلك مباشرة للواتساب لإتمام عملية التسجيل مع فريقنا.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

const RegistrationForm = () => {
  return (
    <Suspense fallback={<div className="py-20 text-center">جاري التحميل...</div>}>
      <RegistrationFormContent />
    </Suspense>
  );
};

export default RegistrationForm;
