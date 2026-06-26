// Opportunity clustering and scoring engine.
// For MVP, clustering uses category + simple keyword mapping against the
// need_title. The result is a deterministic, explainable set of opportunities
// ranked by transparent score.

import {
  CATEGORIES,
  RECURRING_FREQUENCIES,
  WTP_WEIGHT,
  categoryLabel,
  isProviderGap,
} from "../constants"
import type {
  Confidence,
  Opportunity,
  OpportunityCluster,
  SurveyResponse,
} from "../types"
import { generateFallbackBrief } from "./brief"

// Map of (cluster_key, category) → { title, target_customer, suggested_offer, first_actions, risks }
interface OpportunityTemplate {
  title: string
  description: string
  target_customer: string
  suggested_offer: string
  first_actions: string[]
  risks: string[]
  complexity: "Low" | "Medium" | "High"
  people: string
  tools: string
  keywords: string[] // matched against need_title (lowercased) and category
}

// Each cluster is keyed by `${category}::${slug}`
export const OPPORTUNITY_TEMPLATES: Array<OpportunityTemplate & { category: string; slug: string }> = [
  {
    category: "farm_camel",
    slug: "camel-feed-delivery",
    title: "Camel Feed Delivery Route",
    description: "A weekly delivery service that brings bulk camel feed to farms north and south of Al Qua'a.",
    target_customer: "Farm owners with 5+ camels who currently drive 40+ km to restock feed.",
    suggested_offer: "Weekly scheduled delivery, WhatsApp ordering, and group-buy pricing for 3+ farms on the same route.",
    first_actions: [
      "Call 5 farm owners to confirm the exact feed types and monthly volumes they need.",
      "Test one delivery route from Al Ain feed suppliers to farms north and south.",
      "Compare supplier cost + transport cost vs. willingness to pay (AED 100–250).",
    ],
    risks: [
      "Low initial order volume — keep vehicle cost low until 10+ farms are signed up.",
      "Seasonal demand drops in summer; consider a subscription pause option.",
      "Competition from feed shops that offer free delivery above a minimum order.",
    ],
    complexity: "Medium",
    people: "1 driver + 1 coordinator (WhatsApp orders)",
    tools: "Pickup truck or shared van, WhatsApp group, simple Google Sheet for routes",
    keywords: ["camel", "feed", "علف", "إبل", "توصيل", "delivery"],
  },
  {
    category: "farm_camel",
    slug: "farm-supply-group-buy",
    title: "Farm Supply Group Buying",
    description: "Coordinate bulk orders of animal feed, fencing, and water tanks across neighboring farms to lower per-unit cost.",
    target_customer: "Small and medium farm owners within a 20-km radius of Al Qua'a.",
    suggested_offer: "Monthly group-buy window with shared transport. 10–20% savings vs. retail.",
    first_actions: [
      "List 10 common farm supplies and current retail vs. wholesale prices.",
      "Run one pilot order with 3 farms for one supply item.",
      "Measure actual savings and time saved per farm.",
    ],
    risks: [
      "Coordinating orders across farms with different needs is operationally heavy.",
      "Storage space for bulk orders.",
      "Trust: farmers may be slow to pay in advance.",
    ],
    complexity: "Medium",
    people: "1 coordinator (you)",
    tools: "WhatsApp group, shared spreadsheet, simple invoicing",
    keywords: ["group", "bulk", "buy", "supply", "farm", "شراء", "مجموعة"],
  },
  {
    category: "repairs",
    slug: "mobile-ac-repair",
    title: "Mobile AC Repair Booking",
    description: "Bookable on-demand AC repair visits for homes and farms across Al Qua'a.",
    target_customer: "Families and farms needing fast AC support in the summer heat.",
    suggested_offer: "Same-day or next-day booking via WhatsApp. Standard call-out fee + parts.",
    first_actions: [
      "Find 2 local AC technicians willing to join a booking rotation.",
      "Collect 10 pre-registrations from neighbors and family networks.",
      "Define a simple price list (call-out + common fixes).",
    ],
    risks: [
      "Seasonal demand spike in May–September.",
      "Parts availability in Al Qua'a is limited — keep a small inventory or supplier relationship in Al Ain.",
      "Technicians may not be available on weekends.",
    ],
    complexity: "Low",
    people: "1 coordinator + 2 partner technicians",
    tools: "WhatsApp, basic tool kit, supplier account for parts",
    keywords: ["ac", "مكيف", "repair", "إصلاح", "technician", "فني"],
  },
  {
    category: "repairs",
    slug: "water-tank-cleaning-reminder",
    title: "Water Tank Cleaning Reminder Service",
    description: "Recurring water tank cleaning with WhatsApp reminders every 6 months.",
    target_customer: "Homeowners and farm families with rooftop or ground water tanks.",
    suggested_offer: "Subscribe for 2 cleanings/year with auto-reminder. AED 100–250 per visit.",
    first_actions: [
      "Identify 1 cleaning provider with portable equipment.",
      "Offer a 50-household launch with a 1-month follow-up reminder.",
      "Track no-show rate to refine the reminder cadence.",
    ],
    risks: [
      "Forgetting to clean tanks is a health risk — strong marketing angle.",
      "Provider reliability is critical — vet 1–2 before launching.",
    ],
    complexity: "Low",
    people: "1 coordinator + 1 partner provider",
    tools: "WhatsApp reminders, simple subscription list",
    keywords: ["tank", "water", "cleaning", "خزان", "مياه", "تنظيف"],
  },
  {
    category: "repairs",
    slug: "mobile-tire-repair",
    title: "Mobile Tire Repair",
    description: "On-the-spot tire repair and replacement for cars stuck on long drives to Al Qua'a.",
    target_customer: "Residents and visitors driving between Al Ain and Al Qua'a.",
    suggested_offer: "Phone-based booking + drive-to-you service. Basic repair AED 50–100; replacement at market rate + margin.",
    first_actions: [
      "Buy or rent a portable tire repair kit and a small compressor.",
      "Practice on 3 friends' cars to test speed and quality.",
      "Post service in Al Qua'a WhatsApp groups.",
    ],
    risks: [
      "Low frequency per household — needs scale to be profitable.",
      "Competition from established tire shops in Al Ain.",
    ],
    complexity: "Low",
    people: "1 operator (you)",
    tools: "Portable compressor, tire repair kit, basic inventory of common sizes",
    keywords: ["tire", "إطار", "بنشر", "puncture", "wheel"],
  },
  {
    category: "food_groceries",
    slug: "al-quaa-grocery-drop",
    title: "Al Qua'a Grocery Drop",
    description: "A weekly shared grocery delivery route that brings essentials from Al Ain supermarkets to Al Qua'a.",
    target_customer: "Families far from shops — especially farm households without a daily car commute.",
    suggested_offer: "Weekly shared order with a flat delivery fee per family. Minimum order value to make the route viable.",
    first_actions: [
      "Survey 5 families on what they buy weekly and what they pay for delivery today.",
      "Test one shared order route with 3–5 families.",
      "Calculate true cost per delivery including fuel and time.",
    ],
    risks: [
      "Refrigerated items need coolers or fast delivery.",
      "Order coordination can be time-consuming — consider a fixed weekly cutoff time.",
    ],
    complexity: "Medium",
    people: "1 driver + 1 order coordinator",
    tools: "Pickup van or shared SUV, WhatsApp order form, basic cool box",
    keywords: ["grocery", "بقالة", "delivery", "توصيل", "shopping", "supermarket"],
  },
  {
    category: "food_groceries",
    slug: "fresh-bread-route",
    title: "Fresh Bread Delivery Route",
    description: "Morning delivery of fresh bread and pastries to homes and farms.",
    target_customer: "Families who want hot, fresh bread without driving early in the morning.",
    suggested_offer: "Daily morning delivery, subscription model with 20+ deliveries/day for break-even.",
    first_actions: [
      "Find a partner bakery in Al Ain that delivers to Al Qua'a.",
      "Test a 2-week pilot with 10 families.",
      "Set a fixed price per household per month.",
    ],
    risks: [
      "Need consistent volume — dropouts break the economics.",
      "Hot weather affects freshness in summer.",
    ],
    complexity: "Medium",
    people: "1 driver + partner bakery",
    tools: "Insulated bag, daily route plan, WhatsApp subscription list",
    keywords: ["bread", "خبز", "bakery", "fresh", "morning"],
  },
  {
    category: "transport_delivery",
    slug: "al-ain-ride-share",
    title: "Al Ain Ride Share",
    description: "Scheduled shared rides between Al Qua'a and Al Ain for medical, shopping, and school trips.",
    target_customer: "Residents who travel to Al Ain 1–4 times a month and don't want to drive.",
    suggested_offer: "Fixed weekly schedule (e.g., Tuesdays & Fridays) with seat-based pricing.",
    first_actions: [
      "Map common destinations in Al Ain: hospitals, malls, schools.",
      "Run a sign-up form via WhatsApp and target 10 riders/week.",
      "Set a clear departure and return time and stick to it.",
    ],
    risks: [
      "Vehicle maintenance and fuel cost.",
      "Regulations on paid transport — verify licensing needs.",
      "No-shows waste capacity.",
    ],
    complexity: "Medium",
    people: "1 driver + simple booking system",
    tools: "Reliable 7-seater vehicle, WhatsApp booking, simple price list",
    keywords: ["ride", "transport", "al ain", "توصيلة", "مركبة", "drive"],
  },
  {
    category: "transport_delivery",
    slug: "prescription-pickup",
    title: "Prescription Pickup Coordination",
    description: "A trusted person picks up prescriptions and medicines from Al Ain pharmacies and delivers to homes.",
    target_customer: "Elderly residents and families with chronic medication needs.",
    suggested_offer: "Monthly pickup subscription or per-trip fee (AED 25–50).",
    first_actions: [
      "Partner with 1 pharmacy in Al Ain that allows third-party pickup.",
      "Get 5 family subscriptions before launching publicly.",
      "Keep a private log of pickups and deliveries for trust.",
    ],
    risks: [
      "Privacy and trust — handle prescriptions discreetly.",
      "Liability if medication is delayed or lost.",
    ],
    complexity: "Low",
    people: "1 trusted coordinator",
    tools: "WhatsApp, simple spreadsheet log",
    keywords: ["prescription", "medicine", "pharmacy", "دواء", "وصفة", "صيدلية"],
  },
  {
    category: "education_tutoring",
    slug: "student-tutoring-circle",
    title: "Student Tutoring Circle",
    description: "Small group tutoring sessions for school students, focused on math, English, and exam prep.",
    target_customer: "Families with school-aged children who want affordable, local tutoring.",
    suggested_offer: "Weekly 90-minute sessions, 3–5 students per group, AED 50–100 per student.",
    first_actions: [
      "Find 1 qualified tutor for each subject (math, English, science).",
      "Run 1 free intro session to collect interest.",
      "Set a recurring schedule and a fixed location (a majlis, community room, or home).",
    ],
    risks: [
      "Tutor consistency — losing one tutor disrupts a group.",
      "Space: a quiet, cool place is required in summer.",
    ],
    complexity: "Low",
    people: "1 coordinator + 1–3 tutors",
    tools: "Whiteboard, textbooks, WhatsApp parent group",
    keywords: ["tutor", "tutoring", "math", "english", "دروس", "تعليم", "رياضيات", "إنجليزي"],
  },
  {
    category: "education_tutoring",
    slug: "digital-skills-for-families",
    title: "Digital Skills Help for Families",
    description: "Short sessions that help parents and elders use WhatsApp, online forms, video calls, and government apps.",
    target_customer: "Parents and elderly residents who need practical digital help.",
    suggested_offer: "2-hour weekend sessions at a community space. Drop-in format. AED 25–50 per person.",
    first_actions: [
      "List the 5 most-asked-for tasks (online forms, video calls, etc.).",
      "Prepare 1 short curriculum and 1 helper sheet.",
      "Run 1 free session to test engagement.",
    ],
    risks: [
      "Low pay per session — needs volume or sponsorship.",
      "Participants may have very different skill levels.",
    ],
    complexity: "Low",
    people: "1 facilitator",
    tools: "Projector or large screen, printed cheat sheets, simple handouts",
    keywords: ["digital", "computer", "phone", "online", "forms", "تطبيق", "رقمي"],
  },
  {
    category: "health_wellness",
    slug: "home-nurse-visit",
    title: "Home Nurse Visit Service",
    description: "Periodic home visits by a registered nurse for elderly or post-surgery family members.",
    target_customer: "Families with elderly relatives who need check-ups, vitals, or basic care.",
    suggested_offer: "Monthly subscription: 1 visit/month, vitals check, medication review. AED 100–250 per visit.",
    first_actions: [
      "Partner with 1 licensed nurse or home-care agency in Al Ain.",
      "Run 1 pilot month with 3 families.",
      "Build a simple report card per visit for the family.",
    ],
    risks: [
      "Strict licensing and liability for medical services.",
      "Need for medical-grade supplies and record-keeping.",
    ],
    complexity: "High",
    people: "1 nurse + 1 coordinator",
    tools: "Basic medical kit, simple report forms",
    keywords: ["nurse", "home care", "ممرض", "رعاية", "elderly", "كبار السن"],
  },
  {
    category: "health_wellness",
    slug: "medicine-delivery",
    title: "Monthly Medicine Delivery",
    description: "Subscription-based monthly delivery of chronic medicines from Al Ain pharmacies.",
    target_customer: "Elderly residents and families with monthly prescriptions.",
    suggested_offer: "AED 25–50/month flat fee for 1 scheduled delivery.",
    first_actions: [
      "Find a partner pharmacy that accepts repeat orders.",
      "Sign 10 families as launch customers.",
      "Define a strict pickup time and delivery window.",
    ],
    risks: [
      "Liability for medication safety and timing.",
      "Pharmacy may charge a fee that erodes margin.",
    ],
    complexity: "Medium",
    people: "1 trusted driver",
    tools: "Insulated bag, simple subscription list",
    keywords: ["medicine", "دواء", "pharmacy", "صيدلية", "delivery"],
  },
  {
    category: "tourism_stargazing",
    slug: "stargazing-visitor-pack",
    title: "Stargazing Visitor Pack",
    description: "A guided dark-sky experience for visitors to Al Qua'a — guide, snacks, parking, telescope, and a local story.",
    target_customer: "Visitors coming for the dark-sky experience, mostly in cooler months (Oct–Mar).",
    suggested_offer: "2-hour guided session, 4–8 people, AED 100–250 per person. Optional telescope rental.",
    first_actions: [
      "Interview 5 visitors or 2 tour operators to validate the offer.",
      "Find a dark-sky spot with safe parking and test the route.",
      "Build a simple booking page and a WhatsApp contact.",
    ],
    risks: [
      "Highly seasonal — pair with daytime experiences to smooth revenue.",
      "Weather cancellations — clear refund/rain-check policy needed.",
      "Liability for visitors in remote desert spots.",
    ],
    complexity: "Medium",
    people: "1 guide + 1 host",
    tools: "Telescope, blanket, lantern, water, basic first-aid",
    keywords: ["stargazing", "نجوم", "stars", "tourism", "سياحة", "telescope", "dark sky"],
  },
  {
    category: "tourism_stargazing",
    slug: "telescope-rental",
    title: "Telescope Rental for Visitors",
    description: "Rent a beginner-friendly telescope for an evening near Al Qua'a, with a 5-minute setup guide.",
    target_customer: "Visitors who want a private stargazing experience without a tour.",
    suggested_offer: "AED 50–100/night rental, with a printed star map.",
    first_actions: [
      "Buy 2 beginner telescopes with a wide field of view.",
      "Test them on 3 different nights for setup time and image quality.",
      "Set a deposit policy to protect the equipment.",
    ],
    risks: [
      "Equipment damage and dust.",
      "Limited audience size — may need to be combined with a guided offer.",
    ],
    complexity: "Low",
    people: "1 operator",
    tools: "2 telescopes, printed star maps, cleaning kit",
    keywords: ["telescope", "تلسكوب", "rental", "stars", "نجوم"],
  },
  {
    category: "government_paperwork",
    slug: "paperwork-help-desk",
    title: "Paperwork Help Desk",
    description: "Walk-in help for online forms, document scanning, typing, and translation between Arabic and English.",
    target_customer: "Residents who struggle with government websites or English-language forms.",
    suggested_offer: "Drop-in service at a fixed location + WhatsApp booking. AED 25–50 per task.",
    first_actions: [
      "List the top 5 government forms residents struggle with.",
      "Prepare 1-page 'cheat sheets' for each form.",
      "Run 1 free day to learn where people actually get stuck.",
    ],
    risks: [
      "Sensitive personal data — privacy and security are critical.",
      "Demand may be lumpy around government deadlines (school enrollment, license renewal).",
    ],
    complexity: "Low",
    people: "1 trained helper",
    tools: "Laptop, scanner, printer, secure file storage",
    keywords: ["paperwork", "forms", "نموذج", "أوراق", "translation", "ترجمة", "scan"],
  },
  {
    category: "events_community",
    slug: "weekend-football-league",
    title: "Weekend Football League",
    description: "A regular weekend football match for youth and adults in Al Qua'a, with simple standings and a small trophy.",
    target_customer: "Youth and adult residents looking for safe, organized sport on weekends.",
    suggested_offer: "Free to enter; AED 10–20/match as a small team fee for balls and refs.",
    first_actions: [
      "Recruit 2 team captains and a part-time referee.",
      "Book a pitch (school yard or open field) for 4 hours on Saturdays.",
      "Start a WhatsApp group and post a 6-week schedule.",
    ],
    risks: [
      "Weather in summer limits outdoor play.",
      "Need a first-aid kit and clear safety rules.",
    ],
    complexity: "Low",
    people: "1 organizer + 1 referee",
    tools: "Balls, bibs, small first-aid kit, WhatsApp group",
    keywords: ["football", "كورة", "soccer", "sport", "رياضة", "match"],
  },
]

