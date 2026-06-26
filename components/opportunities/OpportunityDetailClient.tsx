"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useLang } from "@/lib/i18n/LanguageProvider"
import { useOpportunities, useResponses } from "@/lib/hooks/useData"
import { areaLabel, categoryIcon, categoryLabel, labelFor } from "@/lib/constants"
import type { FounderBrief } from "@/lib/scoring/brief"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sparkles, ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb, Loader2, ListChecks, Wrench, MessageSquareQuote, Target } from "lucide-react"

export function OpportunityDetailClient({ id }: { id: string }) {
  const { lang, t } = useLang()
  const dir = lang === "ar" ? "rtl" : "ltr"
  const { opportunities, isLoading } = useOpportunities()
  const { responses } = useResponses()
  const opp = useMemo(() => opportunities.find((o) => o.id === id) ?? null, [opportunities, id])

  const [brief, setBrief] = useState<FounderBrief | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [briefShown, setBriefShown] = useState(false)

  // Compute freq distribution regardless of loading state to keep hook order stable.
  const freqDist = useMemo(() => {
    if (!opp) return [] as { key: string; label: string; count: number }[]
    const counts = new Map<string, number>()
    for (const r of responses) {
      if (opp.matching_response_ids.includes(r.id)) {
        counts.set(r.frequency, (counts.get(r.frequency) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries()).map(([k, v]) => ({ key: k, label: labelFor(k, lang), count: v }))
  }, [responses, opp, lang])

  async function generateBrief() {
    if (!opp) return
    setBriefLoading(true)
    setBriefShown(true)
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: opp.id }),
      })
      const data = await res.json()
      if (data?.brief) setBrief(data.brief)
    } catch (e) {
      console.error(e)
    } finally {
      setBriefLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-muted-foreground">
        {t("generic.loading")}
      </div>
    )
  }

  if (!opp) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="text-muted-foreground">{t("opp.empty")}</p>
        <Link href="/opportunities">
          <Button className="mt-4">{t("opp.detail.back")}</Button>
        </Link>
      </div>
    )
  }

  const sampleAnonymized = opp.sample_responses
  const Arrow = lang === "ar" ? ArrowLeft : ArrowLeft

  return (
    <div className="mx-auto max-w-5xl px-4 py-8" dir={dir}>
      <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3">
        <Arrow className="h-4 w-4" /> {t("opp.detail.back")}
      </Link>

      {/* Summary header */}
      <Card className="mb-5 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-gold/15 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{categoryIcon(opp.category)}</span>
            <span className="text-sm text-muted-foreground">{categoryLabel(opp.category, lang)}</span>
            <Badge variant="secondary" className="ms-auto capitalize">
              {t(`opp.confidence.${opp.confidence_level}`)}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{lang === "ar" ? opp.title_ar : opp.title}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">{lang === "ar" ? opp.description_ar : opp.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="default">Score {opp.opportunity_score}/100</Badge>
            <Badge variant="outline">{opp.response_count} {t("opp.card.responses")}</Badge>
            {opp.top_area && <Badge variant="outline">{areaLabel(opp.top_area, lang)}</Badge>}
            <Badge variant="outline">{t(`opp.detail.complexity.${opp.resources_needed.complexity}`)}</Badge>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Evidence panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-palm" /> {t("opp.detail.evidence")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <EvidenceStat label={t("opp.detail.evidence.count")} value={opp.response_count.toString()} />
                <EvidenceStat label={t("opp.detail.evidence.urgency")} value={`${opp.average_urgency}/5`} />
                <EvidenceStat label={t("opp.detail.evidence.gap")} value={`${Math.round(opp.provider_gap_rate * 100)}%`} />
                <EvidenceStat label={t("opp.card.pay")} value={`${Math.round(opp.pay_signal_rate * 100)}%`} />
              </div>

              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1.5">{t("opp.card.why")}</div>
                <div className="space-y-1.5">
                  <ScoreLine label="Demand (35)" value={(35 * (opp.response_count / Math.max(opp.response_count, 1))).toFixed(1)} max={35} />
                  <ScoreLine label="Urgency (25)" value={(25 * (opp.average_urgency / 5)).toFixed(1)} max={25} />
                  <ScoreLine label="Provider gap (15)" value={(15 * opp.provider_gap_rate).toFixed(1)} max={15} />
                  <ScoreLine label="Recurring (15)" value={(15 * opp.recurring_rate).toFixed(1)} max={15} />
                  <ScoreLine label="Pay signal (10)" value={(10 * opp.pay_signal_rate).toFixed(1)} max={10} />
                </div>
              </div>

              {freqDist.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1.5">{t("opp.detail.evidence.frequency")}</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {freqDist.map((f) => (
                      <span key={f.key} className="rounded-md border border-border bg-muted/50 px-2 py-1">
                        {f.label}: <span className="font-semibold">{f.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {opp.common_phrases.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1.5">{t("opp.detail.evidence.phrases")}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {opp.common_phrases.slice(0, 8).map((p) => (
                      <span key={p} className="rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* First actions + checklist */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-palm" /> {t("opp.detail.actions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 list-decimal ps-5 text-sm">
                {(lang === "ar" ? opp.first_actions_ar : opp.first_actions).map((a, i) => (
                  <li key={i} className="leading-relaxed">{a}</li>
                ))}
              </ol>

              <h3 className="mt-5 mb-2 text-sm font-semibold flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-gold" /> {t("opp.detail.checklist")}
              </h3>
              <ol className="space-y-1.5 text-xs text-muted-foreground">
                {(lang === "ar" ? opp.seven_day_checklist_ar : opp.seven_day_checklist).map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <input type="checkbox" className="mt-0.5" />
                    <span>{a}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Founder brief */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" /> {t("opp.detail.brief")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!briefShown && (
                <Button onClick={generateBrief} disabled={briefLoading}>
                  {briefLoading ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : <Sparkles className="h-4 w-4 me-2" />}
                  {briefLoading ? t("opp.detail.brief.loading") : t("opp.detail.brief")}
                </Button>
              )}
              {briefShown && (
                <div>
                  <Badge variant="outline" className="mb-3">
                    {brief?.source === "ai" ? t("opp.detail.brief.ai") : t("opp.detail.brief.fallback")}
                  </Badge>
                  {briefLoading ? (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> {t("opp.detail.brief.loading")}
                    </div>
                  ) : brief ? (
                    <div className="space-y-4">
                      <BriefSection title={t("opp.detail.brief.idea")} body={brief.idea} />
                      <BriefSection title={t("opp.detail.brief.target")} body={brief.target_customers} />
                      <BriefList title={t("opp.detail.brief.actions")} items={brief.first_actions} />
                      <BriefList title={t("opp.detail.brief.questions")} items={brief.validation_questions} />
                      <BriefList title={t("opp.detail.brief.risks")} items={brief.risks} />
                      <BriefList title={t("opp.detail.brief.metrics")} items={brief.success_metrics} />
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related responses */}
          {sampleAnonymized.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquareQuote className="h-4 w-4 text-primary" /> {t("opp.detail.related")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {sampleAnonymized.map((r) => (
                    <li key={r.id} className="rounded-lg border border-border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-sm">{r.title}</div>
                        <Badge variant="secondary">Urgency {r.urgency}</Badge>
                      </div>
                      {r.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">{areaLabel(r.area, lang)}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" /> {t("opp.detail.target")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm">{lang === "ar" ? opp.target_customer_ar : opp.target_customer}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> {t("opp.detail.offer")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{lang === "ar" ? opp.suggested_offer_ar : opp.suggested_offer}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" /> {t("opp.detail.risks")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm">
                {(lang === "ar" ? opp.risks_ar : opp.risks).map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-destructive shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wrench className="h-4 w-4" /> {t("opp.detail.resources")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <div className="text-xs font-semibold text-muted-foreground">{t("opp.detail.resources.people")}</div>
                <div>{lang === "ar" ? opp.resources_needed.people_ar : opp.resources_needed.people}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground">{t("opp.detail.resources.tools")}</div>
                <div>{lang === "ar" ? opp.resources_needed.tools_ar : opp.resources_needed.tools}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground">{t("opp.detail.resources.complexity")}</div>
                <Badge variant="secondary">{t(`opp.detail.complexity.${opp.resources_needed.complexity}`)}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function EvidenceStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-base font-semibold mt-0.5">{value}</div>
    </div>
  )
}

function ScoreLine({ label, value, max }: { label: string; value: string; max: number }) {
  const num = Number(value)
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value} / {max}</span>
      </div>
      <Progress value={Math.min(100, (num / max) * 100)} className="h-1.5 mt-1" />
    </div>
  )
}

function BriefSection({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1">{title}</div>
      <p className="text-sm leading-relaxed">{body}</p>
    </div>
  )
}

function BriefList({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1">{title}</div>
      <ul className="space-y-1.5 text-sm list-disc ps-5">
        {items.map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>
    </div>
  )
}
