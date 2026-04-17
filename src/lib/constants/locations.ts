export interface City {
  value: string;
  label: string;
  region: string;
}

export interface RegionGroup {
  region: string;
  cities: City[];
}

/**
 * Saudi Arabia regions, cities, and common neighborhoods.
 */
export const SAUDI_REGIONS: RegionGroup[] = [
  {
    region: "منطقة الرياض",
    cities: [
      { value: "riyadh", label: "الرياض", region: "منطقة الرياض" },
      { value: "kharj", label: "الخرج", region: "منطقة الرياض" },
      { value: "dawadmi", label: "الدوادمي", region: "منطقة الرياض" },
      { value: "majmaah", label: "المجمعة", region: "منطقة الرياض" },
      { value: "zulfi", label: "الزلفي", region: "منطقة الرياض" },
      { value: "wadi-dawasir", label: "وادي الدواسر", region: "منطقة الرياض" },
      { value: "aflaj", label: "الأفلاج", region: "منطقة الرياض" },
      { value: "hotat-bani-tamim", label: "حوطة بني تميم", region: "منطقة الرياض" },
    ],
  },
  {
    region: "منطقة مكة المكرمة",
    cities: [
      { value: "makkah", label: "مكة المكرمة", region: "منطقة مكة المكرمة" },
      { value: "jeddah", label: "جدة", region: "منطقة مكة المكرمة" },
      { value: "taif", label: "الطائف", region: "منطقة مكة المكرمة" },
      { value: "rabigh", label: "رابغ", region: "منطقة مكة المكرمة" },
      { value: "qunfudhah", label: "القنفذة", region: "منطقة مكة المكرمة" },
      { value: "laith", label: "الليث", region: "منطقة مكة المكرمة" },
    ],
  },
  {
    region: "المنطقة الشرقية",
    cities: [
      { value: "dammam", label: "الدمام", region: "المنطقة الشرقية" },
      { value: "dhahran", label: "الظهران", region: "المنطقة الشرقية" },
      { value: "khobar", label: "الخبر", region: "المنطقة الشرقية" },
      { value: "jubail", label: "الجبيل", region: "المنطقة الشرقية" },
      { value: "qatif", label: "القطيف", region: "المنطقة الشرقية" },
      { value: "hafr-albatin", label: "حفر الباطن", region: "المنطقة الشرقية" },
      { value: "ahsa", label: "الأحساء", region: "المنطقة الشرقية" },
      { value: "ras-tanura", label: "رأس تنورة", region: "المنطقة الشرقية" },
      { value: "khafji", label: "الخفجي", region: "المنطقة الشرقية" },
    ],
  },
  {
    region: "منطقة المدينة المنورة",
    cities: [
      { value: "madinah", label: "المدينة المنورة", region: "منطقة المدينة المنورة" },
      { value: "yanbu", label: "ينبع", region: "منطقة المدينة المنورة" },
      { value: "ula", label: "العلا", region: "منطقة المدينة المنورة" },
      { value: "badr", label: "بدر", region: "منطقة المدينة المنورة" },
      { value: "mahd-dhahab", label: "مهد الذهب", region: "منطقة المدينة المنورة" },
    ],
  },
  {
    region: "منطقة القصيم",
    cities: [
      { value: "buraidah", label: "بريدة", region: "منطقة القصيم" },
      { value: "unaizah", label: "عنيزة", region: "منطقة القصيم" },
      { value: "rass", label: "الرس", region: "منطقة القصيم" },
      { value: "bukayriyah", label: "البكيرية", region: "منطقة القصيم" },
      { value: "badaie", label: "البدائع", region: "منطقة القصيم" },
    ],
  },
  {
    region: "منطقة عسير",
    cities: [
      { value: "abha", label: "أبها", region: "منطقة عسير" },
      { value: "khamis-mushait", label: "خميس مشيط", region: "منطقة عسير" },
      { value: "bishah", label: "بيشة", region: "منطقة عسير" },
      { value: "namas", label: "النماص", region: "منطقة عسير" },
      { value: "muhayil", label: "محايل عسير", region: "منطقة عسير" },
      { value: "sarat-abidah", label: "سراة عبيدة", region: "منطقة عسير" },
    ],
  },
  {
    region: "منطقة تبوك",
    cities: [
      { value: "tabuk", label: "تبوك", region: "منطقة تبوك" },
      { value: "umluj", label: "أملج", region: "منطقة تبوك" },
      { value: "wajh", label: "الوجه", region: "منطقة تبوك" },
      { value: "duba", label: "ضباء", region: "منطقة تبوك" },
      { value: "tayma", label: "تيماء", region: "منطقة تبوك" },
      { value: "haql", label: "حقل", region: "منطقة تبوك" },
    ],
  },
  {
    region: "منطقة حائل",
    cities: [
      { value: "hail", label: "حائل", region: "منطقة حائل" },
      { value: "baqaa", label: "بقعاء", region: "منطقة حائل" },
      { value: "ghazaleh", label: "الغزالة", region: "منطقة حائل" },
    ],
  },
  {
    region: "منطقة جازان",
    cities: [
      { value: "jazan", label: "جازان", region: "منطقة جازان" },
      { value: "sabya", label: "صبيا", region: "منطقة جازان" },
      { value: "abu-arish", label: "أبو عريش", region: "منطقة جازان" },
      { value: "samtah", label: "صامطة", region: "منطقة جازان" },
    ],
  },
  {
    region: "منطقة نجران",
    cities: [
      { value: "najran", label: "نجران", region: "منطقة نجران" },
      { value: "sharurah", label: "شرورة", region: "منطقة نجران" },
    ],
  },
  {
    region: "منطقة الباحة",
    cities: [
      { value: "baha", label: "الباحة", region: "منطقة الباحة" },
      { value: "baljurashi", label: "بلجرشي", region: "منطقة الباحة" },
      { value: "mandaq", label: "المندق", region: "منطقة الباحة" },
    ],
  },
  {
    region: "منطقة الجوف",
    cities: [
      { value: "skaka", label: "سكاكا", region: "منطقة الجوف" },
      { value: "dumat-jandal", label: "دومة الجندل", region: "منطقة الجوف" },
      { value: "qurayyat", label: "القريات", region: "منطقة الجوف" },
    ],
  },
  {
    region: "منطقة الحدود الشمالية",
    cities: [
      { value: "arar", label: "عرعر", region: "منطقة الحدود الشمالية" },
      { value: "rafha", label: "رفحاء", region: "منطقة الحدود الشمالية" },
      { value: "turaif", label: "طريف", region: "منطقة الحدود الشمالية" },
    ],
  },
];

