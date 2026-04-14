"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, Edit3 } from "lucide-react";
import type { TeacherApplication } from "@/lib/types";
import { DashboardShell } from "./shared/DashboardShell";

export default function TeacherRejected({ application }: { application: TeacherApplication }) {
  return (
    <DashboardShell
      title="تم رفض الطلب"
      subtitle="يمكنك مراجعة البيانات وإعادة التقديم."
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-red-500/20 rounded-[32px] p-8 md:p-10"
      >
        <div className="flex items-start gap-5 mb-8">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <XCircle className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black mb-1">لم يتم قبول طلبك في الوقت الحالي</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              نشكرك على اهتمامك. يمكنك تعديل طلبك وإعادة التقديم في أي وقت.
            </p>
          </div>
        </div>

        <Link href="/onboarding">
          <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-white text-black font-bold px-8 py-3.5 rounded-2xl hover:bg-white/90 transition-all">
            <Edit3 className="w-4 h-4" />
            تعديل الطلب وإعادة التقديم
          </button>
        </Link>

        <p className="text-xs text-white/30 mt-6">
          رقم الطلب: <span className="font-mono">{application.id.slice(0, 8)}</span>
        </p>
      </motion.div>
    </DashboardShell>
  );
}