function matchScore(template: (typeof OPPORTUNITY_TEMPLATES)[number], response: SurveyResponse): number {
  const haystack = `${response.need_title} ${response.need_description ?? ""}`.toLowerCase()
  const category = response.category
  if (template.category !== category) return 0
  // Boost if any keyword matches
  for (const kw of template.keywords) {
    if (haystack.includes(kw.toLowerCase())) return 1
  }
  // Fallback: if category matches and the title is short and clear, include it weakly
  if (response.need_title.split(/\s+/).length <= 6) return 0.4
  return 0
}

function clusterResponses(responses: SurveyResponse[]): OpportunityCluster[] {
  const clusters: OpportunityCluster[] = []
  for (const tpl of OPPORTUNITY_TEMPLATES) {
    const matches = responses.filter((r) => matchScore(tpl, r) > 0)
    if (matches.length === 0) continue
    clusters.push({
      cluster_key: `${tpl.category}::${tpl.slug}`,
      category: tpl.category as OpportunityCluster["category"],
      matched_response_ids: matches.map((m) => m.id),
      responses: matches,
    })
  }
  return clusters
}

function confidenceFor(count: number): Confidence {
  if (count >= 15) return "high"
  if (count >= 5) return "medium"
  return "low"
}

function pickTemplate(cluster: OpportunityCluster) {
  return OPPORTUNITY_TEMPLATES.find((t) => `${t.category}::${t.slug}` === cluster.cluster_key)!
}