/** Common neighborhoods per major city */
export const NEIGHBORHOODS: Record<string, string[]> = {
  riyadh: [
    "العليا", "السليمانية", "الملز", "النسيم", "الروضة", "المروج", "الورود",
    "الياسمين", "النرجس", "العقيق", "الصحافة", "الملقا", "حطين", "الرمال",
    "لبن", "السويدي", "الشفا", "العزيزية", "الدار البيضاء", "المنصورة",
    "الربوة", "الحمراء", "المعذر", "أم الحمام", "الغدير", "قرطبة",
  ],
  jeddah: [
    "الحمراء", "الروضة", "الشرفية", "النزهة", "البغدادية", "السلامة",
    "الفيصلية", "المرجان", "أبحر الشمالية", "أبحر الجنوبية", "الصفا",
    "المروة", "الأندلس", "الخالدية", "الربوة", "بني مالك", "الزهراء",
    "المحمدية", "الأجاويد", "البوادي",
  ],
  makkah: [
    "العزيزية", "الشوقية", "الرصيفة", "الكعكية", "النوارية",
    "الخالدية", "الهجرة", "العوالي", "الطندباوي", "بطحاء قريش",
  ],
  madinah: [
    "العوالي", "قباء", "العريض", "أبيار علي", "سيد الشهداء",
    "الدفاع", "العنابس", "الخالدية", "الحرة الشرقية", "الجمعة",
  ],
  dammam: [
    "الشاطئ", "الفيصلية", "المنار", "الأمير محمد بن سعود", "البديع",
    "الخليج", "الأثير", "النخيل", "المريكبات", "العنود", "الجلوية",
  ],
  khobar: [
    "الحزام الذهبي", "العقربية", "الروابي", "التحلية", "اليرموك",
    "الخزامى", "الثقبة", "البندرية", "الحمراء", "الجسر",
  ],
  tabuk: [
    "المروج", "العليا", "القادسية", "المصيف", "الروضة", "التعاون",
    "النهضة", "الياسمين", "الربوة", "النور", "السلام", "المنتزه",
    "الفيصلية", "المحمدية", "الورود", "الخالدية",
  ],
  abha: [
    "المنسك", "الخالدية", "المفتاحة", "الشرقية", "الضباب",
    "السد", "الموظفين", "المنهل", "النسيم", "السلام",
  ],
  buraidah: [
    "السالمية", "الصفراء", "النقع", "المنتزه", "الخبيب",
    "الإسكان", "الحزم", "البصر", "هجرة",
  ],
  hail: [
    "المطار القديم", "السمراء", "المنتزه", "الزبارة", "الوسيطاء",
    "البادية", "النقرة", "الخزامى",
  ],
  jubail: [
    "الحويلات", "الفناتير", "الدانة", "الفاخرية", "الدفي",
  ],
};

/** Flat list of all cities for simple dropdowns */
export const ALL_CITIES: City[] = SAUDI_REGIONS.flatMap((r) => r.cities);

/** Get neighborhoods for a city value */
export function getNeighborhoods(cityValue: string): string[] {
  return NEIGHBORHOODS[cityValue] ?? [];
}

/** Get city label from value */
export function getCityLabel(value: string): string {
  return ALL_CITIES.find((c) => c.value === value)?.label ?? value;
}
