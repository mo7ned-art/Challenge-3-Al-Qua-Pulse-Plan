// Dashboard aggregations and filters.

import { RECURRING_FREQUENCIES, WTP_WEIGHT, isProviderGap, categoryLabel } from "../constants"
import type { Language, SurveyResponse } from "../types"

export interface DashboardFilters {
  category?: string
  area?: string
  respondentType?: string
  frequency?: string
  provider?: "yes" | "no" | "not_sure" | "all"
  timeRange?: "all" | "today" | "7d" | "30d"
}

export function applyFilters(
  responses: SurveyResponse[],
  filters: DashboardFilters,
): SurveyResponse[] {
  const now = Date.now()
  const dayMs = 86400 * 1000
  return responses.filter((r) => {
    if (r.is_deleted) return false
    if (filters.category && filters.category !== "all" && r.category !== filters.category) return false
    if (filters.area && filters.area !== "all" && r.area !== filters.area) return false
    if (
      filters.respondentType &&
      filters.respondentType !== "all" &&
      r.respondent_type !== filters.respondentType
    )
      return false
    if (filters.frequency && filters.frequency !== "all" && r.frequency !== filters.frequency) return false
    if (filters.provider && filters.provider !== "all" && r.has_local_provider !== filters.provider)
      return false
    if (filters.timeRange && filters.timeRange !== "all") {
      const age = (now - new Date(r.created_at).getTime()) / dayMs
      if (filters.timeRange === "today" && age > 1) return false
      if (filters.timeRange === "7d" && age > 7) return false
      if (filters.timeRange === "30d" && age > 30) return false
    }
    return true
  })
}

export interface Kpis {
  totalResponses: number
  uniqueNeeds: number
  topCategory: string | null
  avgUrgency: number
  providerGapRate: number
  topArea: string | null
  demoCount: number
  liveCount: number
  importedCount: number
}

export function computeKpis(responses: SurveyResponse[], lang: Language): Kpis {
  if (responses.length === 0) {
    return {
      totalResponses: 0,
      uniqueNeeds: 0,
      topCategory: null,
      avgUrgency: 0,
      providerGapRate: 0,
      topArea: null,
      demoCount: 0,
      liveCount: 0,
      importedCount: 0,
    }
  }
  const titles = new Set(responses.map((r) => r.need_title.toLowerCase().trim()).filter(Boolean))
  const byCategory = new Map<string, number>()
  for (const r of responses) {
    byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + 1)
  }
  let topCategory: string | null = null
  let topCount = 0
  for (const [cat, count] of byCategory) {
    if (count > topCount) {
      topCount = count
      topCategory = cat
    }
  }
  const byArea = new Map<string, number>()
  for (const r of responses) {
    byArea.set(r.area, (byArea.get(r.area) ?? 0) + 1)
  }
  let topArea: string | null = null
  let topAreaCount = 0
  for (const [area, count] of byArea) {
    if (count > topAreaCount) {
      topAreaCount = count
      topArea = area
    }
  }
  const avgUrgency = responses.reduce((s, r) => s + r.urgency, 0) / responses.length
  const providerGapRate =
    responses.filter((r) => isProviderGap(r.has_local_provider)).length / responses.length
  const demoCount = responses.filter((r) => r.source_type === "demo").length
  const liveCount = responses.filter((r) => r.source_type === "live").length
  const importedCount = responses.filter((r) => r.source_type === "imported").length
  return {
    totalResponses: responses.length,
    uniqueNeeds: titles.size,
    topCategory: topCategory ? categoryLabel(topCategory, lang) : null,
    avgUrgency: Number(avgUrgency.toFixed(2)),
    providerGapRate: Number(providerGapRate.toFixed(2)),
    topArea,
    demoCount,
    liveCount,
    importedCount,
  }
}

export interface ChartData {
  demandByCategory: { category: string; categoryValue: string; count: number }[]
  urgencyByCategory: { category: string; avgUrgency: number }[]
  providerGap: { label: string; value: number; key: "yes" | "no" | "not_sure" }[]
  frequencyMix: { frequency: string; count: number }[]
  areaActivity: {
    area: string
    count: number
    topNeed: string | null
    avgUrgency: number
  }[]
}

