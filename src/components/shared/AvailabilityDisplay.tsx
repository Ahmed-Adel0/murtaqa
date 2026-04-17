"use client";

import { Clock } from "lucide-react";
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

export function AvailabilityDisplay({ slots }: { slots: TeacherAvailability[] }) {
  if (slots.length === 0) {
    return (
      <p className="text-xs text-white/30 text-center py-4">لم يحدد المعلم أوقاته المتاحة بعد.</p>
    );
  }

  const grouped = DAYS.map((day) => ({
    ...day,
    slots: slots.filter((s) => s.day_of_week === day.value),
  })).filter((day) => day.slots.length > 0);

  return (
    <div className="space-y-2">
      {grouped.map((day) => (
        <div key={day.value} className="flex items-start gap-3">
          <span className="text-xs font-bold text-white/50 w-16 pt-1 shrink-0">{day.label}</span>
          <div className="flex flex-wrap gap-1.5">
            {day.slots.map((slot) => (
              <span
                key={slot.id}
                className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2.5 py-1 text-[11px] font-bold text-blue-300"
              >
                <Clock className="w-3 h-3" />
                <span dir="ltr">{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