function topArea(responses: SurveyResponse[]): string | null {
  if (responses.length === 0) return null
  const counts = new Map<string, number>()
  for (const r of responses) counts.set(r.area, (counts.get(r.area) ?? 0) + 1)
  let best: { area: string; count: number } | null = null
  for (const [area, count] of counts) {
    if (!best || count > best.count) best = { area, count }
  }
  return best?.area ?? null
}

function commonPhrases(responses: SurveyResponse[]): string[] {
  const counter = new Map<string, number>()
  const stop = new Set([
    "the", "a", "an", "to", "and", "of", "in", "is", "it", "for", "on", "with", "i", "we",
    "need", "want", "a", "ال", "في", "من", "الى", "على", "الى", "أحتاج", "أريد", "نحن",
  ])
  for (const r of responses) {
    const text = `${r.need_title} ${r.need_description ?? ""}`.toLowerCase()
    for (const word of text.split(/[\s,،.!?؟]+/)) {
      const w = word.trim()
      if (w.length < 4 || stop.has(w)) continue
      counter.set(w, (counter.get(w) ?? 0) + 1)
    }
  }
  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w)
}

const SEVEN_DAY_CHECKLIST = [
  "Day 1: Interview 5 potential customers about the specific need.",
  "Day 2: Identify 2 suppliers or partner providers.",
  "Day 3: Estimate total cost per delivery or per service.",
  "Day 4: Create a simple offer (price, schedule, WhatsApp link).",
  "Day 5: Test with a first customer or pilot group.",
  "Day 6: Collect feedback and refine the offer.",
  "Day 7: Decide continue, pivot, or stop — and log learnings.",
]

