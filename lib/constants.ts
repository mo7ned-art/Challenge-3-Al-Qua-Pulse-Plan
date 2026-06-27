// Bilingual option catalogs for the Al Qua'a Pulse survey + dashboards.
// Every option carries a stable `value` (stored in DB) plus en/ar labels.

export interface Option {
  value: string
  en: string
  ar: string
  icon?: string
  color?: string
  examples?: string[]
}

export const RESPONDENT_TYPES: Option[] = [
  { value: "resident", en: "Resident", ar: "مقيم" },
  { value: "farmer", en: "Farmer", ar: "مزارع" },
  { value: "student", en: "Student", ar: "طالب" },
  { value: "entrepreneur", en: "Entrepreneur", ar: "رائد أعمال" },
  { value: "visitor", en: "Visitor", ar: "زائر" },
  { value: "other", en: "Other", ar: "أخرى" },
]

export const AREAS: Option[] = [
  { value: "al_quaa_center", en: "Al Qua'a center", ar: "مركز Al Qua'a" },
  { value: "farms_north", en: "Farms north", ar: "المزارع الشمالية" },
  { value: "farms_south", en: "Farms south", ar: "المزارع الجنوبية" },
  { value: "roadside", en: "Roadside / highway area", ar: "منطقة الطريق السريع" },
  { value: "near_school", en: "Near school / community area", ar: "بالقرب من المدرسة / المجتمع" },
  { value: "prefer_not_say", en: "Prefer not to say", ar: "أفضل عدم القول" },
  { value: "other", en: "Other", ar: "أخرى" },
]

export const CATEGORIES: Option[] = [
  {
    value: "farm_camel",
    en: "Farm & camel needs",
    ar: "احتياجات المزارع والإبل",
    icon: "🐪",
    color: "oklch(0.65 0.13 80)",
    examples: ["Camel feed delivery", "Vet contact", "Water delivery"],
  },
  {
    value: "repairs",
    en: "Repairs & maintenance",
    ar: "الصيانة والإصلاح",
    icon: "🔧",
    color: "oklch(0.55 0.1 250)",
    examples: ["AC repair", "Tire repair", "Plumbing"],
  },
  {
    value: "food_groceries",
    en: "Food & groceries",
    ar: "الطعام والبقالة",
    icon: "🛒",
    color: "oklch(0.6 0.13 30)",
    examples: ["Grocery delivery", "Fresh bread", "Family meals"],
  },
  {
    value: "transport_delivery",
    en: "Transport & delivery",
    ar: "النقل والتوصيل",
    icon: "🚚",
    color: "oklch(0.5 0.1 280)",
    examples: ["Ride to Al Ain", "Prescription pickup", "Package delivery"],
  },
  {
    value: "education_tutoring",
    en: "Education & tutoring",
    ar: "التعليم والدروس",
    icon: "📚",
    color: "oklch(0.55 0.13 150)",
    examples: ["Math tutoring", "English tutoring", "Digital skills"],
  },
  {
    value: "health_wellness",
    en: "Health & wellness",
    ar: "الصحة والعافية",
    icon: "🩺",
    color: "oklch(0.6 0.14 200)",
    examples: ["Home nurse", "Medicine delivery", "Walking group"],
  },
  {
    value: "tourism_stargazing",
    en: "Tourism & stargazing",
    ar: "السياحة ومراقبة النجوم",
    icon: "✨",
    color: "oklch(0.45 0.12 280)",
    examples: ["Stargazing guide", "Visitor parking", "Telescope rental"],
  },
  {
    value: "events_community",
    en: "Events & community",
    ar: "الفعاليات والمجتمع",
    icon: "🎪",
    color: "oklch(0.7 0.15 85)",
    examples: ["Local events", "Family activities", "Sports"],
  },
  {
    value: "government_paperwork",
    en: "Government / paperwork help",
    ar: "مساعدة حكومية / معاملات",
    icon: "📄",
    color: "oklch(0.5 0.05 250)",
    examples: ["Online forms", "Translation", "Document scanning"],
  },
  {
    value: "other",
    en: "Other",
    ar: "أخرى",
    icon: "💡",
    color: "oklch(0.55 0.05 250)",
  },
]

export const FREQUENCIES: Option[] = [
  { value: "daily", en: "Daily", ar: "يوميًا" },
  { value: "weekly", en: "Weekly", ar: "أسبوعيًا" },
  { value: "monthly", en: "Monthly", ar: "شهريًا" },
  { value: "seasonal", en: "Seasonal", ar: "موسمي" },
  { value: "one_time", en: "One-time", ar: "مرة واحدة" },
  { value: "not_sure", en: "Not sure", ar: "غير متأكد" },
]

export const PROVIDER_ANSWERS: Option[] = [
  { value: "yes", en: "Yes", ar: "نعم" },
  { value: "no", en: "No", ar: "لا" },
  { value: "not_sure", en: "Not sure", ar: "غير متأكد" },
]

export const WTP_RANGES: Option[] = [
  { value: "0", en: "0 / not willing to pay", ar: "0 / غير مستعد للدفع" },
  { value: "under_25", en: "Under 25 AED", ar: "أقل من 25 درهم" },
  { value: "25_50", en: "25–50 AED", ar: "25–50 درهم" },
  { value: "50_100", en: "50–100 AED", ar: "50–100 درهم" },
  { value: "100_250", en: "100–250 AED", ar: "100–250 درهم" },
  { value: "250_plus", en: "250+ AED", ar: "+250 درهم" },
  { value: "not_sure", en: "Not sure", ar: "غير متأكد" },
]

const ALL = [
  ...RESPONDENT_TYPES,
  ...AREAS,
  ...CATEGORIES,
  ...FREQUENCIES,
  ...PROVIDER_ANSWERS,
  ...WTP_RANGES,
]

export function labelFor(value: string | null | undefined, lang: "en" | "ar"): string {
  if (!value) return "—"
  const found = ALL.find((o) => o.value === value)
  if (!found) return value
  return lang === "ar" ? found.ar : found.en
}

export function categoryLabel(value: string, lang: "en" | "ar"): string {
  const c = CATEGORIES.find((o) => o.value === value)
  return c ? (lang === "ar" ? c.ar : c.en) : value
}

export function categoryIcon(value: string): string {
  const c = CATEGORIES.find((o) => o.value === value)
  return c?.icon ?? "💡"
}

export function categoryColor(value: string): string {
  const c = CATEGORIES.find((o) => o.value === value)
  return c?.color ?? "oklch(0.55 0.05 250)"
}

export function areaLabel(value: string, lang: "en" | "ar"): string {
  const a = AREAS.find((o) => o.value === value)
  return a ? (lang === "ar" ? a.ar : a.en) : value
}

// Numeric weight for willingness-to-pay used in opportunity scoring.
export const WTP_WEIGHT: Record<string, number> = {
  "0": 0,
  "not_sure": 0,
  "under_25": 0.25,
  "25_50": 0.4,
  "50_100": 0.6,
  "100_250": 0.8,
  "250_plus": 1,
}

// Frequency weight for "recurring demand" scoring.
export const RECURRING_FREQUENCIES = new Set(["daily", "weekly", "monthly", "seasonal"])

// Provider-gap indicator: no provider or not sure.
export function isProviderGap(p: string | null | undefined): boolean {
  return p === "no" || p === "not_sure"
}
