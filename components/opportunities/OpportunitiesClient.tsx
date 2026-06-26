"use client"

import Link from "next/link"
import { useLang } from "@/lib/i18n/LanguageProvider"
import { useOpportunities, useResponses } from "@/lib/hooks/useData"
import { categoryIcon, categoryLabel } from "@/lib/constants"
import type { Opportunity } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Lightbulb, ArrowRight, TrendingUp, Users, Calendar, Sparkles, ShieldCheck, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

export function OpportunitiesClient() {
  const { lang, t } = useLang()
  const dir = lang === "ar" ? "rtl" : "ltr"
  const { opportunities, isLoading } = useOpportunities()
  const { responses } = useResponses()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8" dir={dir}>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
            <span>{t("brand.name")}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{t("opp.title")}</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1 max-w-2xl">{t("opp.subtitle")}</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">{t("nav.dashboard")}</Button>
        </Link>
      </div>

      {isLoading && opportunities.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">{t("generic.loading")}</div>
      ) : opportunities.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            {t("opp.empty")}
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/survey">
                <Button>{t("nav.survey")}</Button>
              </Link>
              <Link href="/api/seed">
                <Button variant="outline">Seed demo data</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {opportunities.map((o) => (
            <OpportunityCard key={o.id} opp={o} lang={lang} t={t} dir={dir} />
          ))}
        </div>
      )}
    </div>
  )
}

function OpportunityCard({
  opp,
  lang,
  t,
  dir,
}: {
  opp: Opportunity
  lang: "en" | "ar"
  t: (k: string) => string
  dir: "ltr" | "rtl"
}) {
  const confidenceVariant = {
    low: "secondary",
    medium: "default",
    high: "default",
  } as const
  const Arrow = lang === "ar" ? ArrowRight : ArrowRight
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{categoryIcon(opp.category)}</span>
            <div className="text-xs text-muted-foreground">{categoryLabel(opp.category, lang)}</div>
          </div>
          <Badge variant={confidenceVariant[opp.confidence_level]} className="capitalize">
            {t(`opp.confidence.${opp.confidence_level}`)}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-1">{opp.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{opp.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold leading-none">{opp.opportunity_score}</div>
          <div className="text-xs text-muted-foreground">/ 100</div>
          <div className="flex-1">
            <Progress value={opp.opportunity_score} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Stat icon={<Users className="h-3.5 w-3.5" />} label={t("opp.card.responses")} value={opp.response_count.toString()} />
          <Stat icon={<TrendingUp className="h-3.5 w-3.5" />} label={t("opp.card.urgency")} value={`${opp.average_urgency}/5`} />
          <Stat icon={<ShieldCheck className="h-3.5 w-3.5" />} label={t("opp.card.providerGap")} value={`${Math.round(opp.provider_gap_rate * 100)}%`} />
          <Stat icon={<Calendar className="h-3.5 w-3.5" />} label={t("opp.card.recurring")} value={`${Math.round(opp.recurring_rate * 100)}%`} />
          <Stat icon={<Wallet className="h-3.5 w-3.5" />} label={t("opp.card.pay")} value={`${Math.round(opp.pay_signal_rate * 100)}%`} />
          <Stat icon={<Sparkles className="h-3.5 w-3.5" />} label={t("opp.detail.evidence.phrases")} value={opp.common_phrases[0] ?? "—"} />
        </div>

        <div className="rounded-md bg-secondary/40 border border-border p-3 text-xs">
          <div className="font-semibold text-secondary-foreground mb-1">
            {t("opp.card.firstAction")}
          </div>
          <div className="text-foreground/80 line-clamp-2">{opp.first_actions[0]}</div>
        </div>

        <Link href={`/opportunities/${encodeURIComponent(opp.id)}`} className="block">
          <Button className="w-full">
            {t("opp.card.view")} <Arrow className="h-4 w-4 ms-1.5 rtl:rotate-180" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-card px-2.5 py-1.5">
      <div className="flex items-center gap-1 text-muted-foreground text-[10px] uppercase tracking-wide">
        {icon} {label}
      </div>
      <div className="text-sm font-semibold mt-0.5 truncate">{value}</div>
    </div>
  )
}
