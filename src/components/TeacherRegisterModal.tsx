"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { X, GraduationCap, User, Phone, BookOpen, FileText, Briefcase, ChevronLeft, MapPin, Laptop, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeacherRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WHATSAPP_NUMBER = "966505855924"; // غيّر هذا الرقم

const subjects = [
  "الرياضيات",
  "الفيزياء",
  "الكيمياء",
  "الأحياء",
  "اللغة العربية",
  "اللغة الإنجليزية",
  "التاريخ",
  "الجغرافيا",
  "الحاسب الآلي",
  "الفنون",
  "التربية الإسلامية",
  "أخرى",
];

const stages = [
  "ابتدائي",
  "إعدادي",
  "ثانوي",
  "جامعي",
  "جميع المراحل",
];

export default function TeacherRegisterModal({ isOpen, onClose }: TeacherRegisterModalProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    subject: "",
    stage: "",
    experience: "",
    bio: "",
    location: "",
    teachingMode: "", // 'online', 'offline', 'both'
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "الاسم مطلوب";
    if (!form.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    else if (!/^[0-9+\s\-()]{7,15}$/.test(form.phone.trim())) newErrors.phone = "رقم هاتف غير صالح";
    if (!form.subject) newErrors.subject = "المادة الدراسية مطلوبة";
    if (!form.stage) newErrors.stage = "المرحلة الدراسية مطلوبة";
    if (!form.experience.trim()) newErrors.experience = "سنوات الخبرة مطلوبة";
    if (!form.location.trim()) newErrors.location = "الموقع مطلوب";
    if (!form.teachingMode) newErrors.mode = "يرجى اختيار طريقة التدريس";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const message = encodeURIComponent(
      `🎓 *طلب تسجيل معلم جديد - مُتقن أكاديمي*\n\n` +
      `👤 *الاسم:* ${form.name}\n` +
      `📞 *رقم الهاتف:* ${form.phone}\n` +
      `📚 *المادة:* ${form.subject}\n` +
      `🏫 *المرحلة الدراسية:* ${form.stage}\n` +
      `📍 *الموقع :* ${form.location}\n` +
      `💻 *طريقة التدريس:* ${form.teachingMode === 'both' ? "أونلاين + حضوري" : form.teachingMode === 'online' ? "أونلاين" : "حضوري (منزلي)"}\n` +
      `💼 *سنوات الخبرة:* ${form.experience}\n` +
      (form.bio ? `📝 *نبذة عن المعلم:* ${form.bio}\n` : "") +
      `\n⏳ _سيتم الرد خلال 24 ساعة_`
    );

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    setSubmitted(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setForm({ name: "", phone: "", subject: "", stage: "", experience: "", bio: "", location: "", teachingMode: "" });
      setSubmitted(false);
      setErrors({});
    }, 400);
  };

  const inputClass = (field: string) =>
    `w-full bg-background/60 border ${
      errors[field] ? "border-red-500/70" : "border-primary/20"
    } rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all duration-200 backdrop-blur-sm`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal */}
          <m.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg bg-card/95 border border-primary/20 rounded-3xl shadow-[0_30px_80px_-10px_rgba(199,90,48,0.25)] overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative top glow */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-8 bg-primary/15 blur-2xl" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-primary/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground">سجّل كمعلم</h2>
                    <p className="text-[11px] text-muted-foreground/70 font-medium">انضم إلى فريق مُتقن أكاديمي</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors active:scale-90"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 overscroll-contain">
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <m.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="px-6 py-5 space-y-4"
                      noValidate
                    >
                      {/* Name */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 mb-1.5">
                          <User className="w-3.5 h-3.5 text-primary" />
                          الاسم الكامل
                          <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="أدخل اسمك الكامل"
                          className={inputClass("name")}
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name}</p>}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 mb-1.5">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          رقم الواتساب
                          <span className="text-primary">*</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="مثال: 01012345678"
                          className={inputClass("phone")}
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          dir="ltr"
                        />
                        {errors.phone && <p className="text-red-400 text-[11px] mt-1">{errors.phone}</p>}
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 mb-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                          المادة الدراسية
                          <span className="text-primary">*</span>
                        </label>
                        <select
                          className={inputClass("subject")}
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        >
                          <option value="" disabled>اختر المادة...</option>
                          {subjects.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {errors.subject && <p className="text-red-400 text-[11px] mt-1">{errors.subject}</p>}
                      </div>

                      {/* Stage */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 mb-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-primary" />
                          المرحلة الدراسية
                          <span className="text-primary">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {stages.map((stage) => (
                            <button
                              key={stage}
                              type="button"
                              onClick={() => setForm({ ...form, stage })}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                                form.stage === stage
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                                  : "bg-background/40 border-primary/20 text-foreground/70 hover:border-primary/50 hover:text-foreground"
                              }`}
                            >
                              {stage}
                            </button>
                          ))}
                        </div>
                        {errors.stage && <p className="text-red-400 text-[11px] mt-1">{errors.stage}</p>}
                      </div>
                      {/* Experience */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 mb-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-primary" />
                          سنوات الخبرة
                          <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="مثال: 5 سنوات"
                          className={inputClass("experience")}
                          value={form.experience}
                          onChange={(e) => setForm({ ...form, experience: e.target.value })}
                        />
                        {errors.experience && <p className="text-red-400 text-[11px] mt-1">{errors.experience}</p>}
                      </div>

                      {/* Location */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 mb-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          الموقع (المدينة/الحي)
                          <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="مثال: الرياض - حي النرجس"
                          className={inputClass("location")}
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                        />
                        {errors.location && <p className="text-red-400 text-[11px] mt-1">{errors.location}</p>}
                      </div>

                      {/* Teaching Mode */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 mb-1.5">
                          <Laptop className="w-3.5 h-3.5 text-primary" />
                          طريقة التدريس المتاحة
                          <span className="text-primary">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'online', label: 'أونلاين', icon: Laptop },
                            { id: 'offline', label: 'منزلي', icon: Home },
                            { id: 'both', label: 'الاثنين معاً', icon: GraduationCap }
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => setForm({ ...form, teachingMode: mode.id })}
                              className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl text-[10px] font-black border transition-all duration-200 ${
                                form.teachingMode === mode.id
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                                  : "bg-background/40 border-primary/20 text-foreground/70 hover:border-primary/50"
                              }`}
                            >
                              <mode.icon className="w-4 h-4" />
                              {mode.label}
                            </button>
                          ))}
                        </div>
                        {errors.mode && <p className="text-red-400 text-[11px] mt-1">{errors.mode}</p>}
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 mb-1.5">
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          نبذة مختصرة عنك
                          <span className="text-muted-foreground/50 mr-1 font-normal text-[10px]">(اختياري)</span>
                        </label>
                        <textarea
                          placeholder="أخبرنا عن نفسك وأسلوبك في التدريس..."
                          className={`${inputClass("bio")} resize-none`}
                          rows={3}
                          value={form.bio}
                          onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        />
                      </div>

                      {/* WhatsApp note */}
                      <div className="flex items-start gap-2 bg-green-500/8 border border-green-500/20 rounded-xl px-4 py-3">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-400 mt-0.5 shrink-0" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <p className="text-[11px] text-green-400/80 leading-relaxed">
                          سيتم إرسال بياناتك عبر واتساب وسنتواصل معك خلال <strong>24 ساعة</strong> لإتمام إجراءات التسجيل.
                        </p>
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-5 text-sm font-black shadow-lg shadow-primary/25 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        إرسال عبر واتساب
                      </Button>
                    </m.form>
                  ) : (
                    <m.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-6 py-12 flex flex-col items-center text-center gap-4"
                    >
                      <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-10 h-10 text-green-400" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-foreground">تم الإرسال بنجاح! 🎉</h3>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          شكراً لاهتمامك بالانضمام إلى فريق <span className="text-primary font-bold">مُتقن أكاديمي</span>.<br />
                          سنتواصل معك خلال <strong className="text-foreground">24 ساعة</strong>.
                        </p>
                      </div>
                      <Button
                        onClick={handleClose}
                        className="mt-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-xl px-8 py-4 text-sm font-bold cursor-pointer transition-all"
                      >
                        <ChevronLeft className="w-4 h-4 ml-1" />
                        العودة للرئيسية
                      </Button>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
