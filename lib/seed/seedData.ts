// Realistic, clearly-labeled demo seed data for Al Qua'a Pulse.
// Every record has `source_type: "demo"` so it can never be confused with
// real community validation. The volume (40) covers all 10 categories and
// the 5 areas of the survey.

import type { SurveyResponse } from "../types"

let counter = 0
const id = () => `seed-${(++counter).toString().padStart(3, "0")}`
const baseDate = new Date()
baseDate.setDate(baseDate.getDate() - 14) // seed 14 days ago as starting point

function daysAgo(d: number): string {
  const dt = new Date(baseDate)
  dt.setDate(dt.getDate() + d)
  return dt.toISOString()
}

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
  // Farm & camel — high demand
  { language: "ar", respondent_type: "farmer", area: "farms_north", category: "farm_camel",
    need_title: "توصيل أعلاف الإبل", need_description: "أحتاج توصيل أعلاف الإبل أسبوعيًا، لا يوجد من يوصل للمزارع البعيدة", urgency: 5, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "100_250", contact_permission: true, contact_name: "سالم", contact_phone: "+9715xxxxxxxx" },
  { language: "en", respondent_type: "farmer", area: "farms_south", category: "farm_camel",
    need_title: "Camel feed delivery", need_description: "Weekly delivery of barley and hay to the south farms. Truck access is limited.", urgency: 5, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "100_250" },
  { language: "en", respondent_type: "farmer", area: "farms_north", category: "farm_camel",
    need_title: "Vet contact for camels", need_description: "Emergency vet contact when a camel gets sick. Hard to reach anyone quickly.", urgency: 5, frequency: "seasonal", has_local_provider: "not_sure", willingness_to_pay_range: "250_plus" },
  { language: "en", respondent_type: "farmer", area: "farms_south", category: "farm_camel",
    need_title: "Group buy of animal feed", need_description: "Coordinate with 3-4 neighbors to buy feed in bulk at lower cost.", urgency: 4, frequency: "monthly", has_local_provider: "not_sure", willingness_to_pay_range: "100_250" },
  { language: "ar", respondent_type: "farmer", area: "farms_north", category: "farm_camel",
    need_title: "تنسيق توصيل مياه المزرعة", need_description: "أحتاج تنسيق توصيل المياه للمزرعة في الصيف، والتكلفة تكون مرتفعة", urgency: 4, frequency: "seasonal", has_local_provider: "no", willingness_to_pay_range: "100_250" },
  { language: "en", respondent_type: "farmer", area: "farms_south", category: "farm_camel",
    need_title: "Fence repair service", need_description: "Fences break often; need a local handyman familiar with farms.", urgency: 3, frequency: "seasonal", has_local_provider: "yes", willingness_to_pay_range: "50_100" },
  { language: "en", respondent_type: "farmer", area: "farms_north", category: "farm_camel",
    need_title: "Farm equipment maintenance", need_description: "Tractor and pump maintenance. Drives to Al Ain are long.", urgency: 3, frequency: "seasonal", has_local_provider: "not_sure", willingness_to_pay_range: "100_250" },

  // Repairs
  { language: "en", respondent_type: "resident", area: "al_quaa_center", category: "repairs",
    need_title: "AC repair in summer", need_description: "AC breaks down often, and the nearest technician is far. Need a fast call-out.", urgency: 5, frequency: "seasonal", has_local_provider: "no", willingness_to_pay_range: "100_250" },
  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "repairs",
    need_title: "إصلاح المكيف", need_description: "المكيف يعطل كثيرًا والفني يبعد. أحتاج حجز سريع", urgency: 5, frequency: "seasonal", has_local_provider: "no", willingness_to_pay_range: "100_250" },
  { language: "en", respondent_type: "resident", area: "farms_north", category: "repairs",
    need_title: "Generator repair", need_description: "Generator fails during sandstorms. Need someone who can come on weekends.", urgency: 4, frequency: "monthly", has_local_provider: "not_sure", willingness_to_pay_range: "100_250" },
  { language: "en", respondent_type: "resident", area: "al_quaa_center", category: "repairs",
    need_title: "Mobile tire repair", need_description: "A mobile tire service that comes to the house would save a 40-km drive.", urgency: 4, frequency: "monthly", has_local_provider: "not_sure", willingness_to_pay_range: "50_100" },
  { language: "en", respondent_type: "resident", area: "farms_south", category: "repairs",
    need_title: "Water tank cleaning", need_description: "Tanks need cleaning every 6 months. Hard to schedule. Forget when it's due.", urgency: 3, frequency: "seasonal", has_local_provider: "yes", willingness_to_pay_range: "100_250" },
  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "repairs",
    need_title: "سباكة", need_description: "أحتاج سبّاك محلي موثوق", urgency: 3, frequency: "monthly", has_local_provider: "yes", willingness_to_pay_range: "50_100" },
  { language: "en", respondent_type: "resident", area: "farms_north", category: "repairs",
    need_title: "Electrical maintenance", need_description: "Frequent trips and old wiring. Need a qualified electrician.", urgency: 4, frequency: "monthly", has_local_provider: "not_sure", willingness_to_pay_range: "100_250" },

  // Food & groceries
  { language: "en", respondent_type: "resident", area: "farms_north", category: "food_groceries",
    need_title: "Weekly grocery delivery", need_description: "A shared route that delivers groceries from Al Ain once a week.", urgency: 4, frequency: "weekly", has_local_provider: "not_sure", willingness_to_pay_range: "50_100" },
  { language: "ar", respondent_type: "resident", area: "farms_south", category: "food_groceries",
    need_title: "توصيل بقالة أسبوعي", need_description: "توصيل مواد البقالة من العين مرة في الأسبوع", urgency: 4, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "50_100" },
  { language: "en", respondent_type: "resident", area: "al_quaa_center", category: "food_groceries",
    need_title: "Fresh bread delivery", need_description: "Hot bread delivered in the morning, like a small local bakery route.", urgency: 3, frequency: "daily", has_local_provider: "not_sure", willingness_to_pay_range: "under_25" },
  { language: "en", respondent_type: "resident", area: "farms_north", category: "food_groceries",
    need_title: "Bulk household supplies", need_description: "Group buying of cleaning supplies and rice for 4-5 families.", urgency: 2, frequency: "monthly", has_local_provider: "yes", willingness_to_pay_range: "100_250" },

  // Transport & delivery
  { language: "en", respondent_type: "resident", area: "farms_north", category: "transport_delivery",
    need_title: "Ride to Al Ain", need_description: "Reliable shared ride to Al Ain for hospital visits and shopping.", urgency: 4, frequency: "weekly", has_local_provider: "not_sure", willingness_to_pay_range: "25_50" },
  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "transport_delivery",
    need_title: "توصيل الأدوية", need_description: "استلام الوصفة من المستشفى وتوصيل الأدوية من الصيدلية", urgency: 4, frequency: "monthly", has_local_provider: "no", willingness_to_pay_range: "25_50" },
  { language: "en", respondent_type: "resident", area: "farms_south", category: "transport_delivery",
    need_title: "Package delivery service", need_description: "Receive packages in Al Qua'a instead of driving to a courier office.", urgency: 3, frequency: "weekly", has_local_provider: "not_sure", willingness_to_pay_range: "under_25" },
  { language: "en", respondent_type: "student", area: "al_quaa_center", category: "transport_delivery",
    need_title: "School transport", need_description: "Bus or shared van for high-school students to schools in Al Ain.", urgency: 3, frequency: "daily", has_local_provider: "yes", willingness_to_pay_range: "100_250" },

  // Education & tutoring
  { language: "en", respondent_type: "student", area: "al_quaa_center", category: "education_tutoring",
    need_title: "Math tutoring for grade 9", need_description: "Small group tutoring in math, 2-3 students per session, weekly.", urgency: 4, frequency: "weekly", has_local_provider: "not_sure", willingness_to_pay_range: "50_100" },
  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "education_tutoring",
    need_title: "دروس لغة إنجليزية", need_description: "أبحث عن مدرّس لغة إنجليزية للأطفال، حصص جماعية", urgency: 3, frequency: "weekly", has_local_provider: "not_sure", willingness_to_pay_range: "50_100" },
  { language: "en", respondent_type: "student", area: "farms_north", category: "education_tutoring",
    need_title: "Exam prep sessions", need_description: "Pre-exam intensive for grade 12 students. Hard to focus at home.", urgency: 4, frequency: "seasonal", has_local_provider: "no", willingness_to_pay_range: "100_250" },
  { language: "en", respondent_type: "student", area: "al_quaa_center", category: "education_tutoring",
    need_title: "Digital skills for elders", need_description: "Help elderly parents use WhatsApp, video calls, and online forms.", urgency: 2, frequency: "monthly", has_local_provider: "not_sure", willingness_to_pay_range: "25_50" },
  { language: "en", respondent_type: "resident", area: "al_quaa_center", category: "education_tutoring",
    need_title: "Kids activity classes", need_description: "Weekend art/craft or sports activities for kids ages 6-12.", urgency: 2, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "50_100" },

  // Health & wellness
  { language: "en", respondent_type: "resident", area: "farms_south", category: "health_wellness",
    need_title: "Home nurse visit", need_description: "Periodic home visit by a nurse for elderly family members.", urgency: 4, frequency: "monthly", has_local_provider: "not_sure", willingness_to_pay_range: "100_250" },
  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "health_wellness",
    need_title: "توصيل الأدوية", need_description: "توصيل الأدوية الشهرية لكبار السن", urgency: 4, frequency: "monthly", has_local_provider: "no", willingness_to_pay_range: "25_50" },
  { language: "en", respondent_type: "resident", area: "al_quaa_center", category: "health_wellness",
    need_title: "Walking group", need_description: "A safe early-morning walking group in the cooler months.", urgency: 1, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "0" },
  { language: "en", respondent_type: "resident", area: "farms_north", category: "health_wellness",
    need_title: "Basic first-aid sessions", need_description: "Short community sessions on first aid, especially for farm injuries.", urgency: 3, frequency: "one_time", has_local_provider: "not_sure", willingness_to_pay_range: "under_25" },

  // Tourism & stargazing
  { language: "en", respondent_type: "visitor", area: "roadside", category: "tourism_stargazing",
    need_title: "Stargazing guide", need_description: "A local guide who can take visitors to dark-sky spots and explain the stars.", urgency: 2, frequency: "seasonal", has_local_provider: "no", willingness_to_pay_range: "100_250" },
  { language: "en", respondent_type: "visitor", area: "roadside", category: "tourism_stargazing",
    need_title: "Telescope rental", need_description: "A simple telescope rental for a night near Al Qua'a.", urgency: 2, frequency: "one_time", has_local_provider: "no", willingness_to_pay_range: "50_100" },
  { language: "en", respondent_type: "entrepreneur", area: "al_quaa_center", category: "tourism_stargazing",
    need_title: "Visitor parking and info", need_description: "A safe place to park and a friendly local to ask questions about the area.", urgency: 3, frequency: "seasonal", has_local_provider: "not_sure", willingness_to_pay_range: "25_50" },
  { language: "en", respondent_type: "visitor", area: "roadside", category: "tourism_stargazing",
    need_title: "Local snacks for tourists", need_description: "Small pack of dates, laban, and Arabic coffee for an authentic stop.", urgency: 2, frequency: "one_time", has_local_provider: "no", willingness_to_pay_range: "25_50" },

  // Government / paperwork
  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "government_paperwork",
    need_title: "مساعدة في تعبئة النماذج الإلكترونية", need_description: "لا أتعامل مع المواقع الحكومية جيدًا وأرغب في مساعدة", urgency: 4, frequency: "monthly", has_local_provider: "no", willingness_to_pay_range: "25_50" },
  { language: "en", respondent_type: "resident", area: "al_quaa_center", category: "government_paperwork",
    need_title: "Document scanning and printing", need_description: "A small service for scanning IDs, typing forms, and printing paperwork.", urgency: 3, frequency: "monthly", has_local_provider: "not_sure", willingness_to_pay_range: "25_50" },
  { language: "en", respondent_type: "resident", area: "al_quaa_center", category: "government_paperwork",
    need_title: "Translation help", need_description: "Translate official documents between Arabic and English.", urgency: 3, frequency: "one_time", has_local_provider: "yes", willingness_to_pay_range: "50_100" },
  { language: "en", respondent_type: "resident", area: "al_quaa_center", category: "government_paperwork",
    need_title: "License checklist support", need_description: "A short consultation on what documents are needed for a small business license.", urgency: 3, frequency: "one_time", has_local_provider: "not_sure", willingness_to_pay_range: "50_100" },

  // Events & community
  { language: "en", respondent_type: "resident", area: "al_quaa_center", category: "events_community",
    need_title: "Local football games", need_description: "A regular weekend match for the youth of Al Qua'a.", urgency: 1, frequency: "weekly", has_local_provider: "not_sure", willingness_to_pay_range: "0" },
  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "events_community",
    need_title: "فعاليات عائلية", need_description: "فعاليات للعائلات في المناسبات والأعياد", urgency: 1, frequency: "seasonal", has_local_provider: "no", willingness_to_pay_range: "0" },

  // Other
  { language: "en", respondent_type: "resident", area: "farms_south", category: "other",
    need_title: "Pet care tips", need_description: "Local advice for keeping cats and dogs healthy in summer heat.", urgency: 2, frequency: "monthly", has_local_provider: "not_sure", willingness_to_pay_range: "0" },

  // ── 20 additional demo submissions ──────────────────────────────
  { language: "ar", respondent_type: "resident", area: "farms_north", category: "food_groceries",
    need_title: "توصيل خضار طازجة", need_description: "أحتاج توصيل خضار طازجة من سوق العين كل ثلاثاء", urgency: 4, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "25_50" },
  { language: "en", respondent_type: "entrepreneur", area: "al_quaa_center", category: "tourism_stargazing",
    need_title: "Desert camping tour operator", need_description: "Need someone to organise overnight desert camping experiences for families and tourists.", urgency: 3, frequency: "seasonal", has_local_provider: "no", willingness_to_pay_range: "250_plus" },
  { language: "ar", respondent_type: "farmer", area: "farms_south", category: "farm_camel",
    need_title: "تأجير معدات حراثة", need_description: "أحتاج تأجير محراث صغير لفترة قصيرة بدل الشراء", urgency: 3, frequency: "seasonal", has_local_provider: "not_sure", willingness_to_pay_range: "100_250" },
  { language: "en", respondent_type: "student", area: "near_school", category: "education_tutoring",
    need_title: "Arabic calligraphy class", need_description: "Weekend class for kids to learn Arabic calligraphy near the school area.", urgency: 2, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "50_100" },
  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "repairs",
    need_title: "تنظيف خزانات المياه", need_description: "خدمة تنظيف وتعقيم خزانات المياه المنزلية", urgency: 4, frequency: "seasonal", has_local_provider: "not_sure", willingness_to_pay_range: "100_250" },
  { language: "en", respondent_type: "visitor", area: "roadside", category: "food_groceries",
    need_title: "Roadside café or food truck", need_description: "A small café or food truck at the highway rest stop for travellers.", urgency: 3, frequency: "one_time", has_local_provider: "no", willingness_to_pay_range: "25_50" },
  { language: "ar", respondent_type: "resident", area: "farms_north", category: "health_wellness",
    need_title: "صيدلية متنقلة", need_description: "صيدلية متنقلة تمر على المزارع مرتين في الأسبوع", urgency: 5, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "50_100" },
  { language: "en", respondent_type: "resident", area: "al_quaa_center", category: "transport_delivery",
    need_title: "Shared ride to Abu Dhabi", need_description: "Monthly shared ride to Abu Dhabi for visa and ministry appointments.", urgency: 3, frequency: "monthly", has_local_provider: "not_sure", willingness_to_pay_range: "50_100" },
  { language: "ar", respondent_type: "student", area: "near_school", category: "education_tutoring",
    need_title: "دورة تصميم جرافيك", need_description: "دورة أساسية في التصميم الجرافيكي للشباب خلال العطلة الصيفية", urgency: 2, frequency: "seasonal", has_local_provider: "no", willingness_to_pay_range: "100_250" },
  { language: "en", respondent_type: "farmer", area: "farms_south", category: "farm_camel",
    need_title: "Camel milk collection route", need_description: "A daily morning route to collect camel milk from farms and sell in Al Ain.", urgency: 4, frequency: "daily", has_local_provider: "no", willingness_to_pay_range: "100_250", contact_permission: true, contact_name: "Khalid", contact_phone: "+9715xxxxxxxx" },
  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "events_community",
    need_title: "سوق شعبي أسبوعي", need_description: "سوق صغير كل جمعة لبيع المنتجات المحلية والحرف اليدوية", urgency: 3, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "under_25" },
  { language: "en", respondent_type: "resident", area: "farms_north", category: "repairs",
    need_title: "Solar panel cleaning", need_description: "Regular cleaning of solar panels on farm rooftops, covered in dust.", urgency: 3, frequency: "monthly", has_local_provider: "no", willingness_to_pay_range: "50_100" },
  { language: "ar", respondent_type: "resident", area: "farms_south", category: "transport_delivery",
    need_title: "توصيل طلبات أمازون", need_description: "نقطة استلام محلية لطلبات التسوق الإلكتروني بدلاً من السفر للعين", urgency: 4, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "under_25" },
  { language: "en", respondent_type: "entrepreneur", area: "al_quaa_center", category: "government_paperwork",
    need_title: "Business license consultation", need_description: "Help understanding trade license requirements for a small home kitchen.", urgency: 4, frequency: "one_time", has_local_provider: "not_sure", willingness_to_pay_range: "50_100" },
  { language: "ar", respondent_type: "farmer", area: "farms_north", category: "farm_camel",
    need_title: "تركيب مظلات للإبل", need_description: "تركيب مظلات حماية من الشمس فوق حظائر الإبل", urgency: 4, frequency: "one_time", has_local_provider: "not_sure", willingness_to_pay_range: "250_plus" },
  { language: "en", respondent_type: "resident", area: "near_school", category: "health_wellness",
    need_title: "Kids swimming lessons", need_description: "Safe swimming lessons for children near the community area.", urgency: 2, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "50_100" },
  { language: "ar", respondent_type: "resident", area: "al_quaa_center", category: "food_groceries",
    need_title: "مطعم وجبات منزلية", need_description: "مطبخ منزلي يوفر وجبات يومية طازجة بأسعار معقولة", urgency: 3, frequency: "daily", has_local_provider: "no", willingness_to_pay_range: "25_50" },
  { language: "en", respondent_type: "visitor", area: "roadside", category: "tourism_stargazing",
    need_title: "Guided nature walk", need_description: "A weekend guided walk through desert trails with a local naturalist.", urgency: 2, frequency: "seasonal", has_local_provider: "no", willingness_to_pay_range: "50_100" },
  { language: "ar", respondent_type: "resident", area: "farms_south", category: "repairs",
    need_title: "صيانة مضخات المياه", need_description: "فني متخصص في إصلاح وصيانة مضخات مياه الآبار والمزارع", urgency: 5, frequency: "monthly", has_local_provider: "not_sure", willingness_to_pay_range: "100_250" },
  { language: "en", respondent_type: "student", area: "al_quaa_center", category: "events_community",
    need_title: "Youth coding club", need_description: "A weekly meetup where kids learn basic coding and robotics.", urgency: 2, frequency: "weekly", has_local_provider: "no", willingness_to_pay_range: "50_100" },
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
