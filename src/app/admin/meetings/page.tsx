"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  GraduationCap,
  Loader2,
  Link2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createMeeting, updateMeetingStatus } from "@/actions/meetings";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

type MeetingRow = {
  id: string;
  booking_id: string;
  teacher_id: string;
  student_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  meeting_link: string | null;
  notes: string | null;
  created_at: string;
  teacher_name?: string;
  student_name?: string;
  teacher_phone?: string;
};

type BookingOption = {
  id: string;
  teacher_id: string;
  student_id: string;
  student_name: string | null;
  teacher_name?: string;
  teacher_phone?: string;
};

type Tab = "scheduled" | "completed" | "cancelled";

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingRow[]>([]);
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("scheduled");
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    bookingId: "",
    teacherId: "",
    studentId: "",
    scheduledAt: "",
    durationMinutes: "60",
    meetingLink: "",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      const [meetingsRes, bookingsRes] = await Promise.all([
        supabase
          .from("meetings")
          .select("*")
          .order("scheduled_at", { ascending: false }),
        supabase
          .from("bookings")
          .select("id, teacher_id, student_id, student_name")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      // Enrich with names
      const meetingData = meetingsRes.data ?? [];
      const allUserIds = [
        ...new Set([
          ...meetingData.map((m: any) => m.teacher_id),
          ...meetingData.map((m: any) => m.student_id),
          ...(bookingsRes.data ?? []).map((b: any) => b.teacher_id),
        ]),
      ];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", allUserIds);

      const profileMap = new Map(
        (profiles ?? []).map((p: any) => [p.id, p])
      );

      const enrichedMeetings = meetingData.map((m: any) => ({
        ...m,
        teacher_name: profileMap.get(m.teacher_id)?.full_name ?? "معلم",
        student_name: profileMap.get(m.student_id)?.full_name ?? "طالب",
        teacher_phone: profileMap.get(m.teacher_id)?.phone ?? "",
      }));

      const enrichedBookings = (bookingsRes.data ?? []).map((b: any) => ({
        ...b,
        teacher_name: profileMap.get(b.teacher_id)?.full_name ?? "معلم",
        teacher_phone: profileMap.get(b.teacher_id)?.phone ?? "",
      }));

      setMeetings(enrichedMeetings);
      setBookings(enrichedBookings);
      setLoading(false);
    })();
  }, []);

  const filtered = meetings.filter((m) => m.status === tab);

  const handleCreate = () => {
    startTransition(async () => {
      setMessage(null);
      const res = await createMeeting({
        bookingId: form.bookingId,
        teacherId: form.teacherId,
        studentId: form.studentId,
        scheduledAt: form.scheduledAt,
        durationMinutes: parseInt(form.durationMinutes),
        meetingLink: form.meetingLink || undefined,
        notes: form.notes || undefined,
      });
      if (res.success) {
        setMessage({ kind: "success", text: "تم إنشاء الحصة بنجاح" });
        setShowForm(false);
        // Refresh
        const { data } = await supabase
          .from("meetings")
          .select("*")
          .order("scheduled_at", { ascending: false });
        setMeetings(data ?? []);
      } else {
        setMessage({ kind: "error", text: res.error ?? "فشل الإنشاء" });
      }
      setTimeout(() => setMessage(null), 3000);
    });
  };

  const handleStatus = (id: string, status: "completed" | "cancelled") => {
    startTransition(async () => {
      const res = await updateMeetingStatus(id, status);
      if (res.success) {
        setMeetings((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        );
      }
    });
  };

  const handleBookingSelect = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      setForm((f) => ({
        ...f,
        bookingId,
        teacherId: booking.teacher_id,
        studentId: booking.student_id ?? "",
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060607] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl" dir="rtl">
      {/* Header */}
      <div className="flex items-center p-6 md:p-10 pt-20 justify-between">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-400" />
            إدارة الحصص
          </h1>
          <p className="text-white/40 text-sm">إنشاء ومتابعة الحصص الدراسية.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          حصة جديدة
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-sm font-bold text-center ${
            message.kind === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8 space-y-5"
        >
          <h3 className="font-bold text-lg">إنشاء حصة جديدة</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-white/40">اختر الحجز</label>
              <select
                value={form.bookingId}
                onChange={(e) => handleBookingSelect(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500 appearance-none"
              >
                <option value="">اختر حجزاً</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.student_name ?? "طالب"} → {b.teacher_name ?? "معلم"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40">الموعد</label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40">المدة (دقيقة)</label>
              <input
                type="number"
                value={form.durationMinutes}
                onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40">رابط الاجتماع (اختياري)</label>
              <input
                type="url"
                value={form.meetingLink}
                onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))}
                placeholder="رابط Zoom أو Google Meet"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40">ملاحظات (اختياري)</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={isPending || !form.bookingId || !form.scheduledAt}
              className="flex-1 bg-white text-black font-bold py-3.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              إنشاء الحصة
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
        {(["scheduled", "completed", "cancelled"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t ? "bg-white text-black" : "text-white/40 hover:text-white"
            }`}
          >
            {t === "scheduled" && "مجدولة"}
            {t === "completed" && "مكتملة"}
            {t === "cancelled" && "ملغاة"}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      {filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[28px] p-12 text-center">
          <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h3 className="font-bold mb-2">لا توجد حصص</h3>
          <p className="text-white/40 text-sm">لا توجد حصص في هذه الفئة.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((meeting) => (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-[24px] p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      <span className="font-bold">{meeting.teacher_name}</span>
                    </div>
                    <span className="text-white/20">←</span>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-green-400" />
                      <span className="font-bold">{meeting.student_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(meeting.scheduled_at).toLocaleDateString("ar-EG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(meeting.scheduled_at).toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>{meeting.duration_minutes} دقيقة</span>
                  </div>
                </div>

                {meeting.teacher_phone && (
                  <WhatsAppButton
                    phone={meeting.teacher_phone}
                    message={`مرحباً، لديك حصة مجدولة على منصة مرتقى.`}
                  />
                )}
              </div>

              {meeting.meeting_link && (
                <a
                  href={meeting.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 text-sm hover:text-blue-300"
                >
                  <Link2 className="w-4 h-4" />
                  رابط الاجتماع
                </a>
              )}

              {meeting.notes && (
                <p className="text-xs text-white/40 bg-black/30 rounded-xl p-3">{meeting.notes}</p>
              )}

              {meeting.status === "scheduled" && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatus(meeting.id, "completed")}
                    disabled={isPending}
                    className="flex-1 bg-green-600/10 text-green-400 border border-green-500/20 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600/20 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    اكتملت
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatus(meeting.id, "cancelled")}
                    disabled={isPending}
                    className="bg-red-500/10 text-red-400 border border-red-500/20 font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    إلغاء
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
