"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loginEmail = formData.identifier.includes('@') 
        ? formData.identifier.trim() 
        : `${formData.identifier.trim()}@murtaqa.com`.toLowerCase();

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: formData.password,
      });

      if (loginError) throw loginError;

      if (data.user) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "فشل تسجيل الدخول. تحقق من بياناتك.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء الاتصال بجوجل";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 font-tajawal antialiased text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.h1 className="text-3xl font-bold mb-2">تسجيل الدخول</motion.h1>
          <p className="text-white/40 text-sm">أهلاً بك مجدداً في أكاديمية مرتقى</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3"
            dir="rtl"
          >
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </motion.div>
        )}

        <div className="space-y-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98] outline-none"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-sm font-medium">الدخول باستخدام جوجل</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-4 text-white/20 bg-[#0a0a0b] text-[10px] uppercase tracking-widest">أو بالبريد الإلكتروني</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" dir="rtl">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 mr-1">اسم المستخدم أو البريد</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                <input
                  required
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="ahmedadel"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-10 outline-none focus:border-blue-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-white/60 mr-1">كلمة المرور</label>
                <Link href="#" className="text-[10px] text-blue-400 hover:underline">نسيت كلمة المرور؟</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                <input
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-10 outline-none focus:border-blue-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all mt-6 flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تسجيل الدخول"}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-8">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-blue-400 hover:underline font-bold">إنشاء حساب جديد</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
