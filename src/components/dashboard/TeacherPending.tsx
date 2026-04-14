"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { TeacherApplication } from "@/lib/types";
import { DashboardShell } from "./shared/DashboardShell";

export default function TeacherPending({ application }: { application: TeacherApplication }) {
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel(`app-status-${application.user_id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "teacher_applications",
          filter: `user_id=eq.${application.user_id}`,
        },
        (payload) => {
          const newStatus = (payload.new as TeacherApplication).status;
          if (newStatus === "approved" || newStatus === "rejected") {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [application.user_id, router]);

  const submittedAt = new Date(application.created_at).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardShell
      title="طلبك قيد المراجعة"
      subtitle="استلمنا طلبك للانضمام كمعلم. سنُفعّل حسابك فور الموافقة."
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl"
      >
        <div className="flex items-start gap-5 mb-8">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black mb-1">بانتظار موافقة الإدارة</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              سيتم إخطارك تلقائياً فور مراجعة طلبك. هذه الصفحة ستتحدث دون الحاجة للتحديث اليدوي.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Stat label="المادة" value={application.subject || "—"} />
          <Stat label="سنوات الخبرة" value={application.years_of_experience?.toString() ?? "—"} />
          <Stat label="تاريخ الطلب" value={submittedAt} />
        </div>

        <ol className="space-y-3">
          {[
            { done: true, label: "استلام الطلب" },
            { done: false, label: "مراجعة الشهادات" },
            { done: false, label: "تفعيل الحساب ونشر الملف" },
          ].map((step) => (
            <li
              key={step.label}
              className={`flex items-center gap-4 p-4 rounded-2xl border ${
                step.done ? "bg-green-500/5 border-green-500/20" : "bg-white/[0.02] border-white/5"
              }`}
            >
              {step.done ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              ) : (
                <RefreshCw className="w-5 h-5 text-white/30 shrink-0 animate-spin-slow" />
              )}
              <span className={`text-sm font-bold ${step.done ? "text-green-300" : "text-white/50"}`}>
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </motion.div>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-black">{label}</p>
      <p className="text-sm font-bold text-white/90">{value}</p>
    </div>
  );
}
