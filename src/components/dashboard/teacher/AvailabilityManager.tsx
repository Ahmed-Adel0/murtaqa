"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { addAvailabilitySlot, removeAvailabilitySlot } from "@/actions/availability";
import type { TeacherAvailability } from "@/lib/types";

const DAYS = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الإثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
];

export default function AvailabilityManager() {
  const [slots, setSlots] = useState<TeacherAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    day_of_week: 0,
    start_time: "08:00",
    end_time: "09:00",
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("teacher_availability")
        .select("*")
        .eq("teacher_id", user.id)
        .order("day_of_week")
        .order("start_time");
      // Table may not exist yet — just show empty
      setSlots(error ? [] : (data as TeacherAvailability[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const handleAdd = () => {
    startTransition(async () => {
      setMessage(null);
      const res = await addAvailabilitySlot(form);
      if (res.success) {
        // Refresh slots
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("teacher_availability")
            .select("*")
            .eq("teacher_id", user.id)
            .order("day_of_week")
            .order("start_time");
          setSlots((data as TeacherAvailability[]) ?? []);
        }
        setShowForm(false);
        setMessage({ kind: "success", text: "تمت إضافة الوقت بنجاح" });
      } else {
        setMessage({ kind: "error", text: res.error ?? "فشلت الإضافة" });
      }
      setTimeout(() => setMessage(null), 3000);
    });
  };

  const handleRemove = (slotId: string) => {
    startTransition(async () => {
      const res = await removeAvailabilitySlot(slotId);
      if (res.success) {
        setSlots((prev) => prev.filter((s) => s.id !== slotId));
      }
    });
  };

  // Group slots by day
  const grouped = DAYS.map((day) => ({
    ...day,
    slots: slots.filter((s) => s.day_of_week === day.value),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
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

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          إضافة وقت متاح
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                إضافة وقت جديد
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">اليوم</label>
                  <select
                    value={form.day_of_week}
                    onChange={(e) => setForm((f) => ({ ...f, day_of_week: parseInt(e.target.value) }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500 appearance-none"
                  >
                    {DAYS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">من الساعة</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40">إلى الساعة</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isPending}
                  className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Grid */}
      <div className="space-y-3">
        {grouped.map((day) => (
          <div
            key={day.value}
            className="bg-white/5 border border-white/10 rounded-[24px] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm">{day.label}</h4>
              <span className="text-xs text-white/30 font-bold">
                {day.slots.length} {day.slots.length === 1 ? "وقت" : "أوقات"}
              </span>
            </div>
            {day.slots.length === 0 ? (
              <p className="text-xs text-white/20">لا توجد أوقات محددة</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {day.slots.map((slot) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-bold text-blue-300" dir="ltr">
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(slot.id)}
                      disabled={isPending}
                      className="mr-1 text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
