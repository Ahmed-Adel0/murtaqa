"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  Copy,
  CheckCircle2,
  Loader2,
  Building2,
  CreditCard,
  Hash,
  Globe,
} from "lucide-react";
import { BANK_ACCOUNTS } from "@/lib/constants/bank-accounts";
import { submitPaymentProof } from "@/actions/payments";

export default function PaymentPage() {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [form, setForm] = useState({
    bankAccountUsed: BANK_ACCOUNTS[0]?.id ?? "",
    transferReference: "",
    amount: "",
    note: "",
    bookingId: "",
    teacherId: "",
  });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = () => {
    if (!form.transferReference || !form.amount) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    startTransition(async () => {
      setError(null);
      const res = await submitPaymentProof({
        bookingId: form.bookingId || crypto.randomUUID(),
        teacherId: form.teacherId || "",
        bankAccountUsed: form.bankAccountUsed,
        transferReference: form.transferReference,
        amount: parseFloat(form.amount),
        note: form.note || undefined,
      });
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error ?? "حدث خطأ أثناء إرسال إثبات الدفع");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-tajawal antialiased p-6 md:p-10" dir="rtl">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <Banknote className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-black mb-2">الدفع وتحويل الرسوم</h1>
          <p className="text-white/40 text-sm max-w-lg mx-auto">
            قم بتحويل المبلغ المطلوب إلى أحد الحسابات البنكية أدناه، ثم أكد التحويل من خلال الزر أسفل الصفحة.
          </p>
        </div>

        {/* Bank Accounts */}
        <div className="space-y-4">
          {BANK_ACCOUNTS.map((account) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 md:p-8 space-y-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{account.bankName}</h3>
                  <p className="text-white/40 text-sm">{account.accountHolder}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CopyField
                  icon={<Hash className="w-4 h-4" />}
                  label="رقم الحساب"
                  value={account.accountNumber}
                  copied={copiedField === `${account.id}-num`}
                  onCopy={() => copyToClipboard(account.accountNumber, `${account.id}-num`)}
                />
                <CopyField
                  icon={<CreditCard className="w-4 h-4" />}
                  label="الآيبان (IBAN)"
                  value={account.iban}
                  copied={copiedField === `${account.id}-iban`}
                  onCopy={() => copyToClipboard(account.iban, `${account.id}-iban`)}
                />
                <CopyField
                  icon={<Globe className="w-4 h-4" />}
                  label="رمز السويفت (SWIFT)"
                  value={account.swift}
                  copied={copiedField === `${account.id}-swift`}
                  onCopy={() => copyToClipboard(account.swift, `${account.id}-swift`)}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Confirm Transfer */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-[28px] p-8 text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-green-400 mb-2">تم إرسال إثبات الدفع بنجاح!</h2>
            <p className="text-white/40 text-sm">
              سيقوم فريق الإدارة بمراجعة التحويل والتأكيد في أقرب وقت.
            </p>
          </motion.div>
        ) : (
          <>
            {!showForm ? (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 text-lg"
              >
                <CheckCircle2 className="w-6 h-6" />
                قمت بالتحويل — تأكيد الدفع
              </button>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8 space-y-5"
                >
                  <h3 className="font-bold text-lg">تأكيد التحويل</h3>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40">البنك المحوَّل إليه</label>
                      <select
                        value={form.bankAccountUsed}
                        onChange={(e) => setForm((f) => ({ ...f, bankAccountUsed: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500 appearance-none"
                      >
                        {BANK_ACCOUNTS.map((a) => (
                          <option key={a.id} value={a.id}>{a.bankName} — {a.accountHolder}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40">رقم المرجع / التحويل</label>
                      <input
                        type="text"
                        value={form.transferReference}
                        onChange={(e) => setForm((f) => ({ ...f, transferReference: e.target.value }))}
                        placeholder="رقم العملية أو المرجع"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40">المبلغ المحوَّل (ريال)</label>
                      <input
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                        placeholder="مثال: 200"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40">ملاحظات (اختياري)</label>
                      <input
                        type="text"
                        value={form.note}
                        onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                        placeholder="أي ملاحظة إضافية"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isPending}
                      className="flex-1 bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      تأكيد وإرسال
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CopyField({
  icon,
  label,
  value,
  copied,
  onCopy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-white/30 shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-sm font-bold text-white/80 truncate" dir="ltr">{value}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
      >
        {copied ? (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-white/40" />
        )}
      </button>
    </div>
  );
}
