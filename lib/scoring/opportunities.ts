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
  title_ar: string
  description: string
  description_ar: string
  target_customer: string
  target_customer_ar: string
  suggested_offer: string
  suggested_offer_ar: string
  first_actions: string[]
  first_actions_ar: string[]
  risks: string[]
  risks_ar: string[]
  complexity: "Low" | "Medium" | "High"
  people: string
  people_ar: string
  tools: string
  tools_ar: string
  keywords: string[] // matched against need_title (lowercased) and category
}

// Each cluster is keyed by `${category}::${slug}`
export const OPPORTUNITY_TEMPLATES: Array<OpportunityTemplate & { category: string; slug: string }> = [
  {
    category: "farm_camel",
    slug: "camel-feed-delivery",
    title: "Camel Feed Delivery Route",
    title_ar: "مسار توصيل أعلاف الإبل",
    description: "A weekly delivery service that brings bulk camel feed to farms north and south of Al Qua'a.",
    description_ar: "خدمة توصيل أسبوعية تجلب أعلاف الإبل بالجملة للمزارع في شمال وجنوب Al Qua'a.",
    target_customer: "Farm owners with 5+ camels who currently drive 40+ km to restock feed.",
    target_customer_ar: "أصحاب المزارع الذين يملكون أكثر من ٥ إبل ويقودون حاليًا لمسافة تزيد عن ٤٠ كم لإعادة تخزين الأعلاف.",
    suggested_offer: "Weekly scheduled delivery, WhatsApp ordering, and group-buy pricing for 3+ farms on the same route.",
    suggested_offer_ar: "توصيل أسبوعي مجدول، والطلب عبر الواتساب، وأسعار الشراء الجماعي لـ ٣ مزارع أو أكثر في نفس المسار.",
    first_actions: [
      "Call 5 farm owners to confirm the exact feed types and monthly volumes they need.",
      "Test one delivery route from Al Ain feed suppliers to farms north and south.",
      "Compare supplier cost + transport cost vs. willingness to pay (AED 100–250).",
    ],
    first_actions_ar: [
      "الاتصال بـ ٥ من أصحاب المزارع لتأكيد أنواع الأعلاف الدقيقة والكميات الشهرية التي يحتاجونها.",
      "اختبار مسار توصيل واحد من موردي الأعلاف في العين إلى المزارع في الشمال والجنوب.",
      "مقارنة تكلفة المورد + تكلفة النقل مقابل الاستعداد للدفع (١٠٠-٢٥٠ درهم).",
    ],
    risks: [
      "Low initial order volume — keep vehicle cost low until 10+ farms are signed up.",
      "Seasonal demand drops in summer; consider a subscription pause option.",
      "Competition from feed shops that offer free delivery above a minimum order.",
    ],
    risks_ar: [
      "حجم طلب أولي منخفض — حافظ على انخفاض تكلفة المركبة حتى يتم تسجيل أكثر من ١٠ مزارع.",
      "انخفاض الطلب الموسمي في الصيف؛ ضع في اعتبارك خيار إيقاف الاشتراك مؤقتًا.",
      "المنافسة من محلات الأعلاف التي تقدم توصيلًا مجانيًا فوق حد أدنى للطلب.",
    ],
    complexity: "Medium",
    people: "1 driver + 1 coordinator (WhatsApp orders)",
    people_ar: "سائق واحد + منسق واحد (طلبات واتساب)",
    tools: "Pickup truck or shared van, WhatsApp group, simple Google Sheet for routes",
    tools_ar: "شاحنة بيك آب أو شاحنة مشتركة، مجموعة واتساب، جدول بيانات جوجل بسيط للمسارات",
    keywords: ["camel", "feed", "علف", "إبل", "توصيل", "delivery"],
  },
  {
    category: "farm_camel",
    slug: "farm-supply-group-buy",
    title: "Farm Supply Group Buying",
    title_ar: "الشراء الجماعي لمستلزمات المزارع",
    description: "Coordinate bulk orders of animal feed, fencing, and water tanks across neighboring farms to lower per-unit cost.",
    description_ar: "تنسيق الطلبات بالجملة لأعلاف الحيوانات، السياج، وخزانات المياه عبر المزارع المجاورة لخفض تكلفة الوحدة.",
    target_customer: "Small and medium farm owners within a 20-km radius of Al Qua'a.",
    target_customer_ar: "أصحاب المزارع الصغيرة والمتوسطة في نطاق ٢٠ كم من Al Qua'a.",
    suggested_offer: "Monthly group-buy window with shared transport. 10–20% savings vs. retail.",
    suggested_offer_ar: "نافذة شراء جماعي شهرية مع نقل مشترك. توفير بنسبة ١٠-٢٠٪ مقارنة بالتجزئة.",
    first_actions: [
      "List 10 common farm supplies and current retail vs. wholesale prices.",
      "Run one pilot order with 3 farms for one supply item.",
      "Measure actual savings and time saved per farm.",
    ],
    first_actions_ar: [
      "قائمة بـ ١٠ مستلزمات مزارع شائعة وأسعار التجزئة الحالية مقابل أسعار الجملة.",
      "تشغيل طلب تجريبي واحد مع ٣ مزارع لعنصر توريد واحد.",
      "قياس التوفير الفعلي والوقت الموفر لكل مزرعة.",
    ],
    risks: [
      "Coordinating orders across farms with different needs is operationally heavy.",
      "Storage space for bulk orders.",
      "Trust: farmers may be slow to pay in advance.",
    ],
    risks_ar: [
      "تنسيق الطلبات عبر المزارع ذات الاحتياجات المختلفة يمثل عبئًا تشغيليًا كبيرًا.",
      "مساحة التخزين للطلبات الكبيرة بالجملة.",
      "الثقة: قد يكون المزارعون بطيئين في الدفع مقدمًا.",
    ],
    complexity: "Medium",
    people: "1 coordinator (you)",
    people_ar: "منسق واحد (أنت)",
    tools: "WhatsApp group, shared spreadsheet, simple invoicing",
    tools_ar: "مجموعة واتساب، جدول بيانات مشترك، فواتير بسيطة",
    keywords: ["group", "bulk", "buy", "supply", "farm", "شراء", "مجموعة"],
  },
  {
    category: "repairs",
    slug: "mobile-ac-repair",
    title: "Mobile AC Repair Booking",
    title_ar: "حجز تصليح المكيفات المتنقل",
    description: "Bookable on-demand AC repair visits for homes and farms across Al Qua'a.",
    description_ar: "زيارات حجز تصليح مكيفات الهواء عند الطلب للمنازل والمزارع في جميع أنحاء Al Qua'a.",
    target_customer: "Families and farms needing fast AC support in the summer heat.",
    target_customer_ar: "العائلات والمزارع التي تحتاج إلى دعم سريع للمكيفات في حرارة الصيف.",
    suggested_offer: "Same-day or next-day booking via WhatsApp. Standard call-out fee + parts.",
    suggested_offer_ar: "حجز في نفس اليوم أو اليوم التالي عبر الواتساب. رسوم زيارة قياسية + قطع الغيار.",
    first_actions: [
      "Find 2 local AC technicians willing to join a booking rotation.",
      "Collect 10 pre-registrations from neighbors and family networks.",
      "Define a simple price list (call-out + common fixes).",
    ],
    first_actions_ar: [
      "البحث عن فنيين محليين للمكيفات على استعداد للانضمام إلى دورة الحجز.",
      "جمع ١٠ تسجيلات مسبقة من الجيران وشبكات العائلات.",
      "تحديد قائمة أسعار بسيطة (رسوم الزيارة + الإصلاحات الشائعة).",
    ],
    risks: [
      "Seasonal demand spike in May–September.",
      "Parts availability in Al Qua'a is limited — keep a small inventory or supplier relationship in Al Ain.",
      "Technicians may not be available on weekends.",
    ],
    risks_ar: [
      "ارتفاع الطلب الموسمي في مايو-سبتمبر.",
      "توفر قطع الغيار في Al Qua'a محدود — حافظ على مخزون صغير أو علاقة مع مورد في العين.",
      "قد لا يكون الفنيون متاحين في عطلات نهاية الأسبوع."
    ],
    complexity: "Low",
    people: "1 coordinator + 2 partner technicians",
    people_ar: "منسق واحد + ٢ فنيين شركاء",
    tools: "WhatsApp, basic tool kit, supplier account for parts",
    tools_ar: "واتساب، حقيبة أدوات أساسية، حساب مورد لقطع الغيار",
    keywords: ["ac", "مكيف", "repair", "إصلاح", "technician", "فني"],
  },
  {
    category: "repairs",
    slug: "water-tank-cleaning-reminder",
    title: "Water Tank Cleaning Reminder Service",
    title_ar: "خدمة التذكير بتنظيف خزانات المياه",
    description: "Recurring water tank cleaning with WhatsApp reminders every 6 months.",
    description_ar: "تنظيف دوري لخزانات المياه مع تذكيرات عبر الواتساب كل ٦ أشهر.",
    target_customer: "Homeowners and farm families with rooftop or ground water tanks.",
    target_customer_ar: "أصحاب المنازل وعائلات المزارع الذين لديهم خزانات مياه علوية أو أرضية.",
    suggested_offer: "Subscribe for 2 cleanings/year with auto-reminder. AED 100–250 per visit.",
    suggested_offer_ar: "الاشتراك لتنظيفين سنويًا مع تذكير تلقائي. ١٠٠-٢٥٠ درهم لكل زيارة.",
    first_actions: [
      "Identify 1 cleaning provider with portable equipment.",
      "Offer a 50-household launch with a 1-month follow-up reminder.",
      "Track no-show rate to refine the reminder cadence.",
    ],
    first_actions_ar: [
      "تحديد مزود تنظيف واحد لديه معدات محمولة.",
      "تقديم إطلاق لـ ٥٠ منزلًا مع تذكير متابعة بعد شهر واحد.",
      "تتبع معدل عدم الحضور لتحسين وتيرة التذكير.",
    ],
    risks: [
      "Forgetting to clean tanks is a health risk — strong marketing angle.",
      "Provider reliability is critical — vet 1–2 before launching.",
    ],
    risks_ar: [
      "نسيان تنظيف الخزانات يمثل خطرًا صحيًا — زاوية تسويقية قوية.",
      "موثوقية المزود أمر بالغ الأهمية — افحص ١-٢ قبل الإطلاق.",
    ],
    complexity: "Low",
    people: "1 coordinator + 1 partner provider",
    people_ar: "منسق واحد + مزود شريك واحد",
    tools: "WhatsApp reminders, simple subscription list",
    tools_ar: "تذكيرات واتساب، قائمة اشتراك بسيطة",
    keywords: ["tank", "water", "cleaning", "خزان", "مياه", "تنظيف"],
  },
  {
    category: "repairs",
    slug: "mobile-tire-repair",
    title: "Mobile Tire Repair",
    title_ar: "تصليح الإطارات المتنقل",
    description: "On-the-spot tire repair and replacement for cars stuck on long drives to Al Qua'a.",
    description_ar: "تصليح واستبدال الإطارات في الموقع للسيارات العالقة في الرحلات الطويلة إلى Al Qua'a.",
    target_customer: "Residents and visitors driving between Al Ain and Al Qua'a.",
    target_customer_ar: "السكان والزوار الذين يقودون سياراتهم بين العين وAl Qua'a.",
    suggested_offer: "Phone-based booking + drive-to-you service. Basic repair AED 50–100; replacement at market rate + margin.",
    suggested_offer_ar: "حجز عبر الهاتف + خدمة التوصيل إليك. تصليح أساسي ٥٠-١٠٠ درهم؛ الاستبدال بسعر السوق + هامش الربح.",
    first_actions: [
      "Buy or rent a portable tire repair kit and a small compressor.",
      "Practice on 3 friends' cars to test speed and quality.",
      "Post service in Al Qua'a WhatsApp groups.",
    ],
    first_actions_ar: [
      "شراء أو استئجار حقيبة أدوات تصليح إطارات محمولة وضاغط هواء صغير.",
      "التدريب على ٣ سيارات للأصدقاء لاختبار السرعة والجودة.",
      "نشر الخدمة في مجموعات واتساب في Al Qua'a.",
    ],
    risks: [
      "Low frequency per household — needs scale to be profitable.",
      "Competition from established tire shops in Al Ain.",
    ],
    risks_ar: [
      "تكرار منخفض لكل منزل — يحتاج إلى حجم عمل ليصبح مربحًا.",
      "المنافسة من محلات الإطارات القائمة في العين.",
    ],
    complexity: "Low",
    people: "1 operator (you)",
    people_ar: "مشغل واحد (أنت)",
    tools: "Portable compressor, tire repair kit, basic inventory of common sizes",
    tools_ar: "ضاغط هواء محمول، حقيبة أدوات تصليح الإطارات، مخزون أساسي للمقاسات الشائعة",
    keywords: ["tire", "إطار", "بنشر", "puncture", "wheel"],
  },
  {
    category: "food_groceries",
    slug: "al-quaa-grocery-drop",
    title: "Al Qua'a Grocery Drop",
    title_ar: "توصيل بقالة Al Qua'a",
    description: "A weekly shared grocery delivery route that brings essentials from Al Ain supermarkets to Al Qua'a.",
    description_ar: "مسار توصيل بقالة مشترك أسبوعي يجلب الأساسيات من سوبرماركت العين إلى Al Qua'a.",
    target_customer: "Families far from shops — especially farm households without a daily car commute.",
    target_customer_ar: "العائلات البعيدة عن المحلات — وخاصة أسر المزارع التي ليس لديها تنقل يومي بالسيارة.",
    suggested_offer: "Weekly shared order with a flat delivery fee per family. Minimum order value to make the route viable.",
    suggested_offer_ar: "طلب مشترك أسبوعي مع رسوم توصيل ثابتة لكل عائلة. حد أدنى لقيمة الطلب لجعل المسار قابلًا للتطبيق.",
    first_actions: [
      "Survey 5 families on what they buy weekly and what they pay for delivery today.",
      "Test one shared order route with 3–5 families.",
      "Calculate true cost per delivery including fuel and time.",
    ],
    first_actions_ar: [
      "استقصاء ٥ عائلات حول ما يشترونه أسبوعيًا وما يدفعونه للتوصيل اليوم.",
      "اختبار مسار طلب مشترك واحد مع ٣-٥ عائلات.",
      "حساب التكلفة الفعلية لكل عملية توصيل بما في ذلك الوقود والوقت.",
    ],
    risks: [
      "Refrigerated items need coolers or fast delivery.",
      "Order coordination can be time-consuming — consider a fixed weekly cutoff time.",
    ],
    risks_ar: [
      "المواد المبردة تحتاج إلى مبردات أو توصيل سريع.",
      "تنسيق الطلبات قد يستغرق وقتًا طويلاً — ضع في اعتبارك وقتًا محددًا لإنهاء الطلبات أسبوعيًا.",
    ],
    complexity: "Medium",
    people: "1 driver + 1 order coordinator",
    people_ar: "سائق واحد + منسق طلبات واحد",
    tools: "Pickup van or shared SUV, WhatsApp order form, basic cool box",
    tools_ar: "شاحنة بيك آب أو سيارة دفع رباعي مشتركة، نموذج طلب واتساب، صندوق تبريد أساسي",
    keywords: ["grocery", "بقالة", "delivery", "توصيل", "shopping", "supermarket"],
  },
  {
    category: "food_groceries",
    slug: "fresh-bread-route",
    title: "Fresh Bread Delivery Route",
    title_ar: "مسار توصيل الخبز الطازج",
    description: "Morning delivery of fresh bread and pastries to homes and farms.",
    description_ar: "توصيل صباحي للخبز الطازج والمعجنات إلى المنازل والمزارع.",
    target_customer: "Families who want hot, fresh bread without driving early in the morning.",
    target_customer_ar: "العائلات التي تريد خبزًا ساخنًا وطازجًا دون الحاجة للقيادة في الصباح الباكر.",
    suggested_offer: "Daily morning delivery, subscription model with 20+ deliveries/day for break-even.",
    suggested_offer_ar: "توصيل صباحي يومي، نموذج اشتراك يتطلب أكثر من ٢٠ عملية توصيل يوميًا لتغطية التكاليف.",
    first_actions: [
      "Find a partner bakery in Al Ain that delivers to Al Qua'a.",
      "Test a 2-week pilot with 10 families.",
      "Set a fixed price per household per month.",
    ],
    first_actions_ar: [
      "البحث عن مخبز شريك في العين يوصل إلى Al Qua'a.",
      "اختبار تجريبي لمدة أسبوعين مع ١٠ عائلات.",
      "تحديد سعر ثابت لكل منزل شهريًا.",
    ],
    risks: [
      "Need consistent volume — dropouts break the economics.",
      "Hot weather affects freshness in summer.",
    ],
    risks_ar: [
      "الحاجة إلى حجم طلب ثابت — الانسحابات تضر باقتصاديات المشروع.",
      "الطقس الحار يؤثر على الطزاجة في الصيف.",
    ],
    complexity: "Medium",
    people: "1 driver + partner bakery",
    people_ar: "سائق واحد + مخبز شريك",
    tools: "Insulated bag, daily route plan, WhatsApp subscription list",
    tools_ar: "حقيبة عازلة للحرارة، خطة مسار يومية، قائمة اشتراك واتساب",
    keywords: ["bread", "خبز", "bakery", "fresh", "morning"],
  },
  {
    category: "transport_delivery",
    slug: "al-ain-ride-share",
    title: "Al Ain Ride Share",
    title_ar: "مشاركة الركوب إلى العين",
    description: "Scheduled shared rides between Al Qua'a and Al Ain for medical, shopping, and school trips.",
    description_ar: "رحلات مشتركة مجدولة بين Al Qua'a والعين للزيارات الطبية، التسوق، والرحلات المدرسية.",
    target_customer: "Residents who travel to Al Ain 1–4 times a month and don't want to drive.",
    target_customer_ar: "السكان الذين يسافرون إلى العين من ١ إلى ٤ مرات شهريًا ولا يرغبون في القيادة.",
    suggested_offer: "Fixed weekly schedule (e.g., Tuesdays & Fridays) with seat-based pricing.",
    suggested_offer_ar: "جدول أسبوعي ثابت (مثل الثلاثاء والجمعة) مع تسعير لكل مقعد.",
    first_actions: [
      "Map common destinations in Al Ain: hospitals, malls, schools.",
      "Run a sign-up form via WhatsApp and target 10 riders/week.",
      "Set a clear departure and return time and stick to it.",
    ],
    first_actions_ar: [
      "تحديد الوجهات الشائعة في العين: المستشفيات، المولات، المدارس.",
      "تشغيل نموذج تسجيل عبر الواتساب واستدراج ١٠ ركاب أسبوعيًا.",
      "تحديد وقت مغادرة وعودة واضح والالتزام به.",
    ],
    risks: [
      "Vehicle maintenance and fuel cost.",
      "Regulations on paid transport — verify licensing needs.",
      "No-shows waste capacity.",
    ],
    risks_ar: [
      "تكلفة صيانة المركبة والوقود.",
      "اللوائح المتعلقة بالنقل مدفوع الأجر — تحقق من متطلبات الترخيص.",
      "عدم الحضور يضيع القدرة الاستيعابية.",
    ],
    complexity: "Medium",
    people: "1 driver + simple booking system",
    people_ar: "سائق واحد + نظام حجز بسيط",
    tools: "Reliable 7-seater vehicle, WhatsApp booking, simple price list",
    tools_ar: "مركبة موثوقة ذات ٧ مقاعد، حجز واتساب، قائمة أسعار بسيطة",
    keywords: ["ride", "transport", "al ain", "توصيلة", "مركبة", "drive"],
  },
  {
    category: "transport_delivery",
    slug: "prescription-pickup",
    title: "Prescription Pickup Coordination",
    title_ar: "تنسيق استلام الوصفات الطبية",
    description: "A trusted person picks up prescriptions and medicines from Al Ain pharmacies and delivers to homes.",
    description_ar: "شخص موثوق يستلم الوصفات الطبية والأدوية من صيدليات العين ويوصلها إلى المنازل.",
    target_customer: "Elderly residents and families with chronic medication needs.",
    target_customer_ar: "كبار السن والعائلات التي لديها احتياجات أدوية مزمنة.",
    suggested_offer: "Monthly pickup subscription or per-trip fee (AED 25–50).",
    suggested_offer_ar: "اشتراك شهري للاستلام أو رسوم لكل رحلة (٢٥-٥٠ درهم).",
    first_actions: [
      "Partner with 1 pharmacy in Al Ain that allows third-party pickup.",
      "Get 5 family subscriptions before launching publicly.",
      "Keep a private log of pickups and deliveries for trust.",
    ],
    first_actions_ar: [
      "الشراكة مع صيدلية واحدة في العين تسمح بالاستلام من طرف ثالث.",
      "الحصول على ٥ اشتراكات عائلية قبل الإطلاق للعامة.",
      "الاحتفاظ بسجل خاص للمستلمات والتوصيلات لبناء الثقة.",
    ],
    risks: [
      "Privacy and trust — handle prescriptions discreetly.",
      "Liability if medication is delayed or lost.",
    ],
    risks_ar: [
      "الخصوصية والثقة — تعامل مع الوصفات الطبية بحذر وسرية.",
      "المسؤولية القانونية في حالة تأخر الدواء أو فقده.",
    ],
    complexity: "Low",
    people: "1 trusted coordinator",
    people_ar: "منسق واحد موثوق",
    tools: "WhatsApp, simple spreadsheet log",
    tools_ar: "واتساب، سجل جدول بيانات بسيط",
    keywords: ["prescription", "medicine", "pharmacy", "دواء", "وصفة", "صيدلية"],
  },
  {
    category: "education_tutoring",
    slug: "student-tutoring-circle",
    title: "Student Tutoring Circle",
    title_ar: "حلقة تدريس الطلاب",
    description: "Small group tutoring sessions for school students, focused on math, English, and exam prep.",
    description_ar: "جلسات تدريس مجموعات صغيرة لطلاب المدارس، تركز على الرياضيات، الإنجليزية، والتحضير للامتحانات.",
    target_customer: "Families with school-aged children who want affordable, local tutoring.",
    target_customer_ar: "العائلات التي لديها أطفال في سن المدرسة والذين يريدون دروسًا خصوصية محلية بأسعار معقولة.",
    suggested_offer: "Weekly 90-minute sessions, 3–5 students per group, AED 50–100 per student.",
    suggested_offer_ar: "جلسات أسبوعية مدتها ٩٠ دقيقة، ٣-٥ طلاب لكل مجموعة، ٥٠-١٠٠ درهم لكل طالب.",
    first_actions: [
      "Find 1 qualified tutor for each subject (math, English, science).",
      "Run 1 free intro session to collect interest.",
      "Set a recurring schedule and a fixed location (a majlis, community room, or home).",
    ],
    first_actions_ar: [
      "البحث عن مدرس مؤهل واحد لكل مادة (الرياضيات، الإنجليزية، العلوم).",
      "تشغيل جلسة تعريفية مجانية واحدة لجمع الاهتمام.",
      "تحديد جدول زمني متكرر وموقع ثابت (مجلس، غرفة مجتمعية، أو منزل).",
    ],
    risks: [
      "Tutor consistency — losing one tutor disrupts a group.",
      "Space: a quiet, cool place is required in summer.",
    ],
    risks_ar: [
      "استمرارية المعلم — فقدان معلم واحد يربك المجموعة.",
      "المكان: مطلوب مكان هادئ وبارد في الصيف."
    ],
    complexity: "Low",
    people: "1 coordinator + 1–3 tutors",
    people_ar: "منسق واحد + ١-٣ معلمين",
    tools: "Whiteboard, textbooks, WhatsApp parent group",
    tools_ar: "سبورة بيضاء، كتب دراسية، مجموعة واتساب لأولياء الأمور",
    keywords: ["tutor", "tutoring", "math", "english", "دروس", "تعليم", "رياضيات", "إنجليزي"],
  },
  {
    category: "education_tutoring",
    slug: "digital-skills-for-families",
    title: "Digital Skills Help for Families",
    title_ar: "مساعدة المهارات الرقمية للعائلات",
    description: "Short sessions that help parents and elders use WhatsApp, online forms, video calls, and government apps.",
    description_ar: "جلسات قصيرة تساعد الآباء وكبار السن على استخدام واتساب، النماذج عبر الإنترنت، مكالمات الفيديو، والتطبيقات الحكومية.",
    target_customer: "Parents and elderly residents who need practical digital help.",
    target_customer_ar: "الآباء وكبار السن الذين يحتاجون إلى مساعدة رقمية عملية.",
    suggested_offer: "2-hour weekend sessions at a community space. Drop-in format. AED 25–50 per person.",
    suggested_offer_ar: "جلسات مدتها ساعتان في نهاية الأسبوع في مساحة مجتمعية. تنسيق مفتوح. ٢٥-٥٠ درهم للشخص الواحد.",
    first_actions: [
      "List the 5 most-asked-for tasks (online forms, video calls, etc.).",
      "Prepare 1 short curriculum and 1 helper sheet.",
      "Run 1 free session to test engagement.",
    ],
    first_actions_ar: [
      "قائمة بالمهام الـ ٥ الأكثر طلبًا (النماذج عبر الإنترنت، مكالمات الفيديو، إلخ).",
      "إعداد منهج قصير واحد وورقة مساعدة واحدة.",
      "تشغيل جلسة مجانية واحدة لاختبار التفاعل.",
    ],
    risks: [
      "Low pay per session — needs volume or sponsorship.",
      "Participants may have very different skill levels.",
    ],
    risks_ar: [
      "أجر منخفض لكل جلسة — يحتاج إلى حجم كبير أو رعاية.",
      "قد يكون للمشاركين مستويات مهارة مختلفة تمامًا.",
    ],
    complexity: "Low",
    people: "1 facilitator",
    people_ar: "ميسر واحد",
    tools: "Projector or large screen, printed cheat sheets, simple handouts",
    tools_ar: "جهاز عرض أو شاشة كبيرة، أوراق غش مطبوعة، منشورات بسيطة",
    keywords: ["digital", "computer", "phone", "online", "forms", "تطبيق", "رقمي"],
  },
  {
    category: "health_wellness",
    slug: "home-nurse-visit",
    title: "Home Nurse Visit Service",
    title_ar: "خدمة زيارة الممرض المنزلي",
    description: "Periodic home visits by a registered nurse for elderly or post-surgery family members.",
    description_ar: "زيارات منزلية دورية من قبل ممرض مرخص لأفراد الأسرة من كبار السن أو بعد العمليات الجراحية.",
    target_customer: "Families with elderly relatives who need check-ups, vitals, or basic care.",
    target_customer_ar: "العائلات التي لديها أقارب مسنون يحتاجون إلى فحوصات، أو قياس علامات حيوية، أو رعاية أساسية.",
    suggested_offer: "Monthly subscription: 1 visit/month, vitals check, medication review. AED 100–250 per visit.",
    suggested_offer_ar: "اشتراك شهري: زيارة واحدة شهريًا، فحص العلامات الحيوية، مراجعة الأدوية. ١٠٠-٢٥٠ درهم لكل زيارة.",
    first_actions: [
      "Partner with 1 licensed nurse or home-care agency in Al Ain.",
      "Run 1 pilot month with 3 families.",
      "Build a simple report card per visit for the family.",
    ],
    first_actions_ar: [
      "الشراكة مع ممرض مرخص أو وكالة رعاية منزلية في العين.",
      "تشغيل شهر تجريبي واحد مع ٣ عائلات.",
      "بناء بطاقة تقرير بسيطة لكل زيارة للعائلة.",
    ],
    risks: [
      "Strict licensing and liability for medical services.",
      "Need for medical-grade supplies and record-keeping.",
    ],
    risks_ar: [
      "تراخيص ومسؤوليات صارمة للخدمات الطبية.",
      "الحاجة إلى لوازم طبية وحفظ السجلات."
    ],
    complexity: "High",
    people: "1 nurse + 1 coordinator",
    people_ar: "ممرض واحد + منسق واحد",
    tools: "Basic medical kit, simple report forms",
    tools_ar: "حقيبة طبية أساسية، نماذج تقارير بسيطة",
    keywords: ["nurse", "home care", "ممرض", "رعاية", "elderly", "كبار السن"],
  },
  {
    category: "health_wellness",
    slug: "medicine-delivery",
    title: "Monthly Medicine Delivery",
    title_ar: "التوصيل الشهري للأدوية",
    description: "Subscription-based monthly delivery of chronic medicines from Al Ain pharmacies.",
    description_ar: "توصيل شهري قائم على الاشتراك للأدوية المزمنة من صيدليات العين.",
    target_customer: "Elderly residents and families with monthly prescriptions.",
    target_customer_ar: "كبار السن والعائلات التي لديها وصفات طبية شهرية.",
    suggested_offer: "AED 25–50/month flat fee for 1 scheduled delivery.",
    suggested_offer_ar: "رسوم ثابتة ٢٥-٥٠ درهم شهريًا لتوصيل مجدول واحد.",
    first_actions: [
      "Find a partner pharmacy that accepts repeat orders.",
      "Sign 10 families as launch customers.",
      "Define a strict pickup time and delivery window.",
    ],
    first_actions_ar: [
      "البحث عن صيدلية شريكة تقبل الطلبات المتكررة.",
      "توقيع ١٠ عائلات كعملاء إطلاق.",
      "تحديد وقت استلام نافذة وتوصيل صارمة.",
    ],
    risks: [
      "Liability for medication safety and timing.",
      "Pharmacy may charge a fee that erodes margin.",
    ],
    risks_ar: [
      "المسؤولية عن سلامة الدواء وتوقيته.",
      "قد تفرض الصيدلية رسومًا تؤثر على هامش الربح.",
    ],
    complexity: "Medium",
    people: "1 trusted driver",
    people_ar: "سائق واحد موثوق",
    tools: "Insulated bag, simple subscription list",
    tools_ar: "حقيبة عازلة، قائمة اشتراك بسيطة",
    keywords: ["medicine", "دواء", "pharmacy", "صيدلية", "delivery"],
  },
  {
    category: "tourism_stargazing",
    slug: "stargazing-visitor-pack",
    title: "Stargazing Visitor Pack",
    title_ar: "باقة زوار رصد النجوم",
    description: "A guided dark-sky experience for visitors to Al Qua'a — guide, snacks, parking, telescope, and a local story.",
    description_ar: "تجربة سماء مظلمة موجهة للزوار في Al Qua'a — مرشد، وجبات خفيفة، مواقف سيارات، تلسكوب، وقصة محلية.",
    target_customer: "Visitors coming for the dark-sky experience, mostly in cooler months (Oct–Mar).",
    target_customer_ar: "الزوار القادمون لتجربة رصد النجوم، معظمهم في الأشهر الأكثر برودة (أكتوبر-مارس).",
    suggested_offer: "2-hour guided session, 4–8 people, AED 100–250 per person. Optional telescope rental.",
    suggested_offer_ar: "جلسة إرشادية مدتها ساعتان، ٤-٨ أشخاص، ١٠٠-٢٥٠ درهم للشخص الواحد. إمكانية استئجار التلسكوب كخيار إضافي.",
    first_actions: [
      "Interview 5 visitors or 2 tour operators to validate the offer.",
      "Find a dark-sky spot with safe parking and test the route.",
      "Build a simple booking page and a WhatsApp contact.",
    ],
    first_actions_ar: [
      "مقابلة ٥ زوار أو ٢ من منظمي الرحلات السياحية للتحقق من العرض.",
      "البحث عن نقطة سماء مظلمة بها مواقف آمنة واختبار المسار.",
      "إنشاء صفحة حجز بسيطة وجهة اتصال واتساب.",
    ],
    risks: [
      "Highly seasonal — pair with daytime experiences to smooth revenue.",
      "Weather cancellations — clear refund/rain-check policy needed.",
      "Liability for visitors in remote desert spots.",
    ],
    risks_ar: [
      "موسمي للغاية — يجب دمجه مع تجارب نهارية لتسهيل الإيرادات.",
      "الإلغاءات بسبب الطقس — الحاجة إلى سياسة واضحة للاسترداد أو التعويض.",
      "المسؤولية القانونية عن الزوار في المواقع الصحراوية النائية.",
    ],
    complexity: "Medium",
    people: "1 guide + 1 host",
    people_ar: "مرشد واحد + مضيف واحد",
    tools: "Telescope, blanket, lantern, water, basic first-aid",
    tools_ar: "تلسكوب، بطانية، فانوس، مياه، إسعافات أولية أساسية",
    keywords: ["stargazing", "نجوم", "stars", "tourism", "سياحة", "telescope", "dark sky"],
  },
  {
    category: "tourism_stargazing",
    slug: "telescope-rental",
    title: "Telescope Rental for Visitors",
    title_ar: "تأجير التلسكوبات للزوار",
    description: "Rent a beginner-friendly telescope for an evening near Al Qua'a, with a 5-minute setup guide.",
    description_ar: "استئجار تلسكوب سهل للمبتدئين لقضاء أمسية بالقرب من Al Qua'a، مع دليل إعداد مدته ٥ دقائق.",
    target_customer: "Visitors who want a private stargazing experience without a tour.",
    target_customer_ar: "الزوار الذين يريدون تجربة رصد نجوم خاصة بدون جولة سياحية.",
    suggested_offer: "AED 50–100/night rental, with a printed star map.",
    suggested_offer_ar: "تأجير بقيمة ٥٠-١٠٠ درهم لليلة الواحدة، مع خريطة نجوم مطبوعة.",
    first_actions: [
      "Buy 2 beginner telescopes with a wide field of view.",
      "Test them on 3 different nights for setup time and image quality.",
      "Set a deposit policy to protect the equipment.",
    ],
    first_actions_ar: [
      "شراء تلسكوبين للمبتدئين مع مجال رؤية واسع.",
      "اختبارهم في ٣ ليالٍ مختلفة لقياس وقت الإعداد وجودة الصورة.",
      "وضع سياسة تأمين لحماية المعدات.",
    ],
    risks: [
      "Equipment damage and dust.",
      "Limited audience size — may need to be combined with a guided offer.",
    ],
    risks_ar: [
      "تلف المعدات والغبار.",
      "حجم جمهور محدود — قد يحتاج إلى دمجه مع عرض إرشادي.",
    ],
    complexity: "Low",
    people: "1 operator",
    people_ar: "مشغل واحد",
    tools: "2 telescopes, printed star maps, cleaning kit",
    tools_ar: "تلسكوبان، خرائط نجوم مطبوعة، مجموعة أدوات تنظيف",
    keywords: ["telescope", "تلسكوب", "rental", "stars", "نجوم"],
  },
  {
    category: "government_paperwork",
    slug: "paperwork-help-desk",
    title: "Paperwork Help Desk",
    title_ar: "مكتب المساعدة في المعاملات الورقية",
    description: "Walk-in help for online forms, document scanning, typing, and translation between Arabic and English.",
    description_ar: "مساعدة فورية للنماذج عبر الإنترنت، مسح المستندات ضوئيًا، الكتابة، والترجمة بين العربية والإنجليزية.",
    target_customer: "Residents who struggle with government websites or English-language forms.",
    target_customer_ar: "السكان الذين يواجهون صعوبة في المواقع الحكومية أو النماذج باللغة الإنجليزية.",
    suggested_offer: "Drop-in service at a fixed location + WhatsApp booking. AED 25–50 per task.",
    suggested_offer_ar: "خدمة فورية في موقع ثابت + حجز عبر الواتساب. ٢٥-٥٠ درهم لكل مهمة.",
    first_actions: [
      "List the top 5 government forms residents struggle with.",
      "Prepare 1-page 'cheat sheets' for each form.",
      "Run 1 free day to learn where people actually get stuck.",
    ],
    first_actions_ar: [
      "قائمة بأهم ٥ نماذج حكومية يعاني السكان معها.",
      "إعداد 'ورقة غش' من صفحة واحدة لكل نموذج.",
      "تشغيل يوم مجاني واحد لمعرفة أين يواجه الناس صعوبة حقيقية.",
    ],
    risks: [
      "Sensitive personal data — privacy and security are critical.",
      "Demand may be lumpy around government deadlines (school enrollment, license renewal).",
    ],
    risks_ar: [
      "بيانات شخصية حساسة — الخصوصية والأمان أمران بالغي الأهمية.",
      "قد يكون الطلب متقطعًا حول المواعيد النهائية الحكومية (تسجيل المدارس، تجديد الرخص).",
    ],
    complexity: "Low",
    people: "1 trained helper",
    people_ar: "مساعد مدرب واحد",
    tools: "Laptop, scanner, printer, secure file storage",
    tools_ar: "كمبيوتر محمول، ماسح ضوئي، طابعة، تخزين ملفات آمن",
    keywords: ["paperwork", "forms", "نموذج", "أوراق", "translation", "ترجمة", "scan"],
  },
  {
    category: "events_community",
    slug: "weekend-football-league",
    title: "Weekend Football League",
    title_ar: "دوري كرة القدم في عطلة نهاية الأسبوع",
    description: "A regular weekend football match for youth and adults in Al Qua'a, with simple standings and a small trophy.",
    description_ar: "مباراة كرة قدم منتظمة في عطلة نهاية الأسبوع للشباب والكبار في Al Qua'a، مع ترتيب بسيط وكأس صغير.",
    target_customer: "Youth and adult residents looking for safe, organized sport on weekends.",
    target_customer_ar: "الشباب والسكان البالغون الذين يبحثون عن رياضة آمنة ومنظمة في عطلات نهاية الأسبوع.",
    suggested_offer: "Free to enter; AED 10–20/match as a small team fee for balls and refs.",
    suggested_offer_ar: "الدخول مجاني؛ ١٠-٢٠ درهم للمباراة كرسوم فريق صغيرة للكرات والحكام.",
    first_actions: [
      "Recruit 2 team captains and a part-time referee.",
      "Book a pitch (school yard or open field) for 4 hours on Saturdays.",
      "Start a WhatsApp group and post a 6-week schedule.",
    ],
    first_actions_ar: [
      "توظيف كابتنين للفريق وحكم جزء من الوقت.",
      "حجز ملعب (ساحة مدرسة أو ملعب مفتوح) لمدة ٤ ساعات في أيام السبت.",
      "بدء مجموعة واتساب ونشر جدول زمني مدته ٦ أسابيع.",
    ],
    risks: [
      "Weather in summer limits outdoor play.",
      "Need a first-aid kit and clear safety rules.",
    ],
    risks_ar: [
      "الطقس في الصيف يحد من اللعب في الهواء الطلق.",
      "الحاجة إلى حقيبة إسعافات أولية وقواعد سلامة واضحة.",
    ],
    complexity: "Low",
    people: "1 organizer + 1 referee",
    people_ar: "منظم واحد + حكم واحد",
    tools: "Balls, bibs, small first-aid kit, WhatsApp group",
    tools_ar: "كرات، صدريات رياضة، حقيبة إسعافات أولية صغيرة، مجموعة واتساب",
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

const SEVEN_DAY_CHECKLIST_AR = [
  "اليوم ١: مقابلة ٥ عملاء محتملين حول الاحتياج المحدد.",
  "اليوم ٢: تحديد ٢ من الموردين أو شركاء تقديم الخدمة.",
  "اليوم ٣: تقدير التكلفة الإجمالية لكل عملية توصيل أو خدمة.",
  "اليوم ٤: إنشاء عرض بسيط (السعر، الجدول الزمني، رابط الواتساب).",
  "اليوم ٥: الاختبار مع أول عميل أو مجموعة تجريبية.",
  "اليوم ٦: جمع الآراء وتحسين العرض.",
  "اليوم ٧: اتخاذ قرار بالاستمرار، أو تغيير الاتجاه، أو التوقف — وتسجيل الدروس المستفادة.",
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
      title_ar: tpl.title_ar,
      slug: tpl.slug,
      category: cluster.category,
      description: tpl.description,
      description_ar: tpl.description_ar,
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
      target_customer_ar: tpl.target_customer_ar,
      suggested_offer: tpl.suggested_offer,
      suggested_offer_ar: tpl.suggested_offer_ar,
      first_actions: tpl.first_actions,
      first_actions_ar: tpl.first_actions_ar,
      seven_day_checklist: SEVEN_DAY_CHECKLIST,
      seven_day_checklist_ar: SEVEN_DAY_CHECKLIST_AR,
      risks: tpl.risks,
      risks_ar: tpl.risks_ar,
      resources_needed: {
        people: tpl.people,
        people_ar: tpl.people_ar,
        tools: tpl.tools,
        tools_ar: tpl.tools_ar,
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
