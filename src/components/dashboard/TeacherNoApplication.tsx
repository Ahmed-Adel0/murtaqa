"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { DashboardShell } from "./shared/DashboardShell";

export default function TeacherNoApplication() {
  return (
    <DashboardShell title="ابدأ طلب الانضمام كمعلم" subtitle="أكمل بياناتك المهنية لنبدأ مراجعة حسابك.">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-[32px] p-10 text-center"
      >
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
          <GraduationCap className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-black mb-2">لم تُكمل طلب الانضمام بعد</h2>
        <p className="text-white/50 mb-8">احصل على موافقة الإدارة لتظهر في دليل المعلمين وتبدأ استقبال الطلاب.</p>
        <Link href="/onboarding">
          <button className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:bg-white/90 transition-all">
            إكمال الطلب
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
      </motion.div>
    </DashboardShell>
  );
}
