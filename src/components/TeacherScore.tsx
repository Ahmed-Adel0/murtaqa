"use client";

import { TIER_META, SCORE_CRITERIA, type Teacher, type Tier } from "@/lib/teachers-data";

// ── Tier Badge ──────────────────────────────────────────
export function TierBadge({ tier, size = "sm" }: { tier: Tier; size?: "sm" | "md" | "lg" }) {
  const meta = TIER_META[tier];
  const sizeClass =
    size === "lg"
      ? "text-xs px-3 py-1.5 gap-1.5"
      : size === "md"
      ? "text-[11px] px-2.5 py-1 gap-1"
      : "text-[9px] px-2 py-0.5 gap-0.5";

  return (
    <span
      className={`inline-flex items-center font-black rounded-full border ${meta.bg} ${meta.border} ${meta.color} ${sizeClass}`}
    >
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
    </span>
  );
}

// ── Motqen Score Ring ───────────────────────────────────
export function ScoreRing({ score, tier }: { score: number; tier: Tier }) {
  const meta = TIER_META[tier];
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" strokeWidth="5" className="stroke-border" />
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ stroke: `hsl(var(--primary))` }}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-black ${meta.color}`}>{score}</span>
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">مُتقن سكور</span>
    </div>
  );
}

// ── Score Breakdown Tooltip ─────────────────────────────
export function ScoreBreakdown({ t }: { t: Teacher }) {
  const ratingPts   = Math.round((parseFloat(t.rating) / 5) * 30);
  const expPts      = Math.round(Math.min(t.experienceYears / 30, 1) * 25);
  const subjectPts  = Math.round(Math.min(t.subjects.length / 5, 1) * 15);
  const stagePts    = Math.round(Math.min(t.stages.length / 4, 1) * 10);
  const availPts    = (t.online ? 10 : 0) + (t.offline ? 10 : 0);

  const rows = [
    { label: SCORE_CRITERIA[0].label, icon: SCORE_CRITERIA[0].icon, pts: ratingPts,  max: 30 },
    { label: SCORE_CRITERIA[1].label, icon: SCORE_CRITERIA[1].icon, pts: expPts,     max: 25 },
    { label: SCORE_CRITERIA[2].label, icon: SCORE_CRITERIA[2].icon, pts: subjectPts, max: 15 },
    { label: SCORE_CRITERIA[3].label, icon: SCORE_CRITERIA[3].icon, pts: stagePts,   max: 10 },
    { label: SCORE_CRITERIA[4].label, icon: SCORE_CRITERIA[4].icon, pts: availPts,   max: 20 },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 w-64">
      <p className="text-xs font-black text-foreground mb-3 text-right">📊 تفاصيل مُتقن سكور</p>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[10px] font-black text-muted-foreground">{r.pts}/{r.max}</span>
              <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
                {r.label} <span>{r.icon}</span>
              </span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(r.pts / r.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
        <span className="text-sm font-black text-primary">{t.motqenScore} / 100</span>
        <span className="text-[10px] text-muted-foreground">مُتقن سكور الإجمالي</span>
      </div>
    </div>
  );
}
