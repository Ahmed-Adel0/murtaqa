export type Tier = "platinum" | "gold" | "silver" | "bronze";

export type Teacher = {
  id: string;
  name: string;
  role: string;
  img: string;
  subjects: string[];
  rating: string;
  students: string;
  bio: string;
  badge: string;
  experienceYears: number;
  city: string;
  online: boolean;
  offline: boolean;
  stages: string[];
  gender: "male" | "female";
  // Computed
  motqenScore: number;
  tier: Tier;
};

// ──────────────────────────────────────────────────────────
// 🎯 MOTQEN SCORE FORMULA (out of 100)
//
//  • تقييم الأهالي      → 30 pts   (rating / 5) × 30
//  • سنوات الخبرة        → 25 pts   min(years / 30, 1) × 25
//  • تنوع المواد         → 15 pts   min(subjects.len / 5, 1) × 15
//  • تنوع المراحل        → 10 pts   min(stages.len / 4, 1) × 10
//  • التوفر (أون+أوف)    → 20 pts   online×10 + offline×10
//
//  TIERS:
//    🏆 بلاتيني   ≥ 90
//    ⭐ ذهبي      80–89
//    🥈 فضي       70–79
//    🥉 برونزي    < 70
// ──────────────────────────────────────────────────────────

function calcScore(t: Omit<Teacher, "motqenScore" | "tier">): number {
  const ratingScore   = (parseFloat(t.rating) / 5) * 30;
  const expScore      = Math.min(t.experienceYears / 30, 1) * 25;
  const subjectScore  = Math.min(t.subjects.length / 5, 1) * 15;
  const stageScore    = Math.min(t.stages.length / 4, 1) * 10;
  const availScore    = (t.online ? 10 : 0) + (t.offline ? 10 : 0);
  return Math.round(ratingScore + expScore + subjectScore + stageScore + availScore);
}

function getTier(score: number): Tier {
  if (score >= 90) return "platinum";
  if (score >= 80) return "gold";
  if (score >= 70) return "silver";
  return "bronze";
}

function make(t: Omit<Teacher, "motqenScore" | "tier">): Teacher {
  const score = calcScore(t);
  return { ...t, motqenScore: score, tier: getTier(score) };
}

// ──────────────────────────────────────────────────────────
export const TIER_META: Record<Tier, { label: string; emoji: string; color: string; bg: string; border: string; glow: string }> = {
  platinum: {
    label: "بلاتيني",
    emoji: "🏆",
    color: "text-cyan-300",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/30",
    glow: "shadow-cyan-400/20",
  },
  gold: {
    label: "ذهبي",
    emoji: "⭐",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
    glow: "shadow-yellow-400/15",
  },
  silver: {
    label: "فضي",
    emoji: "🥈",
    color: "text-slate-300",
    bg: "bg-slate-400/10",
    border: "border-slate-400/25",
    glow: "shadow-slate-400/10",
  },
  bronze: {
    label: "برونزي",
    emoji: "🥉",
    color: "text-orange-400",
    bg: "bg-orange-400/8",
    border: "border-orange-400/20",
    glow: "shadow-orange-400/10",
  },
};

export const SCORE_CRITERIA = [
  { label: "تقييم الأهالي",   max: 30, icon: "⭐", desc: "بناءً على تقييمات أولياء الأمور من 5 نجوم" },
  { label: "سنوات الخبرة",    max: 25, icon: "💼", desc: "أقصى نقاط لـ 30 سنة فأكثر" },
  { label: "تنوع المواد",    max: 15, icon: "📚", desc: "كلما زادت المواد زادت النقاط (أقصى 5 مواد)" },
  { label: "تنوع المراحل",   max: 10, icon: "🎓", desc: "من ابتدائي حتى جامعي (أقصى 4 مراحل)" },
  { label: "التوفر",          max: 20, icon: "💻", desc: "10 نقاط للأونلاين + 10 نقاط للأوفلاين" },
];

