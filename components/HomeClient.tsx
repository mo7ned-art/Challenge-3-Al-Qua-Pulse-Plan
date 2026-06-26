"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, TrendingUp, Users, ShieldCheck, BarChart3, Lightbulb, CheckCircle2, MapPin } from "lucide-react"
import { useLang } from "@/lib/i18n/LanguageProvider"
import { computeKpis } from "@/lib/scoring/dashboard"
import { computeOpportunities } from "@/lib/scoring/opportunities"
import { LandingClient } from "@/components/LandingClient"
import type { SurveyResponse } from "@/lib/types"

export function HomeClient({ initialResponses }: { initialResponses: SurveyResponse[] }) {
  const { lang, t, dir } = useLang()

  const kpis = useMemo(() => computeKpis(initialResponses, lang), [initialResponses, lang])
  const opportunities = useMemo(() => computeOpportunities(initialResponses), [initialResponses])
  const top = opportunities[0]

  return (
    <div dir={dir}>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 pulse-stars opacity-60 pointer-events-none" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground mb-5">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              {t("landing.hero.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              {lang === "ar" ? (
                <>
                  نبض <span className="text-primary">القوع</span>
                </>
              ) : (
                <>
                  Al Qua'a <span className="text-primary">Pulse</span>
                </>
              )}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              {t("landing.hero.description")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/survey"
                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
              >
                {t("landing.cta.submit")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted transition"
              >
                {t("landing.cta.dashboard")}
              </Link>
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted transition"
              >
                {t("landing.cta.opportunities")}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-palm" /> {t("landing.hero.sub.anonymous")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {t("landing.hero.sub.rural")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {t("landing.hero.sub.location")}
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<BarChart3 className="h-4 w-4" />}
                label={t("landing.stats.total")}
                value={String(kpis.totalResponses)}
                accent="primary"
              />
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label={t("landing.stats.topCategory")}
                value={kpis.topCategory ?? "—"}
                accent="palm"
              />
              <StatCard
                icon={<Lightbulb className="h-4 w-4" />}
                label={t("landing.stats.topOpp")}
                value={top ? `${top.opportunity_score}/100` : "—"}
                accent="gold"
              />
              <StatCard
                icon={<ShieldCheck className="h-4 w-4" />}
                label={t("dash.kpi.providerGap")}
                value={kpis.providerGapRate ? `${Math.round(kpis.providerGapRate * 100)}%` : "—"}
                accent="midnight"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-4 py-14 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold tracking-tight">{t("landing.problem.title")}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t("landing.problem.subtitle")}
          </p>
        </div>
        <div className="md:col-span-2 space-y-3 text-foreground/80">
          <p>
            {t("landing.problem.body")}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card/40 border-y border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold tracking-tight mb-8">{t("landing.how.title")}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { n: 1, title: t("landing.how.step1.title"), body: t("landing.how.step1.body") },
              { n: 2, title: t("landing.how.step2.title"), body: t("landing.how.step2.body") },
              { n: 3, title: t("landing.how.step3.title"), body: t("landing.how.step3.body") },
              { n: 4, title: t("landing.how.step4.title"), body: t("landing.how.step4.body") },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-border bg-card p-5">
                <div className="text-2xl font-bold text-primary/80">0{s.n}</div>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bilingual switch demo */}
      <LandingClient />

      {/* Community fit */}
      <section className="mx-auto max-w-6xl px-4 py-14 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("landing.fit.title")}</h2>
          <p className="mt-3 text-foreground/80">
            {t("landing.fit.body")}
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            {[
              t("landing.fit.list1"),
              t("landing.fit.list2"),
              t("landing.fit.list3"),
              t("landing.fit.list4"),
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-palm shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground">{t("landing.example.title")}</h3>
          <p className="mt-2 text-xl font-bold leading-tight">
            {top ? (lang === "ar" && top.id === "camel-feed-delivery" ? "توصيل أعلاف الإبل" : top.title) : "Camel Feed Delivery Route"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {top ? (lang === "ar" && top.id === "camel-feed-delivery" ? "خدمة توصيل أسبوعية تجلب أعلاف الإبل بكميات كبيرة للمزارع في شمال وجنوب القوع." : top.description) : "A weekly delivery service that brings bulk camel feed to farms north and south of Al Qua'a."}
          </p>
          {top && (
            <div className="mt-4 flex items-center gap-3 text-xs">
              <span className="rounded-md bg-primary/10 text-primary px-2 py-1 font-semibold">
                {lang === "ar" ? "التقييم" : "Score"} {top.opportunity_score}/100
              </span>
              <span className="rounded-md bg-secondary text-secondary-foreground px-2 py-1 font-semibold capitalize">
                {t(`opp.confidence.${top.confidence_level}`)}
              </span>
              <span className="rounded-md bg-muted px-2 py-1">
                {top.response_count} {t("opp.card.responses")}
              </span>
            </div>
          )}
          <Link
            href="/opportunities"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            {t("landing.example.view")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("landing.cta.title")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {t("landing.cta.body")}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/survey"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
            >
              {t("landing.cta.submit")}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted transition"
            >
              {t("landing.cta.dashboard")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent: "primary" | "palm" | "gold" | "midnight"
}) {
  const accentClass = {
    primary: "text-primary",
    palm: "text-palm",
    gold: "text-gold",
    midnight: "text-midnight",
  }[accent]
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className={`flex items-center gap-1.5 text-xs font-medium ${accentClass}`}>
        {icon} {label}
      </div>
      <div className="mt-1.5 text-2xl font-bold leading-tight">{value}</div>
    </div>
  )
}
