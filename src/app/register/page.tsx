"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User, Mail, Lock, Phone, MapPin, UserCheck, Loader2,
  GraduationCap, BookOpen, AtSign, CheckCircle2, XCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SAUDI_REGIONS } from "@/lib/constants/locations";

type IntendedRole = "student" | "teacher";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [intendedRole, setIntendedRole] = useState<IntendedRole>("student");

  // Username check
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameTimer, setUsernameTimer] = useState<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    city: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "username") {
      const clean = value.trim().toLowerCase();
      if (clean.length < 3) { setUsernameStatus("idle"); return; }
      setUsernameStatus("checking");
      if (usernameTimer) clearTimeout(usernameTimer);
      const timer = setTimeout(async () => {
        const { data } = await supabase.from("profiles").select("id").eq("username", clean).limit(1);
        setUsernameStatus(data && data.length > 0 ? "taken" : "available");
      }, 500);
      setUsernameTimer(timer);
    }
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
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء الاتصال بجوجل");
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus === "taken") {
      setError("اسم المستخدم مستخدم بالفعل. اختر اسماً آخر.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const cleanUsername = formData.username.trim().toLowerCase();

      // Double-check username
      if (cleanUsername.length >= 3) {
        const { data: existing } = await supabase.from("profiles").select("id").eq("username", cleanUsername).limit(1);
        if (existing && existing.length > 0) {
          setError("اسم المستخدم مستخدم بالفعل. اختر اسماً آخر.");
          setUsernameStatus("taken");
          setLoading(false);
          return;
        }
      }

      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            city: formData.city,
            username: cleanUsername,
            intended_role: intendedRole,
          },
        },
      });

      if (signupError) throw signupError;
      if (!signupData.user) throw new Error("لم يتم إنشاء الحساب");

      // Update username in profiles
      if (cleanUsername) {
        setTimeout(async () => {
          await supabase.from("profiles").update({ username: cleanUsername }).eq("id", signupData.user!.id);
        }, 1000);
      }

      localStorage.setItem("verify_email", formData.email);
      localStorage.setItem("intended_role", intendedRole);

      const isAlreadyVerified = !!signupData.user.email_confirmed_at;

      if (isAlreadyVerified) {
        if (!signupData.session) {
          await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
        }
        setSuccess(true);
        const target = intendedRole === "teacher" ? "/onboarding" : "/dashboard";
        setTimeout(() => { router.push(target); router.refresh(); }, 900);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/verify-email"), 900);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء التسجيل";
      if (msg.includes("already registered")) setError("هذا البريد الإلكتروني مسجل بالفعل. جرب تسجيل الدخول.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = intendedRole === "teacher";

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex font-tajawal antialiased text-white" dir="rtl">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent" />
        <div className="absolute top-[10%] left-[-10%] w-[70%] h-[70%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="relative z-10 text-center px-16">
          <div className="relative h-20 w-56 mx-auto mb-8">
            <Image src="/logos/Profile-Photoroom.png" alt="مرتقى" fill className="object-contain" />
          </div>
          <h2 className="text-3xl font-black mb-4">ابدأ رحلتك التعليمية</h2>
          <p className="text-white/40 text-lg leading-relaxed max-w-md mx-auto">
            {isTeacher
              ? "انضم كمعلم وشارك خبرتك مع آلاف الطلاب في المملكة."
              : "سجّل الآن واحصل على أفضل المعلمين المعتمدين لمساعدتك في التفوق."}
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg space-y-6">

          <div className="lg:hidden text-center">
            <div className="relative h-14 w-48 mx-auto mb-2">
              <Image src="/logos/Profile-Photoroom.png" alt="مرتقى" fill className="object-contain" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black mb-2 pt-8">إنشاء حساب جديد</h1>
            <p className="text-white/40 text-sm">{isTeacher ? "سجّل كمعلم وابدأ التدريس" : "سجّل كطالب وابدأ التعلم"}</p>
          </div>

          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.04] border border-white/10 rounded-2xl">
            <button type="button" onClick={() => setIntendedRole("student")}
              className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${!isTeacher ? "bg-white text-black shadow" : "text-white/60 hover:text-white"}`}>
              <BookOpen className="w-4 h-4" /> طالب
            </button>
            <button type="button" onClick={() => setIntendedRole("teacher")}
              className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${isTeacher ? "bg-white text-black shadow" : "text-white/60 hover:text-white"}`}>
              <GraduationCap className="w-4 h-4" /> معلم
            </button>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" /> {error}
            </motion.div>
          )}

          {success ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                <UserCheck className="text-green-400 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-green-400 mb-2">تم التسجيل بنجاح!</h2>
              <p className="text-white/40 text-sm">{isTeacher ? "جاري توجيهك لإكمال طلب الانضمام..." : "جاري توجيهك..."}</p>
            </div>
          ) : (
            <div className="space-y-5">
              <button type="button" onClick={handleGoogleSignup} disabled={loading}
                className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98]">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-bold">متابعة باستخدام جوجل</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <span className="relative px-4 text-white/20 bg-[#0a0a0b] text-[10px] uppercase tracking-widest">أو</span>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField icon={<User className="w-4 h-4" />} label="الاسم الكامل" name="fullName" required
                    value={formData.fullName} onChange={handleInputChange} />

                  {/* Username with live check */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/50">اسم المستخدم <span className="text-red-400">*</span></label>
                    <div className="relative group">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                      <input required name="username" value={formData.username} onChange={handleInputChange}
                        type="text" minLength={3} placeholder="اسم مستخدم فريد"
                        className={`w-full bg-white/5 border rounded-2xl py-3.5 px-5 pl-12 outline-none transition-all text-sm ${
                          usernameStatus === "taken" ? "border-red-500/50" : usernameStatus === "available" ? "border-green-500/50" : "border-white/10 focus:border-blue-500/50"
                        }`} />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {usernameStatus === "checking" && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                        {usernameStatus === "available" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                        {usernameStatus === "taken" && <XCircle className="w-4 h-4 text-red-400" />}
                      </div>
                    </div>
                    {usernameStatus === "taken" && <p className="text-[10px] text-red-400 font-bold">اسم المستخدم مستخدم بالفعل</p>}
                    {usernameStatus === "available" && <p className="text-[10px] text-green-400 font-bold">متاح ✓</p>}
                  </div>
                </div>

                <InputField icon={<Mail className="w-4 h-4" />} label="البريد الإلكتروني" name="email" type="email" required
                  value={formData.email} onChange={handleInputChange} placeholder="example@email.com" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField icon={<Phone className="w-4 h-4" />} label="رقم الجوال"
                    name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} />
                  <InputField icon={<Lock className="w-4 h-4" />} label="كلمة المرور" name="password" type="password"
                    required minLength={6} value={formData.password} onChange={handleInputChange} placeholder="6 أحرف على الأقل" />
                </div>

                {/* City — dropdown with regions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50">المدينة <span className="text-red-400">*</span></label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                    <select required name="city" value={formData.city}
                      onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 pl-12 outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer"
                      dir="rtl">
                      <option value="">اختر مدينتك</option>
                      {SAUDI_REGIONS.map((region) => (
                        <optgroup key={region.region} label={region.region}>
                          {region.cities.map((c) => (
                            <option key={c.value} value={c.label}>{c.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <button disabled={loading || usernameStatus === "taken"} type="submit"
                  className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isTeacher ? "إنشاء حساب معلم" : "إنشاء حساب طالب"}
                </button>
              </form>

              <div className="text-center pt-4 border-t border-white/5">
                <p className="text-sm text-white/40">
                  لديك حساب بالفعل؟{" "}
                  <Link href="/login" className="text-blue-400 hover:underline font-bold">تسجيل الدخول</Link>
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function InputField({ icon, label, name, value, onChange, type = "text", required, minLength, placeholder }: {
  icon: React.ReactNode; label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; minLength?: number; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-white/50">{label} {required && <span className="text-red-400">*</span>}</label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors">{icon}</span>
        <input name={name} value={value} onChange={onChange} type={type} required={required} minLength={minLength} placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-5 pl-12 outline-none focus:border-blue-500/50 transition-all text-sm" />
      </div>
    </div>
  );
}
