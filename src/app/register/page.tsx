"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Phone, MapPin, UserCheck, Loader2, GraduationCap, BookOpen } from "lucide-react";
import Link from "next/link";

type IntendedRole = "student" | "teacher";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [intendedRole, setIntendedRole] = useState<IntendedRole>("student");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    city: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const postSignupRedirect = () => {
    const target = intendedRole === "teacher" ? "/onboarding" : "/dashboard";
    // router.refresh() forces the RSC tree (middleware + /dashboard) to re-evaluate
    // with the freshly-set session cookies.
    router.push(target);
    router.refresh();
  };

  const handleGoogleSignup = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (typeof document !== "undefined") {
        document.cookie = `intended_role=${intendedRole}; path=/; max-age=600; samesite=lax`;
      }
      const next = intendedRole === "teacher" ? "/onboarding" : "/dashboard";
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء الاتصال بجوجل";
      setError(msg);
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            city: formData.city,
            intended_role: intendedRole,
          },
        },
      });

      if (signupError) throw signupError;
      if (!signupData.user) throw new Error("لم يتم إنشاء الحساب");

      // Store intended role for redirect after verification
      localStorage.setItem("verify_email", formData.email);
      localStorage.setItem("intended_role", intendedRole);

      // Check if email is already confirmed (auto-confirm ON in Supabase)
      const isAlreadyVerified = !!signupData.user.email_confirmed_at;

      if (isAlreadyVerified) {
        // Auto-confirm is ON — user has a session immediately.
        // If no session yet, sign in explicitly.
        if (!signupData.session) {
          await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
        }
        setSuccess(true);
        const target = intendedRole === "teacher" ? "/onboarding" : "/dashboard";
        setTimeout(() => {
          router.push(target);
          router.refresh();
        }, 900);
      } else {
        // Auto-confirm is OFF — redirect to email verification page
        setSuccess(true);
        setTimeout(() => {
          router.push("/verify-email");
        }, 900);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء التسجيل";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = intendedRole === "teacher";

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 font-tajawal antialiased text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
            انضم إلى أكاديمية مرتقى
          </h1>
          <p className="text-white/40 text-sm">
            {isTeacher ? "أنشئ حسابك كمعلم وشارك معرفتك" : "أنشئ حسابك كطالب لتبدأ رحلتك التعليمية"}
          </p>
        </div>

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.04] border border-white/10 rounded-2xl mb-6" dir="rtl">
          <button
            type="button"
            onClick={() => setIntendedRole("student")}
            className={`relative py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              !isTeacher ? "bg-white text-black shadow" : "text-white/60 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            طالب
          </button>
          <button
            type="button"
            onClick={() => setIntendedRole("teacher")}
            className={`relative py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              isTeacher ? "bg-white text-black shadow" : "text-white/60 hover:text-white"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            معلم
          </button>
        </div>

        {error && (
          <div
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3 font-arabic"
            dir="rtl"
          >
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {success ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <UserCheck className="text-green-400 w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-green-400 mb-2 font-arabic">تم التسجيل بنجاح!</h2>
            <p className="text-white/40 text-sm font-arabic">
              {isTeacher ? "جاري توجيهك لإكمال طلب الانضمام..." : "جاري توجيهك..."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98] outline-none"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-medium">متابعة باستخدام جوجل</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative px-4 text-white/20 bg-[#0a0a0b] text-[10px] uppercase tracking-widest">أو بالبريد الإلكتروني</span>
            </div>

            <form onSubmit={handleSignup} className="space-y-5" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 mr-1">الاسم الكامل</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      required
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-10 outline-none focus:border-blue-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 mr-1">
                    رقم الجوال {!isTeacher && <span className="opacity-50">(اختياري)</span>}
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      required={isTeacher}
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      type="tel"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-10 outline-none focus:border-blue-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60 mr-1">البريد الإلكتروني</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-10 outline-none focus:border-blue-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 mr-1">
                    المدينة {!isTeacher && <span className="opacity-50">(لأفضل توصية)</span>}
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      required={isTeacher}
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-10 outline-none focus:border-blue-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 mr-1">كلمة المرور</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      required
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      type="password"
                      minLength={6}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-10 outline-none focus:border-blue-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all mt-6 flex items-center justify-center gap-2 group disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isTeacher ? "إنشاء حساب معلم" : "إنشاء حساب طالب"}
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-blue-400 hover:underline font-bold">تسجيل الدخول</Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
