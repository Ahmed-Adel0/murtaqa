"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Briefcase,
  CheckCircle2,
  MapPin,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GRADE_LEVELS } from "@/lib/constants/grade-levels";
import type { GradeLevel } from "@/lib/constants/grade-levels";
import { getSubjectsForGrade, SUBJECTS } from "@/lib/constants/subjects";

const RegistrationFormContent = () => {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    studentName: "",
    grade: "",
    subject: "",
    teacherName: "",
    city: "",
    details: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const availableSubjects = useMemo(() => {
    if (formData.grade) {
      const mapped = GRADE_LEVELS.find((g) => g.label === formData.grade);
      if (mapped) return getSubjectsForGrade(mapped.value as GradeLevel);
    }
    return SUBJECTS;
  }, [formData.grade]);

  useEffect(() => {
    const teacher = searchParams.get("teacher");
    if (teacher) {
      setFormData((prev) => ({ ...prev, teacherName: teacher }));
    }
  }, [searchParams]);

  useEffect(() => {
    const handleTeacherSelect = (e: any) => {
      const data = e.detail;
      if (typeof data === "string") {
        setFormData((prev) => ({ ...prev, teacherName: data }));
      } else if (data && typeof data === "object") {
        setFormData((prev) => ({
          ...prev,
          teacherName: data.name ?? prev.teacherName,
          subject: data.subject ?? prev.subject,
        }));
      }
    };
    window.addEventListener("teacherSelected", handleTeacherSelect);
    return () => window.removeEventListener("teacherSelected", handleTeacherSelect);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message =
      `السلام عليكم مرتقى أكاديمي، أود الاستفسار والتسجيل:%0A%0A` +
      `👤 اسم الطالب: ${formData.studentName}%0A` +
      `🎓 المرحلة الدراسية: ${formData.grade}%0A` +
      `📚 المادة المطلوبة: ${formData.subject}%0A` +
      (formData.city ? `📍 المدينة: ${formData.city}%0A` : "") +
      (formData.teacherName ? `👨‍🏫 المدرس المطلوب: ${formData.teacherName}%0A` : "") +
      `📝 تفاصيل إضافية: ${formData.details || "لا يوجد"}`;

    const whatsappUrl = `https://wa.me/966505855924?text=${message}`;
    window.open(whatsappUrl, "_blank");
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset subject when grade changes
      ...(name === "grade" ? { subject: "" } : {}),
    }));
  };

  const completedFields = [formData.studentName, formData.grade, formData.subject].filter(Boolean).length;
  const progress = Math.round((completedFields / 3) * 100);

  return (
    <section id="register" className="py-20 md:py-32 bg-section-alt relative overflow-hidden">
      {/* Success Modal */}
      <AnimatePresence>
        {submitted && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          >
            <m.div
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
                شكرا لثقتكم بمرتقى أكاديمي. تم توجيهك للواتساب، وسيقوم فريقنا بمتابعة طلبك فورا.
              </p>
              <Button onClick={() => setSubmitted(false)} size="lg" className="w-full rounded-2xl py-6 font-bold">
                فهمت، شكرا لكم
              </Button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -ml-48" />

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <Badge
            variant="outline"
            className="mb-4 border-primary/20 text-primary px-4 py-1.5 rounded-full bg-primary/5 font-bold uppercase tracking-widest text-xs"
          >
            احجز مقعدك الان
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground mb-4">
            انضم الى <span className="text-primary">مرتقى أكاديمي</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            املأ النموذج التالي لنتواصل معك ونحدد خطة تعليمية مخصصة تلبي احتياجات ابنك لضمان التفوق.
          </p>
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass p-8 sm:p-12 rounded-[2.5rem] border border-border shadow-2xl relative"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">اكتمال النموذج</span>
              <span className="text-xs font-black text-primary">{progress}%</span>
            </div>
            <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
              <m.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Student Name */}
              <FormField
                icon={<User className="w-4 h-4" />}
                label="اسم الطالب"
                required
              >
                <input
                  type="text"
                  name="studentName"
                  required
                  value={formData.studentName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("studentName")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="أدخل اسم الطالب"
                  className="form-input"
                />
              </FormField>

              {/* Grade Level */}
              <FormField
                icon={<GraduationCap className="w-4 h-4" />}
                label="المرحلة الدراسية"
                required
              >
                <div className="relative">
                  <select
                    name="grade"
                    required
                    value={formData.grade}
                    onChange={handleChange}
                    className="form-input appearance-none cursor-pointer"
                    dir="rtl"
                  >
                    <option value="" disabled>اختر المرحلة الدراسية</option>
                    {GRADE_LEVELS.map((g) => (
                      <option key={g.value} value={g.label}>{g.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                </div>
              </FormField>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Subject — filtered by grade */}
              <FormField
                icon={<BookOpen className="w-4 h-4" />}
                label="المادة المطلوبة"
                required
              >
                <div className="relative">
                  <select
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-input appearance-none cursor-pointer"
                    dir="rtl"
                  >
                    <option value="" disabled>
                      {formData.grade ? "اختر المادة" : "اختر المرحلة أولا"}
                    </option>
                    {availableSubjects.map((s) => (
                      <option key={s.value} value={s.label}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                </div>
              </FormField>

              {/* City */}
              <FormField
                icon={<MapPin className="w-4 h-4" />}
                label="المدينة"
                hint="اختياري"
              >
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="مثال: الرياض، جدة، تبوك..."
                  className="form-input"
                />
              </FormField>
            </div>

            {/* Teacher Name */}
            <FormField
              icon={<Briefcase className="w-4 h-4" />}
              label="المدرس المطلوب"
              hint="اختياري"
            >
              <div className="relative">
                <input
                  type="text"
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleChange}
                  placeholder="إذا كنت ترغب بمدرس معين..."
                  className={`form-input ${formData.teacherName ? "border-primary/50 ring-1 ring-primary/20" : ""}`}
                />
                {formData.teacherName && (
                  <m.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                  </m.div>
                )}
              </div>
            </FormField>

            {/* Details */}
            <FormField
              icon={<MessageSquare className="w-4 h-4" />}
              label="تفاصيل اضافية"
              hint="اختياري"
            >
              <textarea
                name="details"
                rows={3}
                value={formData.details}
                onChange={handleChange}
                placeholder="أي ملاحظات حول احتياجات الطالب أو الأوقات المفضلة..."
                className="form-input resize-none"
              />
            </FormField>

            {/* Submit */}
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-xl py-6 sm:py-7 text-base sm:text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_10px_40px_-10px_rgba(199,90,48,0.5)] transition-all hover:-translate-y-1 group"
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  أرسل طلبك الان وباشر الدراسة
                  <Send className="w-5 h-5 rtl:-scale-x-100 transition-transform group-hover:translate-x-[-4px]" />
                </span>
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              بالنقر على هذا الزر، سيتم تحويلك مباشرة للواتساب لاتمام عملية التسجيل مع فريقنا.
            </p>
          </form>
        </m.div>
      </div>

      {/* Inline styles for form inputs */}
      <style jsx global>{`
        .form-input {
          width: 100%;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          text-align: right;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          outline: none;
          transition: all 0.2s;
        }
        .form-input::placeholder {
          color: hsl(var(--muted-foreground));
        }
        .form-input:focus {
          border-color: hsl(var(--primary) / 0.5);
          box-shadow: 0 0 0 2px hsl(var(--primary) / 0.1);
        }
        @media (min-width: 640px) {
          .form-input {
            padding: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

function FormField({
  icon,
  label,
  required,
  hint,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 text-right">
      <label className="text-sm font-bold text-foreground/90 flex items-center gap-2 justify-end">
        {hint && <span className="text-[10px] text-muted-foreground/50 font-normal">({hint})</span>}
        {label}
        {required && <span className="text-primary text-xs">*</span>}
        <span className="text-primary">{icon}</span>
      </label>
      {children}
    </div>
  );
}

const RegistrationForm = () => (
  <Suspense fallback={<div className="py-20 text-center">جاري التحميل...</div>}>
    <RegistrationFormContent />
  </Suspense>
);

export default RegistrationForm;