// ──────────────────────────────────────────────────────────
export const teachers: Teacher[] = [
  make({
    id: "mohammed-abu-alhadid",
    name: "محمد أبو الحديد",
    role: "مدرس لغة عربية + قدرات لفظي",
    img: "/assets/imgs/محمد أبو الحديد.jpeg",
    subjects: ["لغة عربية", "قدرات لفظي", "بلاغة"],
    rating: "5.0",
    students: "65+",
    bio: "خبرة 35 سنة في تدريس اللغة العربية لجميع المراحل مع تخصص في القدرات اللفظي والبلاغة.",
    badge: "خبير 35 سنة",
    experienceYears: 35,
    city: "تبوك",
    online: true,
    offline: true,
    stages: ["ابتدائي", "متوسط", "ثانوي"],
    gender: "male"
  }),
  make({
    id: "ahmed-antar",
    name: "أحمد عنتر (أبو محمد)",
    role: "مدرس لغة إنجليزية — تأسيس وجميع المراحل",
    img: "/assets/imgs/أحمد عنتر.jpeg",
    subjects: ["لغة إنجليزية", "تأسيس"],
    rating: "5.0",
    students: "70+",
    bio: "خبرة 32 سنة في تأسيس وتعليم اللغة الإنجليزية من الصفر حتى المستويات المتقدمة والجامعية.",
    badge: "أسطورة التأسيس",
    experienceYears: 32,
    city: "السعودية",
    online: true,
    offline: true,
    stages: ["ابتدائي", "متوسط", "ثانوي", "جامعي"],
    gender: "male"
  }),
  make({
    id: "hisham-mohammed",
    name: "هشام محمد",
    role: "مدرس رياضيات — جميع المراحل + قدرات",
    img: "/assets/imgs/هشام محمد.jpeg",
    subjects: ["رياضيات", "قدرات كمي"],
    rating: "5.0",
    students: "60+",
    bio: "خبرة 30 سنة في تدريس الرياضيات مع تبسيط المفاهيم وإعداد الطلاب لاختبارات القدرات.",
    badge: "خبير 30 سنة",
    experienceYears: 30,
    city: "السعودية",
    online: true,
    offline: false,
    stages: ["ابتدائي", "متوسط", "ثانوي"],
    gender: "male"
  }),
  make({
    id: "mohammed-shaarawi",
    name: "محمد الشعراوي",
    role: "معلم قرآن + عربي + إنجليزي",
    img: "/assets/imgs/محمد الشعراوي.jpeg",
    subjects: ["قرآن كريم", "لغة عربية", "لغة إنجليزية"],
    rating: "5.0",
    students: "80+",
    bio: "خبرة أكثر من 30 سنة في المملكة في تدريس القرآن والمناهج الدراسية وتأسيس الطلاب.",
    badge: "خبير المملكة",
    experienceYears: 30,
    city: "السعودية",
    online: true,
    offline: true,
    stages: ["ابتدائي", "متوسط"],
    gender: "male"
  }),
  make({
    id: "ismaeel-abdelmoghni",
    name: "إسماعيل عبد المغني",
    role: "مدرس لغة إنجليزية — جميع المناهج",
    img: "/assets/imgs/اسماعيل عبد المغني.jpeg",
    subjects: ["لغة إنجليزية"],
    rating: "5.0",
    students: "55+",
    bio: "خبرة 28 سنة في تدريس المناهج الحكومية والأهلية والدولية (أمريكي / بريطاني).",
    badge: "International",
    experienceYears: 28,
    city: "السعودية",
    online: true,
    offline: true,
    stages: ["ابتدائي", "متوسط", "ثانوي"],
    gender: "male"
  }),
  make({
    id: "ibrahim-eid",
    name: "إبراهيم عيد",
    role: "مدرس لغة إنجليزية — جميع المراحل",
    img: "/assets/imgs/ابراهيم عيد.jpeg",
    subjects: ["لغة إنجليزية"],
    rating: "5.0",
    students: "50+",
    bio: "خبرة 27 سنة في تدريس اللغة الإنجليزية لجميع المراحل مع أسلوب مبسط يركز على الفهم والتطبيق العملي.",
    badge: "خبير 25+ سنة",
    experienceYears: 27,
    city: "السعودية",
    online: true,
    offline: false,
    stages: ["ابتدائي", "متوسط", "ثانوي"],
    gender: "male"
  }),
  make({
    id: "ahmed-ata",
    name: "أحمد عطا صابر",
    role: "معلم خبير لغة إنجليزية + تأسيس شامل",
    img: "/assets/imgs/احمد عطا صابر.jpg",
    subjects: ["إنجليزي", "رياضيات", "علوم", "تأسيس"],
    rating: "5.0",
    students: "25+ سنة خبرة",
    bio: "يتميز بقدرته على تأسيس الطلاب من الصفر وحتى الاحتراف، مع تبسيط المناهج بطريقة تناسب الجميع.",
    badge: "خبير تأسيس",
    experienceYears: 25,
    city: "تبوك",
    online: true,
    offline: true,
    stages: ["ابتدائي", "متوسط", "ثانوي"],
    gender: "male",
  }),
  make({
    id: "dr-badr",
    name: "الأستاذ بدر فايد",
    role: "مدرس اللغة الإنجليزية | مناهج متقدمة",
    img: "/assets/imgs/dr.badr.jpg",
    subjects: ["إنجليزي", "تأسيس لغة", "جامعي"],
    rating: "5.0",
    students: "22+ سنة خبرة",
    bio: "يمتلك خبرة طويلة في تدريس اللغة الإنجليزية وفق أحدث المناهج، ويركّز على بناء أساس قوي للطالب.",
    badge: "خبير إنجليزي",
    experienceYears: 22,
    city: "تبوك",
    online: true,
    offline: true,
    stages: ["متوسط", "ثانوي", "جامعي"],
    gender: "male",
  }),
  make({
    id: "sayed-qaoud",
    name: "سيد قاعود",
    role: "معلم تأسيس وتحفيظ قرآن",
    img: "/assets/imgs/سيد قاعود.jpeg",
    subjects: ["تأسيس", "قرآن كريم"],
    rating: "5.0",
    students: "40+",
    bio: "خبرة 20 سنة في تأسيس الطلاب وتحفيظ القرآن بأسلوب تربوي مبسط ومؤثر.",
    badge: "محفظ قرآن",
    experienceYears: 20,
    city: "السعودية",
    online: true,
    offline: true,
    stages: ["ابتدائي"],
    gender: "male"
  }),
  make({
    id: "mohammed-ali",
    name: "محمد علي محجوب",
    role: "معلم خبير لغة إنجليزية",
    img: "/assets/imgs/محمد علي محجوب.jpeg",
    subjects: ["إنجليزي", "مناهج دولية", "جامعي"],
    rating: "5.0",
    students: "20+ سنة خبرة",
    bio: "يتميز بخبرة طويلة في تعليم اللغة إنجليزية لمختلف الأعمار، ويعتمد على أساليب تفاعلية حديثة.",
    badge: "خبير إنجليزي",
    experienceYears: 20,
    city: "تبوك",
    online: true,
    offline: true,
    stages: ["متوسط", "ثانوي", "جامعي"],
    gender: "male",
  }),
  make({
    id: "nader-saber",
    name: "نادر صابر",
    role: "مدرس ابتدائي شامل",
    img: "/assets/imgs/نادر صابر.jpeg",
    subjects: ["لغتي", "لغة إنجليزية", "رياضيات"],
    rating: "5.0",
    students: "45+",
    bio: "خبرة أكثر من 20 سنة في تأسيس طلاب المرحلة الابتدائية في جميع المواد الأساسية.",
    badge: "خبير ابتدائي",
    experienceYears: 20,
    city: "السعودية",
    online: true,
    offline: true,
    stages: ["ابتدائي"],
    gender: "male"
  }),
  make({
    id: "abdelnaser",
    name: "عبدالناصر محمد إبراهيم",
    role: "خبير منهج سعودي — 14 عاماً",
    img: "/assets/imgs/abdelnaser.jpg",
    subjects: ["قدرات", "تحصيلي", "ثانوي"],
    rating: "4.9",
    students: "14 سنة خبرة",
    bio: "يساعد الطلاب على تحقيق نتائج متميزة في القدرات والتحصيلي باستراتيجيات ذكية مجربة على مدى 14 عاماً.",
    badge: "خبير قدرات",
    experienceYears: 14,
    city: "تبوك",
    online: true,
    offline: true,
    stages: ["ثانوي", "جامعي"],
    gender: "male",
  }),
  make({
    id: "yaser-saber",
    name: "ياسر صابر",
    role: "معلم متميز",
    img: "/assets/imgs/ياسر صابر.jpeg",
    subjects: ["تأسيس", "متابعة", "رياضيات"],
    rating: "4.8",
    students: "خبرة واسعة",
    bio: "مدرس خبير يركز على تحسين مستوى الطلاب وتطوير مهاراتهم الدراسية بشكل ملحوظ.",
    badge: "معلم متميز",
    experienceYears: 12,
    city: "تبوك",
    online: true,
    offline: true,
    stages: ["ابتدائي", "متوسط"],
    gender: "male",
  }),
  make({
    id: "ahmed-hashem",
    name: "أحمد هاشم سباق",
    role: "مدرس أساسي — ابتدائي",
    img: "/assets/imgs/ahmed-hashem.jpg",
    subjects: ["لغتي", "رياضيات", "تأسيس"],
    rating: "5.0",
    students: "20+",
    bio: "يركّز على تعليم الأطفال بطريقة تفاعلية تضمن الفهم العميق، مما يبني أساساً قويًا في القراءة والكتابة والحساب.",
    badge: "مدرس تأسيس",
    experienceYears: 10,
    city: "تبوك",
    online: true,
    offline: true,
    stages: ["ابتدائي"],
    gender: "male",
  }),
  make({
    id: "ramadan-al-hawari",
    name: "رمضان الهواري",
    role: "مدرس لغة إنجليزية + ترجمة",
    img: "/assets/imgs/رمضان الهوارى.jpeg",
    subjects: ["لغة إنجليزية"],
    rating: "5.0",
    students: "30+",
    bio: "خبرة في التعليم الأكاديمي والترجمة مع أسلوب تفاعلي يضمن أعلى استفادة للطالب.",
    badge: "تفاعلي",
    experienceYears: 10,
    city: "السعودية",
    online: true,
    offline: true,
    stages: ["متوسط", "ثانوي"],
    gender: "male"
  }),
  make({
    id: "abdelmonem-hossam",
    name: "عبدالمنعم حسام",
    role: "مدرس إنجليزي + رياضيات",
    img: "/assets/imgs/عبدالمنعم حسام.jpeg",
    subjects: ["لغة إنجليزية", "رياضيات"],
    rating: "5.0",
    students: "25+",
    bio: "خبرة 9 سنوات في تبسيط المواد العلمية واللغوية وتحسين مستوى الطلاب.",
    badge: "متعدد المهارات",
    experienceYears: 9,
    city: "السعودية",
    online: true,
    offline: true,
    stages: ["ابتدائي", "متوسط"],
    gender: "male"
  }),
  make({
    id: "mohammed-abdelhakim",
    name: "محمد عبد الحكيم",
    role: "مدرس أحياء + تأسيس",
    img: "/assets/imgs/محمد عبد الحكيم.jpeg",
    subjects: ["أحياء", "تأسيس"],
    rating: "5.0",
    students: "25+",
    bio: "خبرة 6 سنوات في المملكة، يركز على تبسيط الأحياء وبناء أساس قوي للطلاب.",
    badge: "مدرس نشط",
    experienceYears: 6,
    city: "السعودية",
    online: true,
    offline: true,
    stages: ["ابتدائي", "متوسط", "ثانوي"],
    gender: "male"
  }),
  make({
    id: "osama-ali",
    name: "أسامة علي عبدالجواد",
    role: "علوم وأحياء وقرآن كريم",
    img: "/assets/imgs/osama ali.jpg",
    subjects: ["علوم", "أحياء", "قرآن", "تجويد"],
    rating: "4.8",
    students: "5+ سنوات",
    bio: "يجمع بين العلوم الأكاديمية والتربوية، مع خبرة في تحفيظ القرآن والتجويد بأسلوب شيّق.",
    badge: "محفظ قرآن",
    experienceYears: 5,
    city: "تبوك",
    online: true,
    offline: false,
    stages: ["ابتدائي", "متوسط"],
    gender: "male",
  }),
  make({
    id: "mohammed-ahmed-saad",
    name: "محمد أحمد سعد",
    role: "متخصص قدرات + تحصيلي + علوم",
    img: "/assets/imgs/محمد  احمد سعد.jpg",
    subjects: ["قدرات", "تحصيلي", "علوم"],
    rating: "4.9",
    students: "5 سنوات خبرة",
    bio: "يساعد الطلاب على تحسين نتائجهم من خلال التدريب المكثف على نماذج الاختبارات الحديثة.",
    badge: "خبير قدرات",
    experienceYears: 5,
    city: "تبوك",
    online: true,
    offline: true,
    stages: ["ثانوي", "جامعي"],
    gender: "male",
  }),
  make({
    id: "hashem-sewak",
    name: "هاشم السواق",
    role: "متخصص في مادة الكيمياء",
    img: "/assets/imgs/هاشم السواق.jpg",
    subjects: ["كيمياء", "علوم"],
    rating: "4.8",
    students: "3 سنوات خبرة",
    bio: "يقدّم شرحًا مبسطًا لمادة الكيمياء يساعد الطلاب على فهم الأساسيات بسهولة وتحقيق نتائج أفضل.",
    badge: "مدرس كيمياء",
    experienceYears: 3,
    city: "تبوك",
    online: false,
    offline: true,
    stages: ["ثانوي"],
    gender: "male",
  }),
  make({
    id: "mahmoud-muslim",
    name: "محمود مسلم",
    role: "معلم أحياء للمرحلة الثانوية",
    img: "/assets/imgs/محمود مسلم.jpeg",
    subjects: ["أحياء", "تحصيلي", "علوم"],
    rating: "4.9",
    students: "3 سنوات خبرة",
    bio: "حاصل على الرخصة المهنية التعليمية تخصص الأحياء، يتميز بمستوى ممتاز في المادة العلمية.",
    badge: "خبير أحياء",
    experienceYears: 3,
    city: "تبوك",
    online: true,
    offline: false,
    stages: ["ثانوي"],
    gender: "male",
  }),
  make({
    id: "fatouh-qutb",
    name: "فتوح قطب البسيوني",
    role: "معلم خبير",
    img: "/assets/imgs/فتوح قطب البسيوني.jpg",
    subjects: ["لغة عربية", "تأسيس"],
    rating: "5.0",
    students: "خبرة طويلة",
    bio: "معلم قدير يمتلك سنوات طويلة من الخبرة في التعليم وبناء مهارات الطلاب الأساسية.",
    badge: "خبير تعليمي",
    experienceYears: 3,
    city: "تبوك",
    online: true,
    offline: true,
    stages: ["ابتدائي", "متوسط", "ثانوي"],
    gender: "male",
  }),
];
