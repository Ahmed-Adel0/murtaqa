"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  DollarSign,
  User,
  Video,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { verifyPayment, rejectPayment } from "@/actions/payments";
import { createMeeting } from "@/actions/meetings";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type PaymentRow = {
  id: string;
  student_id: string;
  teacher_id: string;
  booking_id: string;
  amount: number;
  status: string;
  bank_account_used: string | null;
  transfer_reference: string | null;
  transfer_note: string | null;
  created_at: string;
  verified_at: string | null;
  rejection_reason: string | null;
  student_name?: string;
  student_phone?: string | null;
};

type Tab = "pending" | "verified" | "rejected";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [isPending, startTransition] = useTransition();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [zoomLinks, setZoomLinks] = useState<Record<string, string>>({});
  const [scheduledAts, setScheduledAts] = useState<Record<string, string>>({});
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [meetingMessage, setMeetingMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const handleCreateMeeting = (payment: PaymentRow) => {
    const link = zoomLinks[payment.id];
    const time = scheduledAts[payment.id];
    const dur = durations[payment.id] || 60;
    
    if (!time) {
      setMeetingMessage({ kind: "error", text: "يجب تحديد وقت لحصة" });
      setTimeout(() => setMeetingMessage(null), 3000);
      return;
    }

    startTransition(async () => {
      const res = await createMeeting({
        bookingId: payment.booking_id,
        paymentId: payment.id,
        teacherId: payment.teacher_id,
        studentId: payment.student_id,
        scheduledAt: new Date(time).toISOString(),
        durationMinutes: dur,
        meetingLink: link,
      });

      if (res.success) {
        setMeetingMessage({ kind: "success", text: "تم حفظ رابط الحصة بنجاح!" });
        setTimeout(() => setMeetingMessage(null), 3000);
        
        // Open WhatsApp if phone exists
        if (payment.student_phone && link?.trim()) {
           const msg = `السلام عليكم ${payment.student_name ?? ""}،\n` +
           `تم استلام وتأكيد مبلغ التحويل (${payment.amount} ريال).\n` +
           `شكراً لثقتك بمرتقى أكاديمي.\n\n` +
           `موعد الحصة: ${new Date(time).toLocaleString("ar-EG")}\n` +
           `رابط الحصة:\n${link.trim()}\n\n` +
           `الرجاء الدخول في الموعد المحدد.`;
           window.open(buildWhatsAppLink(payment.student_phone, msg), "_blank", "noopener,noreferrer");
        }
      } else {
        setMeetingMessage({ kind: "error", text: res.error ?? "فشل حفظ الحصة" });
        setTimeout(() => setMeetingMessage(null), 3000);
      }
    });
  };

  useEffect(() => {
    (async () => {
      // Fetch payments with student name + phone join
      const { data } = await supabase
        .from("payments")
        .select("*, profiles!payments_student_id_fkey(full_name, phone)")
        .order("created_at", { ascending: false });

      const mapped = (data ?? []).map((p: any) => ({
        ...p,
        student_name: p.profiles?.full_name ?? "طالب",
        student_phone: p.profiles?.phone ?? null,
      }));
      setPayments(mapped);
      setLoading(false);
    })();
  }, []);

  const filtered = payments.filter((p) => p.status === tab);

  const counts = {
    pending: payments.filter((p) => p.status === "pending").length,
    verified: payments.filter((p) => p.status === "verified").length,
    rejected: payments.filter((p) => p.status === "rejected").length,
  };

  const handleVerify = (paymentId: string) => {
    startTransition(async () => {
      const res = await verifyPayment(paymentId);
      if (res.success) {
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, status: "verified" } : p))
        );
      }
    });
  };

  const handleReject = (paymentId: string) => {
    startTransition(async () => {
      const res = await rejectPayment(paymentId, rejectReason);
      if (res.success) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === paymentId ? { ...p, status: "rejected", rejection_reason: rejectReason } : p
          )
        );
        setRejectId(null);
        setRejectReason("");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060607] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-10 pt-20 md:p-10 space-y-8 max-w-5xl" dir="rtl">
      {/* Header */}
      <div className="p-10 pt-20">
        <h1 className="text-3xl  font-black mb-2 flex items-center gap-3">
          <Banknote className="w-8 h-8 text-blue-400" />
          إدارة المدفوعات
        </h1>
        <p className="text-white/40 text-sm">مراجعة وتأكيد عمليات التحويل البنكي.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "قيد المراجعة", count: counts.pending, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "مؤكدة", count: counts.verified, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "مرفوضة", count: counts.rejected, color: "text-red-400", bg: "bg-red-500/10" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border border-white/5 rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
            <p className="text-xs text-white/40 font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {meetingMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-2xl text-sm font-bold text-center ${
              meetingMessage.kind === "success"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {meetingMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
        {(["pending", "verified", "rejected"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t ? "bg-white text-black" : "text-white/40 hover:text-white"
            }`}
          >
            {t === "pending" && "قيد المراجعة"}
            {t === "verified" && "مؤكدة"}
            {t === "rejected" && "مرفوضة"}
            {counts[t] > 0 && ` (${counts[t]})`}
          </button>
        ))}
      </div>

      {/* Payments List */}
      {filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[28px] p-12 text-center">
          <Banknote className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h3 className="font-bold mb-2">لا توجد مدفوعات</h3>
          <p className="text-white/40 text-sm">لا توجد مدفوعات في هذه الفئة حالياً.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((payment) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-[24px] p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">{payment.student_name}</h3>
                    <p className="text-xs text-white/40">
                      {new Date(payment.created_at).toLocaleDateString("ar-EG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="font-black text-lg">{payment.amount} ريال</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-black/30 rounded-xl p-3">
                  <p className="text-[10px] text-white/30 font-bold mb-1">البنك</p>
                  <p className="font-bold text-white/70">{payment.bank_account_used || "—"}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-3">
                  <p className="text-[10px] text-white/30 font-bold mb-1">رقم المرجع</p>
                  <p className="font-bold text-white/70 truncate" dir="ltr">{payment.transfer_reference || "—"}</p>
                </div>
                {payment.transfer_note && (
                  <div className="bg-black/30 rounded-xl p-3">
                    <p className="text-[10px] text-white/30 font-bold mb-1">ملاحظات</p>
                    <p className="font-bold text-white/70">{payment.transfer_note}</p>
                  </div>
                )}
              </div>

              {payment.rejection_reason && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
                  سبب الرفض: {payment.rejection_reason}
                </div>
              )}

              {/* Actions for pending */}
              {payment.status === "pending" && (
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleVerify(payment.id)}
                    disabled={isPending}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    تأكيد الدفع
                  </button>
                  {rejectId === payment.id ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="سبب الرفض"
                        className="w-full bg-black/40 border border-red-500/20 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-red-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleReject(payment.id)}
                          disabled={isPending || !rejectReason.trim()}
                          className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg text-xs disabled:opacity-50"
                        >
                          تأكيد الرفض
                        </button>
                        <button
                          type="button"
                          onClick={() => { setRejectId(null); setRejectReason(""); }}
                          className="px-3 py-2 bg-white/5 rounded-lg text-xs font-bold"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRejectId(payment.id)}
                      className="bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      رفض
                    </button>
                  )}
                </div>
              )}

              {payment.status === "verified" && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    تم التأكيد
                    {payment.verified_at && (
                      <span className="text-white/30 text-xs">
                        — {new Date(payment.verified_at).toLocaleDateString("ar-EG")}
                      </span>
                    )}
                  </div>

                  {payment.student_phone ? (
                    <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                        <Video className="w-4 h-4 text-blue-400" />
                        إرسال تأكيد الدفع ورابط الحصة للطالب
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-white/40">وقت الحصة</label>
                        <input
                          type="datetime-local"
                          value={scheduledAts[payment.id] ?? ""}
                          onChange={(e) =>
                            setScheduledAts((prev) => ({ ...prev, [payment.id]: e.target.value }))
                          }
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-white/40">المدة (دقائق)</label>
                        <input
                          type="number"
                          value={durations[payment.id] ?? 60}
                          onChange={(e) =>
                            setDurations((prev) => ({ ...prev, [payment.id]: Number(e.target.value) }))
                          }
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-white/40">رابط زووم (اختياري)</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={zoomLinks[payment.id] ?? ""}
                          onChange={(e) =>
                            setZoomLinks((prev) => ({ ...prev, [payment.id]: e.target.value }))
                          }
                          placeholder="https://zoom.us/j/..."
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <button
                        onClick={() => handleCreateMeeting(payment)}
                        disabled={!scheduledAts[payment.id] || isPending}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                          scheduledAts[payment.id] && !isPending
                            ? "bg-green-600 text-white hover:bg-green-500"
                            : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                        }`}
                      >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        حفظ الموعد وإرسال
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-white/30 bg-white/5 border border-white/10 rounded-xl p-3">
                      لا يوجد رقم جوال للطالب — لا يمكن الإرسال عبر واتساب.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
