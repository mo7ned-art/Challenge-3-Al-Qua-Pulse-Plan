// Realistic, clearly-labeled demo seed data for Al Qua'a Pulse.
// Every record has `source_type: "demo"` so it can never be confused with
// real community validation. 20 entries: 10 English + 10 Arabic across
// all categories and areas.

import type { SurveyResponse } from "../types"

let counter = 0
const id = () => `seed-${(++counter).toString().padStart(3, "0")}`

interface Seed {
  language: "en" | "ar"
  respondent_type: string
  area: string
  category: string
  need_title: string
  need_description: string
  urgency: number
  frequency: string
  has_local_provider: "yes" | "no" | "not_sure"
  willingness_to_pay_range: string
  contact_permission?: boolean
  contact_name?: string
  contact_phone?: string
  extra_note?: string
}

const SEEDS: Seed[] = [
  // ── English submissions (10) ───────────────────────────────────

  { language: "en", respondent_type: "farmer", area: "farms_north", category: "farm_camel",
    need_title: "Camel feed delivery", need_description: "Weekly delivery of barley and hay to the north farms. No one currently delivers this far.", urgency: 5, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "100_250" },

  { language: "en", respondent_type: "resident", area: "al_quaa_center", category: "repairs",
    need_title: "AC repair in summer", need_description: "AC breaks down often, and the nearest technician is in Al Ain. Need a fast call-out service.", urgency: 5, frequency: "seasonal", has_local_provider: "no", willingness_to_pay_range: "100_250" },

  { language: "en", respondent_type: "resident", area: "farms_south", category: "food_groceries",
    need_title: "Weekly grocery delivery", need_description: "A shared route that delivers groceries from Al Ain once a week for the south farms.", urgency: 4, frequency: "weekly", has_local_provider: "not_sure", willingness_to_pay_range: "50_100" },

  { language: "en", respondent_type: "resident", area: "al_quaa_center", category: "transport_delivery",
    need_title: "Shared ride to Al Ain", need_description: "Reliable shared ride to Al Ain for hospital visits and shopping trips.", urgency: 4, frequency: "weekly", has_local_provider: "not_sure", willingness_to_pay_range: "25_50" },

  { language: "en", respondent_type: "student", area: "near_school", category: "education_tutoring",
    need_title: "Math tutoring for grade 9", need_description: "Small group tutoring in math, 2-3 students per session, weekly after school.", urgency: 4, frequency: "weekly", has_local_provider: "not_sure", willingness_to_pay_range: "50_100" },

  { language: "en", respondent_type: "resident", area: "farms_north", category: "health_wellness",
    need_title: "Home nurse visit", need_description: "Periodic home visit by a nurse for elderly family members on the farms.", urgency: 4, frequency: "monthly", has_local_provider: "no", willingness_to_pay_range: "100_250" },

  { language: "en", respondent_type: "visitor", area: "roadside", category: "tourism_stargazing",
    need_title: "Stargazing guide service", need_description: "A local guide who can take visitors to dark-sky spots and explain constellations.", urgency: 2, frequency: "seasonal", has_local_provider: "no", willingness_to_pay_range: "100_250" },

  { language: "en", respondent_type: "resident", area: "al_quaa_center", category: "events_community",
    need_title: "Weekend youth football", need_description: "Organised weekend football matches for the youth of Al Qua'a.", urgency: 2, frequency: "weekly", has_local_provider: "not_sure", willingness_to_pay_range: "0" },

  { language: "en", respondent_type: "entrepreneur", area: "al_quaa_center", category: "government_paperwork",
    need_title: "Business license consultation", need_description: "Help understanding trade license requirements for starting a small home kitchen business.", urgency: 4, frequency: "one_time", has_local_provider: "not_sure", willingness_to_pay_range: "50_100" },

  { language: "en", respondent_type: "resident", area: "farms_south", category: "other",
    need_title: "Pet care tips in summer", need_description: "Local advice and services for keeping cats and dogs healthy in summer heat.", urgency: 2, frequency: "monthly", has_local_provider: "not_sure", willingness_to_pay_range: "under_25" },

  // ── Arabic submissions (10) ────────────────────────────────────

  { language: "ar", respondent_type: "farmer", area: "farms_south", category: "farm_camel",
    need_title: "تأجير معدات حراثة", need_description: "أحتاج تأجير محراث صغير لفترة قصيرة بدل الشراء الكامل", urgency: 3, frequency: "seasonal", has_local_provider: "not_sure", willingness_to_pay_range: "100_250" },

  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "repairs",
    need_title: "صيانة مضخات المياه", need_description: "فني متخصص في إصلاح وصيانة مضخات مياه الآبار والمزارع", urgency: 5, frequency: "monthly", has_local_provider: "not_sure", willingness_to_pay_range: "100_250" },

  { language: "ar", respondent_type: "resident", area: "farms_north", category: "food_groceries",
    need_title: "توصيل خضار طازجة", need_description: "أحتاج توصيل خضار طازجة من سوق العين كل ثلاثاء للمزارع الشمالية", urgency: 4, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "25_50" },

  { language: "ar", respondent_type: "resident", area: "farms_south", category: "transport_delivery",
    need_title: "توصيل طلبات أمازون", need_description: "نقطة استلام محلية لطلبات التسوق الإلكتروني بدلاً من السفر للعين", urgency: 4, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "under_25" },

  { language: "ar", respondent_type: "student", area: "near_school", category: "education_tutoring",
    need_title: "دورة تصميم جرافيك", need_description: "دورة أساسية في التصميم الجرافيكي للشباب خلال العطلة الصيفية", urgency: 2, frequency: "seasonal", has_local_provider: "no", willingness_to_pay_range: "100_250" },

  { language: "ar", respondent_type: "resident", area: "farms_north", category: "health_wellness",
    need_title: "صيدلية متنقلة", need_description: "صيدلية متنقلة تمر على المزارع مرتين في الأسبوع لتوفير الأدوية", urgency: 5, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "50_100" },

  { language: "ar", respondent_type: "visitor", area: "roadside", category: "tourism_stargazing",
    need_title: "جولة تخييم صحراوي", need_description: "تنظيم رحلات تخييم ليلية في الصحراء للعائلات والسيّاح", urgency: 3, frequency: "seasonal", has_local_provider: "no", willingness_to_pay_range: "250_plus" },

  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "events_community",
    need_title: "سوق شعبي أسبوعي", need_description: "سوق صغير كل جمعة لبيع المنتجات المحلية والحرف اليدوية", urgency: 3, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "under_25" },

  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "government_paperwork",
    need_title: "مساعدة في النماذج الإلكترونية", need_description: "لا أتعامل مع المواقع الحكومية جيدًا وأحتاج مساعدة في تعبئة المعاملات", urgency: 4, frequency: "monthly", has_local_provider: "no", willingness_to_pay_range: "25_50" },

  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "other",
    need_title: "مطعم وجبات منزلية", need_description: "مطبخ منزلي يوفر وجبات يومية طازجة بأسعار معقولة للعائلات", urgency: 3, frequency: "daily", has_local_provider: "no", willingness_to_pay_range: "25_50" },
]

// Build SurveyResponse objects from the seed entries
export const SEED_RESPONSES: SurveyResponse[] = SEEDS.map((s, i) => {
  const now = new Date()
  now.setDate(now.getDate() - 14 + Math.floor(i * 14 / SEEDS.length)) // spread over 14 days
  now.setHours(7 + (i % 14), (i * 17) % 60, 0, 0)
  return {
    id: id(),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    source_type: "demo" as const,
    language: s.language,
    respondent_type: s.respondent_type,
    area: s.area,
    category: s.category,
    need_title: s.need_title,
    need_description: s.need_description,
    urgency: s.urgency,
    frequency: s.frequency,
    has_local_provider: s.has_local_provider,
    willingness_to_pay_range: s.willingness_to_pay_range,
    contact_permission: s.contact_permission ?? false,
    contact_name: s.contact_name ?? null,
    contact_phone: s.contact_phone ?? null,
    contact_email: null,
    extra_note: s.extra_note ?? null,
    is_private: !(s.contact_permission ?? false),
    is_deleted: false,
  }
})
