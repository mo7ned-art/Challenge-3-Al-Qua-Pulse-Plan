"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useLang } from "@/lib/i18n/LanguageProvider"
import { useResponses } from "@/lib/hooks/useData"
import { applyFilters, computeCharts, computeKpis, generateInsight, type DashboardFilters } from "@/lib/scoring/dashboard"
import { AREAS, CATEGORIES, FREQUENCIES, PROVIDER_ANSWERS, RESPONDENT_TYPES, areaLabel, categoryIcon, categoryLabel, labelFor } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AlertTriangle, BarChart3, Lightbulb, MapPin, RefreshCw, Sparkles, TrendingUp, Users } from "lucide-react"

export function DashboardClient() {
  const { lang, t } = useLang()
  const dir = lang === "ar" ? "rtl" : "ltr"
  const { responses, isLoading, reload } = useResponses()

  const [filters, setFilters] = useState<DashboardFilters>({
    category: "all",
    area: "all",
    respondentType: "all",
    frequency: "all",
    provider: "all",
    timeRange: "all",
  })

  const filtered = useMemo(() => applyFilters(responses, filters), [responses, filters])
  const kpis = useMemo(() => computeKpis(filtered, lang), [filtered, lang])
  const charts = useMemo(() => computeCharts(filtered, lang), [filtered, lang])
  const insight = useMemo(() => generateInsight(filtered, lang), [filtered, lang])


  const chartColors = ["oklch(0.45 0.12 280)", "oklch(0.55 0.13 150)", "oklch(0.78 0.14 85)", "oklch(0.6 0.14 30)", "oklch(0.55 0.1 250)", "oklch(0.5 0.08 280)", "oklch(0.7 0.15 85)"]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" dir={dir}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>{t("brand.name")}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{t("dash.title")}</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">{t("dash.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={reload}>
            <RefreshCw className="h-4 w-4 me-1.5" />
            <span>{t("dash.refresh")}</span>
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <Kpi icon={<BarChart3 className="h-4 w-4" />} label={t("dash.kpi.total")} value={kpis.totalResponses.toString()} />
        <Kpi icon={<Sparkles className="h-4 w-4" />} label={t("dash.kpi.unique")} value={kpis.uniqueNeeds.toString()} />
        <Kpi icon={<Lightbulb className="h-4 w-4" />} label={t("dash.kpi.topCategory")} value={kpis.topCategory ?? "—"} />
        <Kpi icon={<TrendingUp className="h-4 w-4" />} label={t("dash.kpi.avgUrgency")} value={`${kpis.avgUrgency}/5`} />
        <Kpi icon={<AlertTriangle className="h-4 w-4" />} label={t("dash.kpi.providerGap")} value={`${Math.round(kpis.providerGapRate * 100)}%`} />
        <Kpi icon={<MapPin className="h-4 w-4" />} label={t("dash.kpi.topArea")} value={kpis.topArea ? areaLabel(kpis.topArea, lang) : "—"} />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <FilterSelect
              label={t("dash.filter.category")}
              value={filters.category ?? "all"}
              onChange={(v) => setFilters((f) => ({ ...f, category: v }))}
              options={[{ value: "all", en: "All", ar: "الكل" }, ...CATEGORIES.map((c) => ({ value: c.value, en: c.en, ar: c.ar }))]}
              lang={lang}
            />
            <FilterSelect
              label={t("dash.filter.area")}
              value={filters.area ?? "all"}
              onChange={(v) => setFilters((f) => ({ ...f, area: v }))}
              options={[{ value: "all", en: "All", ar: "الكل" }, ...AREAS.map((a) => ({ value: a.value, en: a.en, ar: a.ar }))]}
              lang={lang}
            />
            <FilterSelect
              label={t("dash.filter.respondent")}
              value={filters.respondentType ?? "all"}
              onChange={(v) => setFilters((f) => ({ ...f, respondentType: v }))}
              options={[{ value: "all", en: "All", ar: "الكل" }, ...RESPONDENT_TYPES.map((r) => ({ value: r.value, en: r.en, ar: r.ar }))]}
              lang={lang}
            />
            <FilterSelect
              label={t("dash.filter.frequency")}
              value={filters.frequency ?? "all"}
              onChange={(v) => setFilters((f) => ({ ...f, frequency: v }))}
              options={[{ value: "all", en: "All", ar: "الكل" }, ...FREQUENCIES.map((f) => ({ value: f.value, en: f.en, ar: f.ar }))]}
              lang={lang}
            />
            <FilterSelect
              label={t("dash.filter.provider")}
              value={filters.provider ?? "all"}
              onChange={(v) => setFilters((f) => ({ ...f, provider: v as DashboardFilters["provider"] }))}
              options={[
                { value: "all", en: "All", ar: "الكل" },
                { value: "yes", en: t("dash.filter.provider.yes"), ar: "يوجد مزوّد" },
                { value: "no", en: t("dash.filter.provider.no"), ar: "لا يوجد" },
                { value: "not_sure", en: t("dash.filter.provider.not_sure"), ar: "غير متأكد" },
              ]}
              lang={lang}
            />
            <FilterSelect
              label={t("dash.filter.time")}
              value={filters.timeRange ?? "all"}
              onChange={(v) => setFilters((f) => ({ ...f, timeRange: v as DashboardFilters["timeRange"] }))}
              options={[
                { value: "all", en: t("dash.filter.all"), ar: t("dash.filter.all") },
                { value: "today", en: t("dash.filter.today"), ar: t("dash.filter.today") },
                { value: "7d", en: t("dash.filter.7d"), ar: t("dash.filter.7d") },
                { value: "30d", en: t("dash.filter.30d"), ar: t("dash.filter.30d") },
              ]}
              lang={lang}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading && filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">{t("generic.loading")}</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            {t("dash.empty")}
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/survey">
                <Button>{t("nav.survey")}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Insight */}
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4 md:p-5 flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{t("dash.insight.title")}</h3>
                <p className="text-sm text-foreground/80 mt-1">{insight}</p>
              </div>
            </CardContent>
          </Card>

          {/* Charts grid */}
          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("dash.chart.demandByCategory")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.demandByCategory} margin={{ top: 8, right: 16, bottom: 60, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 80 / 0.6)" />
                      <XAxis
                        dataKey="category"
                        interval={0}
                        height={70}
                        tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => {
                          const label = payload.value.length > 18 ? payload.value.slice(0, 16) + "…" : payload.value
                          return (
                            <g transform={`translate(${x},${y})`}>
                              <text
                                x={0}
                                y={0}
                                dy={10}
                                textAnchor="end"
                                fill="currentColor"
                                fontSize={10}
                                transform="rotate(-40)"
                              >
                                {label}
                              </text>
                            </g>
                          )
                        }}
                      />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {charts.demandByCategory.map((_, i) => (
                          <Cell key={i} fill={chartColors[i % chartColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("dash.chart.providerGap")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.providerGap}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {charts.providerGap.map((d, i) => (
                          <Cell key={i} fill={["oklch(0.55 0.13 150)", "oklch(0.6 0.18 25)", "oklch(0.7 0.1 80)"][i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  {charts.providerGap.map((d, i) => (
                    <div key={d.key} className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ background: ["oklch(0.55 0.13 150)", "oklch(0.6 0.18 25)", "oklch(0.7 0.1 80)"][i] }}
                      />
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="ms-auto font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("dash.chart.urgencyByCategory")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[28rem]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.urgencyByCategory} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 80 / 0.6)" />
                      <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="category"
                        width={160}
                        interval={0}
                        tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => {
                          const label = payload.value.length > 22 ? payload.value.slice(0, 20) + "…" : payload.value
                          return (
                            <text x={x} y={y} dy={4} textAnchor="end" fill="currentColor" fontSize={10}>
                              {label}
                            </text>
                          )
                        }}
                      />
                      <Tooltip />
                      <Bar dataKey="avgUrgency" fill="oklch(0.55 0.13 150)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("dash.chart.frequency")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.frequencyMix.map((f) => ({ ...f, label: labelFor(f.frequency, lang) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 80 / 0.6)" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="oklch(0.78 0.14 85)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Area activity */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {t("dash.area.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {charts.areaActivity.slice(0, 6).map((a) => (
                  <div key={a.area} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-sm">{areaLabel(a.area, lang)}</div>
                      <Badge variant="secondary">{a.count}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                      {a.topNeed ?? "—"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t("dash.kpi.avgUrgency")}: <span className="font-semibold text-foreground">{a.avgUrgency}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent submissions table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("dash.recent.title")}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-start text-xs text-muted-foreground border-b border-border">
                    <th className="py-2 pe-2 text-start font-medium">{t("dash.table.need")}</th>
                    <th className="py-2 px-2 text-start font-medium">{t("dash.filter.category")}</th>
                    <th className="py-2 px-2 text-start font-medium">{t("dash.filter.area")}</th>
                    <th className="py-2 px-2 text-start font-medium">{t("dash.filter.provider")}</th>
                    <th className="py-2 px-2 text-start font-medium">{t("dash.table.urgency")}</th>
                    <th className="py-2 ps-2 text-start font-medium">{t("dash.table.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 20).map((r) => (
                    <tr key={r.id} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pe-2">
                        <div className="font-medium">{r.need_title}</div>
                        {r.need_description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{r.need_description}</div>
                        )}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <span className="text-base me-1">{categoryIcon(r.category)}</span>
                        {categoryLabel(r.category, lang)}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">{areaLabel(r.area, lang)}</td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <Badge
                          variant={r.has_local_provider === "no" ? "destructive" : r.has_local_provider === "yes" ? "default" : "secondary"}
                        >
                          {labelFor(r.has_local_provider, lang)}
                        </Badge>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{r.urgency}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`h-1.5 w-1.5 rounded-full ${i < r.urgency ? "bg-gold" : "bg-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 ps-2 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString(lang === "ar" ? "ar" : "en")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 20 && (
                <div className="text-xs text-muted-foreground mt-3">
                  {lang === "ar" ? `+ ${filtered.length - 20} أخرى` : `+ ${filtered.length - 20} more`}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon} {label}</div>
      <div className="mt-1.5 text-2xl font-bold leading-tight">{value}</div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  lang,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; en: string; ar: string }[]
  lang: "en" | "ar"
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1.5">{label}</div>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {lang === "ar" ? o.ar : o.en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