export function computeCharts(responses: SurveyResponse[], lang: Language): ChartData {
  // Demand by category
  const catCounts = new Map<string, number>()
  for (const r of responses) catCounts.set(r.category, (catCounts.get(r.category) ?? 0) + 1)
  const demandByCategory = Array.from(catCounts.entries())
    .map(([category, count]) => ({
      categoryValue: category,
      category: categoryLabel(category, lang),
      count,
    }))
    .sort((a, b) => b.count - a.count)

  // Urgency by category
  const catUrgency = new Map<string, number[]>()
  for (const r of responses) {
    const arr = catUrgency.get(r.category) ?? []
    arr.push(r.urgency)
    catUrgency.set(r.category, arr)
  }
  const urgencyByCategory = Array.from(catUrgency.entries()).map(([cat, urgencies]) => ({
    category: categoryLabel(cat, lang),
    avgUrgency: Number((urgencies.reduce((s, n) => s + n, 0) / urgencies.length).toFixed(2)),
  }))

  // Provider gap donut
  let yes = 0, no = 0, notSure = 0
  for (const r of responses) {
    if (r.has_local_provider === "yes") yes++
    else if (r.has_local_provider === "no") no++
    else notSure++
  }
  const providerGap: ChartData["providerGap"] = [
    { key: "yes", label: lang === "ar" ? "يوجد مزوّد" : "Has provider", value: yes },
    { key: "no", label: lang === "ar" ? "لا يوجد" : "No provider", value: no },
    { key: "not_sure", label: lang === "ar" ? "غير متأكد" : "Not sure", value: notSure },
  ]

  // Frequency mix
  const freqCounts = new Map<string, number>()
  for (const r of responses) freqCounts.set(r.frequency, (freqCounts.get(r.frequency) ?? 0) + 1)
  const frequencyMix = Array.from(freqCounts.entries()).map(([frequency, count]) => ({
    frequency,
    count,
  }))

  // Area activity
  const areaGroups = new Map<string, SurveyResponse[]>()
  for (const r of responses) {
    const arr = areaGroups.get(r.area) ?? []
    arr.push(r)
    areaGroups.set(r.area, arr)
  }
  const areaActivity: ChartData["areaActivity"] = []
  for (const [area, rs] of areaGroups) {
    const counts = new Map<string, number>()
    for (const r of rs) counts.set(r.need_title, (counts.get(r.need_title) ?? 0) + 1)
    let topNeed: string | null = null
    let topNeedCount = 0
    for (const [t, c] of counts) {
      if (c > topNeedCount) {
        topNeed = t
        topNeedCount = c
      }
    }
    const avg = rs.reduce((s, r) => s + r.urgency, 0) / rs.length
    areaActivity.push({ area, count: rs.length, topNeed, avgUrgency: Number(avg.toFixed(2)) })
  }
  areaActivity.sort((a, b) => b.count - a.count)

  return { demandByCategory, urgencyByCategory, providerGap, frequencyMix, areaActivity }
}

export function generateInsight(responses: SurveyResponse[], lang: Language): string {
  if (responses.length === 0) {
    return lang === "ar"
      ? "لا توجد بيانات كافية بعد. شجّع السكان على إرسال إجاباتهم."
      : "Not enough data yet. Encourage residents to submit their needs."
  }
  const kpis = computeKpis(responses, lang)
  const opportunityPhrases = new Set(responses.filter((r) => isProviderGap(r.has_local_provider)).map((r) => r.need_title.toLowerCase()))
  const mostRepeated = Array.from(opportunityPhrases)
    .map((t) => ({ t, c: responses.filter((r) => r.need_title.toLowerCase() === t).length }))
    .sort((a, b) => b.c - a.c)[0]
  if (lang === "ar") {
    return (
      `أعلى طلب غير ملبّى حاليًا في فئة: ${kpis.topCategory ?? "—"}. ` +
      `متوسط الإلحاح: ${kpis.avgUrgency.toFixed(1)} من ٥. ` +
      (mostRepeated ? `الاحتكار المتكرر: ${mostRepeated.t}. ` : "") +
      `فرصة مقترحة: ${kpis.topCategory ?? "—"}.`
    )
  }
  return (
    `The highest unmet demand is currently in ${kpis.topCategory ?? "—"}. ` +
    `Average urgency is ${kpis.avgUrgency.toFixed(1)} of 5. ` +
    (mostRepeated ? `Most repeated need: ${mostRepeated.t}. ` : "") +
    `Suggested focus: ${kpis.topCategory ?? "—"}.`
  )
}

export function dataMode(responses: SurveyResponse[]): "demo" | "live" | "mixed" {
  const hasDemo = responses.some((r) => r.source_type === "demo")
  const hasLive = responses.some((r) => r.source_type === "live" || r.source_type === "imported")
  if (hasDemo && hasLive) return "mixed"
  if (hasDemo) return "demo"
  return "live"
}

export const RECURRING_SET = RECURRING_FREQUENCIES
export { WTP_WEIGHT }
