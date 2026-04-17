export const GRADE_LEVELS = [
  { value: "primary-1-3", label: "ابتدائي (1-3)" },
  { value: "primary-4-6", label: "ابتدائي (4-6)" },
  { value: "middle", label: "متوسط" },
  { value: "high", label: "ثانوي" },
  { value: "university", label: "جامعي" },
] as const;

export type GradeLevel = (typeof GRADE_LEVELS)[number]["value"];

export function getGradeLevelLabel(value: string): string {
  return GRADE_LEVELS.find((g) => g.value === value)?.label ?? value;
}
