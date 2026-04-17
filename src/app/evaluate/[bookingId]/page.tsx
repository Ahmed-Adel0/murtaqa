"use client";

import { useState, useEffect, use, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  Heart,
  ThumbsDown,
  Sparkles,
  UserCircle,
} from "lucide-react";
import Image from "next/image";
import { getBookingForEvaluation, submitEvaluation } from "@/actions/student-management";

type PageState = "loading" | "form" | "already_done" | "not_found";

export default function EvaluatePage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const [state, setState] = useState<PageState>("loading");
  const [teacherName, setTeacherName] = useState("");
  const [teacherAvatar, setTeacherAvatar] = useState("");
  const [isPending, startTransition] = useTransition();

  // Form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [wantsContinue, setWantsContinue] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const result = await getBookingForEvaluation(bookingId);
      if (!result) {
        setState("not_found");
        return;
      }
      setTeacherName(result.teacher_name);
      setTeacherAvatar(result.teacher_avatar);
      setState(result.already_reviewed ? "already_done" : "form");
    })();
  }, [bookingId]);

  const handleSubmit = () => {
    if (rating === 0 || wantsContinue === null) return;
    startTransition(async () => {
      setError(null);
      const res = await submitEvaluation({
        bookingId,
        rating,
        comment,
        wantsContinue,
      });
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error ?? "حدث خطأ");
      }
    });
  };

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (state === "not_found") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 font-tajawal text-white" dir="rtl">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400/50 mx-auto mb-4" />
          <h1 className="text-xl font-black mb-2">الرابط غير صالح</h1>
          <p className="text-white/40 text-sm">هذا الرابط غير موجود أو منتهي الصلاحية.</p>
        </div>
      </div>
    );
  }

  if (state === "already_done") {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 font-tajawal text-white" dir="rtl">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-xl font-black mb-2">تم التقييم مسبقاً</h1>
          <p className="text-white/40 text-sm">شكراً لك! لقد قمت بتقييم المعلم {teacherName} بالفعل.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 font-tajawal text-white" dir="rtl">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-center">
          <div className="w-20 h-20 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-black mb-3 text-green-400">شكراً لتقييمك!</h1>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            {wantsContinue
              ? "سعيدون برغبتك بالاستمرار! سيتواصل معك فريق مرتقى قريباً لترتيب الاشتراك."
              : "شكراً لك على رأيك. سنعمل على إيجاد معلم آخر يناسبك بشكل أفضل."}
          </p>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-5 h-5 ${s <= rating ? "text-yellow-500 fill-yellow-500" : "text-white/10"}`} />
              ))}
            </div>
            <p className="text-xs text-white/30">تقييمك للمعلم {teacherName}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Form
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-tajawal antialiased" dir="rtl">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <Sparkles className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-2xl font-black mb-2">تقييم الحصة التجريبية</h1>
          <p className="text-white/40 text-sm">رأيك يهمنا لتحسين تجربتك التعليمية</p>
        </motion.div>

        {/* Teacher Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-[28px] p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-white/10 overflow-hidden relative shrink-0">
              {teacherAvatar ? (
                <Image src={teacherAvatar} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserCircle className="w-8 h-8 text-blue-400/60" />
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">المعلم</p>
              <h2 className="text-lg font-black">{teacherName}</h2>
            </div>
          </div>
        </motion.div>

        {/* Rating */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-[28px] p-6 mb-6 text-center">
          <h3 className="font-bold mb-1">كيف تقيّم المعلم؟</h3>
          <p className="text-white/30 text-xs mb-5">اضغط على النجوم لاختيار تقييمك</p>
          <div className="flex items-center justify-center gap-3 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setRating(s)} className="transition-all hover:scale-125 active:scale-95">
                <Star className={`w-10 h-10 md:w-12 md:h-12 transition-colors ${s <= rating ? "text-yellow-500 fill-yellow-500" : "text-white/10"}`} />
              </button>
            ))}
          </div>
          <AnimatePresence>
            {rating > 0 && (
              <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className={`text-sm font-bold ${rating >= 4 ? "text-green-400" : rating >= 3 ? "text-yellow-400" : "text-red-400"}`}>
                {rating === 5 ? "ممتاز! 🌟" : rating === 4 ? "جيد جداً 👍" : rating === 3 ? "جيد 👌" : rating === 2 ? "مقبول 😐" : "ضعيف 😞"}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Comment */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-[28px] p-6 mb-6">
          <h3 className="font-bold mb-3">تعليقك (اختياري)</h3>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
            placeholder="شاركنا رأيك عن الحصة التجريبية..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-blue-500 outline-none transition-all text-sm resize-none" />
        </motion.div>

        {/* Continue? */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-[28px] p-6 mb-8">
          <h3 className="font-bold mb-2">هل ترغب بالاستمرار مع هذا المعلم؟</h3>
          <p className="text-white/30 text-xs mb-5">اختيارك سيساعدنا في ترتيب اشتراكك الشهري</p>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setWantsContinue(true)}
              className={`p-5 rounded-2xl border-2 text-center font-bold transition-all ${
                wantsContinue === true ? "bg-green-600/15 border-green-500 text-green-300" : "bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20"
              }`}>
              <Heart className={`w-8 h-8 mx-auto mb-2 ${wantsContinue === true ? "text-green-400 fill-green-400" : "text-white/20"}`} />
              <span className="text-sm">نعم، أريد الاستمرار</span>
            </button>
            <button type="button" onClick={() => setWantsContinue(false)}
              className={`p-5 rounded-2xl border-2 text-center font-bold transition-all ${
                wantsContinue === false ? "bg-red-600/15 border-red-500 text-red-300" : "bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20"
              }`}>
              <ThumbsDown className={`w-8 h-8 mx-auto mb-2 ${wantsContinue === false ? "text-red-400" : "text-white/20"}`} />
              <span className="text-sm">لا، أريد معلم آخر</span>
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center font-bold">{error}</div>
        )}

        {/* Submit */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <button type="button" onClick={handleSubmit} disabled={rating === 0 || wantsContinue === null || isPending}
            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-white/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 text-lg">
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            إرسال التقييم
          </button>
          {(rating === 0 || wantsContinue === null) && (
            <p className="text-center text-[10px] text-white/20 mt-3">
              {rating === 0 ? "اختر تقييمك بالنجوم" : "اختر ما إذا كنت تريد الاستمرار مع المعلم"}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