function avg(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return numbers.reduce((s, n) => s + n, 0) / numbers.length
}

export function computeOpportunities(responses: SurveyResponse[]): Opportunity[] {
  const liveResponses = responses.filter((r) => !r.is_deleted)
  const clusters = clusterResponses(liveResponses)
  if (clusters.length === 0) return []

  const maxCount = Math.max(...clusters.map((c) => c.responses.length), 1)

  const opportunities: Opportunity[] = clusters.map((cluster) => {
    const tpl = pickTemplate(cluster)
    const rs = cluster.responses
    const response_count = rs.length
    const average_urgency = avg(rs.map((r) => r.urgency))
    const provider_gap_rate = rs.filter((r) => isProviderGap(r.has_local_provider)).length / rs.length
    const recurring_rate = rs.filter((r) => RECURRING_FREQUENCIES.has(r.frequency)).length / rs.length
    const pay_signal_rate = avg(
      rs.map((r) => WTP_WEIGHT[r.willingness_to_pay_range ?? "0"] ?? 0),
    )

    // Score formula: demand (35) + urgency (25) + provider gap (15) + recurring (15) + pay (10) = 100
    const demand_points = 35 * (response_count / maxCount)
    const urgency_points = 25 * (average_urgency / 5)
    const provider_gap_points = 15 * provider_gap_rate
    const recurring_points = 15 * recurring_rate
    const pay_points = 10 * pay_signal_rate
    const score = Math.round(
      demand_points + urgency_points + provider_gap_points + recurring_points + pay_points,
    )

    return {
      id: cluster.cluster_key,
      title: tpl.title,
      slug: tpl.slug,
      category: cluster.category,
      description: tpl.description,
      matching_response_ids: cluster.matched_response_ids,
      response_count,
      average_urgency: Number(average_urgency.toFixed(2)),
      provider_gap_rate: Number(provider_gap_rate.toFixed(2)),
      recurring_rate: Number(recurring_rate.toFixed(2)),
      pay_signal_rate: Number(pay_signal_rate.toFixed(2)),
      opportunity_score: score,
      confidence_level: confidenceFor(response_count),
      top_area: topArea(rs),
      target_customer: tpl.target_customer,
      suggested_offer: tpl.suggested_offer,
      first_actions: tpl.first_actions,
      seven_day_checklist: SEVEN_DAY_CHECKLIST,
      risks: tpl.risks,
      resources_needed: {
        people: tpl.people,
        tools: tpl.tools,
        complexity: tpl.complexity,
      },
      generated_by: "algorithm",
      last_generated_at: new Date().toISOString(),
      common_phrases: commonPhrases(rs),
      sample_responses: rs.slice(0, 5).map((r) => ({
        id: r.id,
        title: r.need_title,
        description: r.need_description,
        area: r.area,
        urgency: r.urgency,
      })),
    }
  })

  return opportunities.sort((a, b) => b.opportunity_score - a.opportunity_score)
}

export function findOpportunity(responses: SurveyResponse[], id: string): Opportunity | null {
  return computeOpportunities(responses).find((o) => o.id === id) ?? null
}

export { generateFallbackBrief }
export function getCategoryLabel(value: string, lang: "en" | "ar") {
  return categoryLabel(value, lang)
}

export function getOpportunityTemplates() {
  return OPPORTUNITY_TEMPLATES.map((t) => ({
    category: t.category,
    slug: t.slug,
    title: t.title,
  }))
}

export const OPPORTUNITY_CATEGORIES = CATEGORIES
