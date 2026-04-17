"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("verify_email");
    if (stored) setEmail(stored);
  }, []);

  const checkVerification = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email_confirmed_at) {
      setVerified(true);
      localStorage.removeItem("verify_email");
      const intendedRole = localStorage.getItem("intended_role");
      localStorage.removeItem("intended_role");
      const target = intendedRole === "teacher" ? "/onboarding" : "/dashboard";
      setTimeout(() => {
        router.push(target);
        router.refresh();
      }, 1500);
    }
  }, [router]);

  // Poll every 5 seconds
  useEffect(() => {
    checkVerification();
    const interval = setInterval(checkVerification, 5000);
    return () => clearInterval(interval);
  }, [checkVerification]);

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (resendError) throw resendError;
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء إعادة الإرسال";
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 font-tajawal antialiased text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 text-center"
        dir="rtl"
      >
        {verified ? (
          <div className="py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
              <CheckCircle2 className="text-green-400 w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-green-400 mb-2">تم التحقق بنجاح!</h1>
            <p className="text-white/40 text-sm">جاري توجيهك...</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
              <Mail className="text-blue-400 w-10 h-10" />
            </div>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-3">
              تحقق من بريدك الإلكتروني
            </h1>

            <p className="text-white/50 text-sm mb-2">
              لقد أرسلنا رابط التحقق إلى بريدك الإلكتروني
            </p>

            {email && (
              <p className="text-blue-400 font-medium text-sm mb-6 direction-ltr" dir="ltr">
                {email}
              </p>
            )}

            <p className="text-white/30 text-xs mb-8">
              يرجى فتح بريدك الإلكتروني والنقر على رابط التحقق لتفعيل حسابك.
              <br />
              تحقق من مجلد البريد العشوائي (Spam) إذا لم تجد الرسالة.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-2 justify-center">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm">
                تم إعادة إرسال رابط التحقق بنجاح!
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={resending || !email}
              className="w-full bg-white/5 border border-white/10 py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-40 mb-4"
            >
              {resending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {resending ? "جاري الإرسال..." : "إعادة إرسال رابط التحقق"}
              </span>
            </button>

            <div className="flex items-center gap-2 justify-center text-white/20 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>في انتظار التحقق...</span>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
