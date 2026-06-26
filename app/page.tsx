import Link from "next/link"
import { ArrowRight, Sparkles, TrendingUp, Users, ShieldCheck, BarChart3, Lightbulb, CheckCircle2, MapPin } from "lucide-react"
import { listResponses } from "@/lib/store/responses"
import { computeOpportunities } from "@/lib/scoring/opportunities"
import { computeKpis, dataMode } from "@/lib/scoring/dashboard"
import { LandingClient } from "@/components/LandingClient"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const responses = await listResponses()
  const kpis = computeKpis(responses, "en")
  const opportunities = computeOpportunities(responses)
  const top = opportunities[0]
  const mode = dataMode(responses)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 pulse-stars opacity-60 pointer-events-none" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground mb-5">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Tatweer Hackathon · Challenge 3
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Al Qua'a <span className="text-primary">Pulse</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Turn local needs into business opportunities. A bilingual community demand
              intelligence platform for Al Qua'a, Al Ain.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/survey"
                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
              >
                Submit a Need <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted transition"
              >
                View Dashboard
              </Link>
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted transition"
              >
                Explore Opportunities
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-palm" /> Anonymous by default
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Built for rural UAE
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Al Qua'a · Al Ain
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<BarChart3 className="h-4 w-4" />}
                label="Total responses"
                value={String(kpis.totalResponses)}
                accent="primary"
              />
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Top category"
                value={kpis.topCategory ?? "—"}
                accent="palm"
              />
              <StatCard
                icon={<Lightbulb className="h-4 w-4" />}
                label="Top opportunity score"
                value={top ? `${top.opportunity_score}/100` : "—"}
                accent="gold"
              />
              <StatCard
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Provider gap"
                value={`${Math.round(kpis.providerGapRate * 100)}%`}
                accent="midnight"
              />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Data mode: <span className="font-semibold">{mode === "demo" ? "Demo data" : mode === "live" ? "Live data" : "Demo + live data"}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-4 py-14 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold tracking-tight">The problem</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Local entrepreneurs often start with skills — but no local data.
          </p>
        </div>
        <div className="md:col-span-2 space-y-3 text-foreground/80">
          <p>
            Entrepreneurs in Al Qua'a decide what to build based on intuition, family conversations,
            and scattered WhatsApp messages. Demand signals are invisible.
          </p>
          <p>
            <strong>Al Qua'a Pulse</strong> turns those signals into one trusted, visible picture —
            so the next farm supply business, AC technician, or tutoring circle can launch with
            evidence, not guesswork.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card/40 border-y border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold tracking-tight mb-8">How it works</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { n: 1, title: "Residents share needs", body: "Quick anonymous survey, in Arabic or English, on any phone." },
              { n: 2, title: "Demand is aggregated", body: "Grouped by category, area, urgency, and provider gap." },
              { n: 3, title: "Opportunities are ranked", body: "A transparent score reveals the strongest unmet local ideas." },
              { n: 4, title: "Entrepreneurs take action", body: "Each opportunity includes first steps, a 7-day plan, and risks." },
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
          <h2 className="text-2xl font-bold tracking-tight">Built for Al Qua'a</h2>
          <p className="mt-3 text-foreground/80">
            Rural, dispersed, and proud. The product is mobile-first, bilingual, and
            works on slow networks. Every category in the survey maps to a real
            part of daily life here — from camel feed to stargazing tours.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            {[
              "Mobile-first survey (≤ 60 seconds to complete).",
              "Arabic + English with full RTL support.",
              "Anonymous by default — no login, no tracking.",
              "Designed to scale to other rural communities.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-palm shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground">Example opportunity</h3>
          <p className="mt-2 text-xl font-bold leading-tight">
            {top?.title ?? "Camel Feed Delivery Route"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {top?.description ?? "A weekly delivery service that brings bulk camel feed to farms north and south of Al Qua'a."}
          </p>
          {top && (
            <div className="mt-4 flex items-center gap-3 text-xs">
              <span className="rounded-md bg-primary/10 text-primary px-2 py-1 font-semibold">
                Score {top.opportunity_score}/100
              </span>
              <span className="rounded-md bg-secondary text-secondary-foreground px-2 py-1 font-semibold capitalize">
                {top.confidence_level} confidence
              </span>
              <span className="rounded-md bg-muted px-2 py-1">
                {top.response_count} responses
              </span>
            </div>
          )}
          <Link
            href="/opportunities"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            See all opportunities <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Help your community start with evidence, not guesswork.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Submit a need, see the dashboard, or explore the top opportunities.
            The whole loop takes less than five minutes.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/survey"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
            >
              Submit a Need
            </Link>
            <Link
              href="/evidence"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-muted transition"
            >
              See Evidence
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
