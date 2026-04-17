import type { GradeLevel } from "./grade-levels";

export interface SubjectItem {
  value: string;
  label: string;
  grades: GradeLevel[];
}

/**
 * Saudi curriculum subjects mapped to grade levels.
 * Based on the Saudi Ministry of Education national curriculum.
 */
export const SUBJECTS: SubjectItem[] = [
  // ── Core subjects across most levels ──
  { value: "arabic", label: "لغة عربية", grades: ["primary-1-3", "primary-4-6", "middle", "high"] },
  { value: "math", label: "رياضيات", grades: ["primary-1-3", "primary-4-6", "middle", "high", "university"] },
  { value: "science", label: "علوم", grades: ["primary-1-3", "primary-4-6", "middle"] },
  { value: "islamic-studies", label: "دراسات إسلامية", grades: ["primary-1-3", "primary-4-6", "middle", "high"] },
  { value: "quran", label: "قرآن كريم وتجويد", grades: ["primary-1-3", "primary-4-6", "middle", "high"] },
  { value: "english", label: "لغة إنجليزية", grades: ["primary-1-3", "primary-4-6", "middle", "high", "university"] },

  // ── Primary 4-6 and above ──
  { value: "social-studies", label: "دراسات اجتماعية", grades: ["primary-4-6", "middle", "high"] },
  { value: "art", label: "تربية فنية", grades: ["primary-1-3", "primary-4-6", "middle"] },
  { value: "pe", label: "تربية بدنية", grades: ["primary-1-3", "primary-4-6", "middle", "high"] },
  { value: "family-education", label: "تربية أسرية", grades: ["primary-4-6", "middle"] },
  { value: "digital-skills", label: "المهارات الرقمية", grades: ["primary-4-6", "middle"] },

  // ── Middle school specific ──
  { value: "thinking-skills", label: "التفكير الناقد", grades: ["middle", "high"] },
  { value: "vocational", label: "مهارات حياتية ومهنية", grades: ["middle"] },

  // ── High school sciences (المسار العلمي) ──
  { value: "physics", label: "فيزياء", grades: ["high", "university"] },
  { value: "chemistry", label: "كيمياء", grades: ["high", "university"] },
  { value: "biology", label: "أحياء", grades: ["high", "university"] },
  { value: "advanced-math", label: "رياضيات متقدمة", grades: ["high"] },
  { value: "geology", label: "علم الأرض", grades: ["high"] },
  { value: "computer-science", label: "حاسب آلي", grades: ["middle", "high", "university"] },

  // ── High school humanities (المسار الإنساني) ──
  { value: "history", label: "تاريخ", grades: ["high"] },
  { value: "geography", label: "جغرافيا", grades: ["high"] },
  { value: "psychology", label: "علم نفس", grades: ["high", "university"] },
  { value: "sociology", label: "علم اجتماع", grades: ["high", "university"] },
  { value: "law-intro", label: "مبادئ القانون", grades: ["high"] },
  { value: "philosophy", label: "فلسفة ومنطق", grades: ["high"] },

  // ── High school business track ──
  { value: "accounting", label: "محاسبة", grades: ["high", "university"] },
  { value: "economics", label: "اقتصاد", grades: ["high", "university"] },
  { value: "business-admin", label: "إدارة أعمال", grades: ["high", "university"] },

  // ── University specializations ──
  { value: "medicine", label: "طب", grades: ["university"] },
  { value: "engineering", label: "هندسة", grades: ["university"] },
  { value: "pharmacy", label: "صيدلة", grades: ["university"] },
  { value: "nursing", label: "تمريض", grades: ["university"] },
  { value: "it", label: "تقنية معلومات", grades: ["university"] },
  { value: "architecture", label: "عمارة وتصميم", grades: ["university"] },
  { value: "finance", label: "مالية وتأمين", grades: ["university"] },
  { value: "marketing", label: "تسويق", grades: ["university"] },
  { value: "statistics", label: "إحصاء", grades: ["university"] },
  { value: "arabic-literature", label: "أدب عربي", grades: ["university"] },
  { value: "translation", label: "ترجمة", grades: ["university"] },
  { value: "media", label: "إعلام", grades: ["university"] },
  { value: "education", label: "علوم تربوية", grades: ["university"] },
  { value: "shariah", label: "شريعة وقانون", grades: ["university"] },

  // ── Special / Enrichment ──
  { value: "talent-gifted", label: "موهوبين وتميز", grades: ["primary-1-3", "primary-4-6", "middle", "high"] },
  { value: "special-needs", label: "صعوبات تعلم", grades: ["primary-1-3", "primary-4-6", "middle"] },
  { value: "test-prep-qudurat", label: "تحضير قدرات", grades: ["high"] },
  { value: "test-prep-tahsili", label: "تحضير تحصيلي", grades: ["high"] },
  { value: "test-prep-ielts", label: "IELTS / TOEFL", grades: ["high", "university"] },
  { value: "test-prep-sat", label: "SAT / ACT", grades: ["high"] },
];

/**
 * Get subjects available for a specific grade level.
 */
export function getSubjectsForGrade(grade: GradeLevel): SubjectItem[] {
  return SUBJECTS.filter((s) => s.grades.includes(grade));
}

/**
 * Get subjects available for multiple grade levels (union).
 */
export function getSubjectsForGrades(grades: GradeLevel[]): SubjectItem[] {
  if (grades.length === 0) return SUBJECTS;
  return SUBJECTS.filter((s) => s.grades.some((g) => grades.includes(g)));
}

/**
 * Get subject label by value.
 */
export function getSubjectLabel(value: string): string {
  return SUBJECTS.find((s) => s.value === value)?.label ?? value;
}

/**
 * Get all unique subject values as a flat array (for backwards compat).
 */
export const ALL_SUBJECT_VALUES = SUBJECTS.map((s) => s.value);
