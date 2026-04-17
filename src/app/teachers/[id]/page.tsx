"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MapPin,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  Loader2,
  Send,
  CheckCircle2,
  Calendar,
  GraduationCap,
  Clock,
  MessageCircle,
  X,
  ZoomIn,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createBooking } from "@/actions/bookings";
import { GRADE_LEVELS } from "@/lib/constants/grade-levels";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { AvailabilityDisplay } from "@/components/shared/AvailabilityDisplay";
import type { TeacherAvailability } from "@/lib/types";

export default function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: teacherId } = use(params);
  const [teacher, setTeacher] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [certPreview, setCertPreview] = useState<string | null>(null);

  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchTeacherData();
  }, [teacherId]);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const { data: profile, error: pError } = await supabase
        .from("teacher_public_profiles")
        .select(`*, profiles:teacher_id (full_name, avatar_url, phone, city)`)
        .eq("teacher_id", teacherId)
        .single();

      if (pError) throw pError;
      setTeacher(profile);

      const [{ data: revs }, { count }, availRes] = await Promise.all([
        supabase.from("reviews").select("*").eq("teacher_id", teacherId).order("created_at", { ascending: false }),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("teacher_id", teacherId),
        supabase.from("teacher_availability").select("*").eq("teacher_id", teacherId).order("day_of_week").order("start_time"),
      ]);

      setReviews(revs || []);
      setBookingCount(count || 0);
      // table may not exist yet — ignore errors
      setAvailability(availRes.error ? [] : (availRes.data as TeacherAvailability[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        teacher_id: teacherId,
        student_name: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      if (error) throw error;
      setReviewForm({ name: "", rating: 5, comment: "" });
      fetchTeacherData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBooking = async () => {
    setIsBooking(true);
    try {
      const res = await createBooking(teacherId, teacher.profiles?.full_name);
      if (!res.success) throw new Error(res.error);
      setBookingSuccess(true);
      fetchTeacherData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsBooking(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 5.0;

  if (loading) return (
    <div className="min-h-screen bg-[#060607] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  );

  if (!teacher) return (
    <div className="min-h-screen bg-[#060607] flex flex-col items-center justify-center text-white gap-4">
      <p className="text-white/40">المعلم غير موجود</p>
      <Link href="/teachers" className="text-blue-400 hover:text-blue-300 text-sm font-bold">العودة لقائمة المعلمين</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal antialiased pb-20" dir="rtl">

      {/* Hero Background */}
      <div className="relative h-[260px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/15 via-blue-600/5 to-[#060607] z-10" />
        <div className="absolute top-[-30%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[40%] h-[40%] bg-purple-500/8 rounded-full blur-[100px]" />
      </div>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 -mt-48 relative z-20">
        <Link href="/teachers" className="inline-flex items-center gap-2 text-white/40 hover:text-blue-400 text-sm font-bold transition-colors mb-8">
          <ArrowRight className="w-4 h-4" />
          العودة لقائمة المعلمين
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Profile Card */}
            <div className="bg-[#0c0c0e]/90 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] text-center shadow-2xl">
              <div className="w-28 h-28 mx-auto rounded-3xl overflow-hidden border-4 border-blue-500/20 mb-5 relative">
                <Image
                  src={teacher.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${teacher.profiles?.full_name}&background=1e3a5f&color=fff&size=256`}
                  alt={teacher.profiles?.full_name}
                  fill
                  className="object-cover"
                />
              </div>
              <h1 className="text-2xl font-black mb-1">{teacher.profiles?.full_name}</h1>
              {teacher.profiles?.city && (
                <p className="text-xs text-white/30 flex items-center justify-center gap-1 mb-4">
                  <MapPin className="w-3 h-3" /> {teacher.profiles.city}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(averageRating) ? "text-yellow-500 fill-yellow-500" : "text-white/10"}`}
                    />
                  ))}
                </div>
                <span className="text-yellow-500 font-black text-sm">{averageRating.toFixed(1)}</span>
                <span className="text-white/20 text-xs">({reviews.length})</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
                  <Users className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
                  <span className="block text-lg font-black">{bookingCount}</span>
                  <span className="text-[9px] text-white/30 uppercase font-bold">طالب</span>
                </div>
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
                  <MessageCircle className="w-4 h-4 text-green-400 mx-auto mb-1.5" />
                  <span className="block text-lg font-black">{reviews.length}</span>
                  <span className="text-[9px] text-white/30 uppercase font-bold">تقييم</span>
                </div>
              </div>

              {/* Booking CTA */}
              {bookingSuccess ? (
                <div className="w-full py-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center gap-2 text-green-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  تم إرسال طلب الحجز بنجاح!
                </div>
              ) : (
                <button
                  onClick={handleBooking}
                  disabled={isBooking}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                  احجز درسك الآن
                </button>
              )}

              {/* WhatsApp */}
              {teacher.profiles?.phone && (
                <div className="mt-3">
                  <WhatsAppButton
                    phone={teacher.profiles.phone}
                    message={`مرحباً ${teacher.profiles.full_name}، أرغب بالتواصل معك بخصوص دروس خصوصية عبر منصة مرتقى.`}
                    label="تواصل عبر واتساب"
                    size="md"
                  />
                </div>
              )}
            </div>

            {/* Districts */}
            {teacher.districts?.length > 0 && (
              <div className="bg-[#0c0c0e]/90 backdrop-blur-xl border border-white/10 p-6 rounded-[28px]">
                <h3 className="flex items-center gap-2 font-bold text-sm mb-4">
                  <MapPin className="w-4 h-4 text-red-400" />
                  أماكن التغطية
                </h3>
                <div className="flex flex-wrap gap-2">
                  {teacher.districts.map((d: string) => (
                    <span key={d} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold">{d}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {availability.length > 0 && (
              <div className="bg-[#0c0c0e]/90 backdrop-blur-xl border border-white/10 p-6 rounded-[28px]">
                <h3 className="flex items-center gap-2 font-bold text-sm mb-4">
                  <Clock className="w-4 h-4 text-blue-400" />
                  الأوقات المتاحة
                </h3>
                <AvailabilityDisplay slots={availability} />
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Bio & Subjects */}
            <div className="bg-[#0c0c0e]/90 backdrop-blur-xl border border-white/10 p-8 rounded-[32px]">
              <h2 className="text-lg font-black mb-5 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                النبذة التعريفية
              </h2>

              {/* Subjects */}
              {teacher.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {teacher.subjects.map((s: string) => (
                    <span key={s} className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-sm font-bold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Grade Levels */}
              {teacher.grade_levels?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {teacher.grade_levels.map((g: string) => (
                    <span key={g} className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {GRADE_LEVELS.find((gl) => gl.value === g)?.label ?? g}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-white/50 leading-relaxed whitespace-pre-wrap">{teacher.bio || "لم يتم إضافة نبذة بعد."}</p>
            </div>

            {/* Certificates */}
            {teacher.certificates?.length > 0 && (
              <div className="bg-[#0c0c0e]/90 backdrop-blur-xl border border-white/10 p-8 rounded-[32px]">
                <h2 className="text-lg font-black mb-5 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  الشهادات والخبرات
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {teacher.certificates.map((url: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCertPreview(url)}
                      className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all group cursor-pointer"
                    >
                      <Image src={url} alt="Certificate" fill className="object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="space-y-5">
              <h2 className="text-lg font-black flex items-center gap-2 px-2">
                <Star className="w-5 h-5 text-yellow-500" />
                التقييمات ({reviews.length})
              </h2>

              {/* Review Form */}
              <form onSubmit={submitReview} className="bg-white/[0.03] border border-white/10 p-6 rounded-[28px] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/30 font-bold uppercase">الاسم</label>
                    <input
                      required
                      type="text"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="أدخل اسمك..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 focus:border-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/30 font-bold uppercase">التقييم</label>
                    <div className="flex gap-1 p-3.5 bg-black/40 border border-white/10 rounded-xl">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewForm((p) => ({ ...p, rating: n }))}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${n <= reviewForm.rating ? "text-yellow-500 fill-yellow-500" : "text-white/10"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/30 font-bold uppercase">تعليقك</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                    placeholder="كيف كانت تجربتك؟"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 focus:border-blue-500 outline-none transition-all resize-none text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 text-sm"
                >
                  {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  إرسال التقييم
                </button>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={rev.id}
                    className="bg-[#0c0c0e]/80 border border-white/5 p-5 rounded-[24px]"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-400 text-sm">
                          {(rev.student_name ?? "?")[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{rev.student_name}</h4>
                          <p className="text-[10px] text-white/20">{new Date(rev.created_at).toLocaleDateString("ar-EG")}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "text-yellow-500 fill-yellow-500" : "text-white/10"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">{rev.comment}</p>

                    {rev.teacher_reply && (
                      <div className="mt-3 bg-blue-500/5 border-r-4 border-blue-500 p-4 rounded-xl">
                        <p className="text-[10px] font-black text-blue-400 uppercase mb-1">رد المعلم</p>
                        <p className="text-sm text-white/70 leading-relaxed">{rev.teacher_reply}</p>
                      </div>
                    )}
                  </motion.div>
                ))}

                {reviews.length === 0 && (
                  <div className="text-center py-12 text-white/20 border-2 border-dashed border-white/5 rounded-[28px]">
                    لا توجد تقييمات بعد. كن أول من يقيّم!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Preview Modal */}
      <AnimatePresence>
        {certPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/5  backdrop-blur-sm"
            onClick={() => setCertPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-3xl w-full max-h-[85vh] bg-[#111] border border-white/10 rounded-[28px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <span className="text-sm font-bold">معاينة الشهادة</span>
                <button onClick={() => setCertPreview(null)} className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-auto max-h-[75vh] p-4 flex items-center justify-center">
                <Image src={certPreview} alt="Certificate" width={800} height={600} className="max-w-full h-auto rounded-xl object-contain" unoptimized />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
