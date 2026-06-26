"use client"

import Link from "next/link"
import { useLang } from "@/lib/i18n/LanguageProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, ExternalLink, FileText, Lightbulb, ShieldCheck, Sparkles, TrendingUp } from "lucide-react"
import type { Confidence } from "@/lib/types"
import { DICT } from "@/lib/i18n/dict"
import type { Language } from "@/lib/i18n/dict"

interface Props {
  kpis: {
    totalResponses: number
    uniqueNeeds: number
    topCategory: string | null
    avgUrgency: number
    providerGapRate: number
    demoCount: number
    liveCount: number
  }
  topOpportunity: {
    title: string
    score: number
    confidence: Confidence
    response_count: number
  } | null
  mode: "demo" | "live" | "mixed"
}

export function EvidenceClient({ kpis, topOpportunity, mode }: Props) {
  const { t, lang } = useLang()
  const dir = lang === "ar" ? "rtl" : "ltr"
  const claims = (DICT[lang as Language] as unknown as Record<string, readonly string[]>)["ev.body.claims"] ?? []
  const limits = (DICT[lang as Language] as unknown as Record<string, readonly string[]>)["ev.body.limits"] ?? []
  const scale = (DICT[lang as Language] as unknown as Record<string, readonly string[]>)["ev.body.scale"] ?? []
  const cost = (DICT[lang as Language] as unknown as Record<string, readonly string[]>)["ev.body.cost"] ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6" dir={dir}>
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{t("brand.name")}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{t("ev.title")}</h1>
        <p className="text-muted-foreground text-sm md:text-base mt-1 max-w-2xl">{t("ev.subtitle")}</p>
      </div>

      {/* Live metrics snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric label="Total responses" value={kpis.totalResponses.toString()} />
        <Metric label="Live / demo" value={`${kpis.liveCount} / ${kpis.demoCount}`} />
        <Metric label="Top opportunity" value={topOpportunity ? `${topOpportunity.title} (${topOpportunity.score})` : "—"} small />
        <Metric label="Data mode" value={mode === "demo" ? t("dash.dataBadge.demo") : mode === "live" ? t("dash.dataBadge.live") : t("dash.dataBadge.mixed")} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-palm" /> {t("ev.claims.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 list-decimal ps-5 text-sm">
            {claims.map((c, i) => (
              <li key={i} className="leading-relaxed">{c}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" /> {t("ev.evidence.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row k="Total responses" v={kpis.totalResponses.toString()} />
            <Row k="Live responses" v={kpis.liveCount.toString()} />
            <Row k="Demo responses" v={kpis.demoCount.toString()} />
            <Row k="Unique needs" v={kpis.uniqueNeeds.toString()} />
            <Row k="Top category" v={kpis.topCategory ?? "—"} />
            <Row k="Average urgency" v={`${kpis.avgUrgency}/5`} />
            <Row k="Provider gap" v={`${Math.round(kpis.providerGapRate * 100)}%`} />
            <Row k="Top opportunity" v={topOpportunity ? `${topOpportunity.title} — ${topOpportunity.score}/100 (${topOpportunity.confidence} confidence, ${topOpportunity.response_count} responses)` : "—"} />
            <p className="text-xs text-muted-foreground pt-2 border-t border-border">{t("ev.body.demo")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> {t("ev.method.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{t("ev.method.body")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> {t("ev.limits.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm list-disc ps-5">
              {limits.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-palm" /> {t("ev.scale.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm list-disc ps-5">
              {scale.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> {t("ev.cost.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm list-disc ps-5">
            {cost.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 pt-2">
        <Link href="/dashboard">
          <Button>{t("nav.dashboard")}</Button>
        </Link>
        <Link href="/opportunities">
          <Button variant="outline">{t("nav.opportunities")}</Button>
        </Link>
        <Link href="/demo">
          <Button variant="outline">{t("nav.demo")} <ExternalLink className="h-3.5 w-3.5 ms-1.5" /></Button>
        </Link>
      </div>
    </div>
  )
}

function Metric({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-bold mt-0.5 ${small ? "text-sm" : "text-2xl"}`}>{value}</div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/40 last:border-0 pb-1.5">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-end">{v}</span>
    </div>
  )
}
