"use client"

import { useEffect, useMemo, useState } from "react"
import { useLang } from "@/lib/i18n/LanguageProvider"
import { useResponses } from "@/lib/hooks/useData"
import { AREAS, CATEGORIES, FREQUENCIES, PROVIDER_ANSWERS, RESPONDENT_TYPES, WTP_RANGES, areaLabel, categoryIcon, categoryLabel, labelFor } from "@/lib/constants"
import type { SurveyResponse, SurveyInput } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, ShieldCheck, Trash2, Database, Plus, RefreshCw, Search, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const ADMIN_COOKIE = "admin_pin"
const ADMIN_HEADER = "x-admin-pin"

export function AdminClient() {
  const { lang, t } = useLang()
  const dir = lang === "ar" ? "rtl" : "ltr"
  const { responses, isLoading, reload } = useResponses()
  const [pin, setPin] = useState("")
  const [unlocked, setUnlocked] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")


  useEffect(() => {
    // Always probe — server decides if demo mode is on
    fetch("/api/admin/responses")
      .then(async (res) => {
        if (res.status === 200) {
          setUnlocked(true)
        } else {
          // Try via cookie
          const c = document.cookie.split("; ").find((x) => x.startsWith(`${ADMIN_COOKIE}=`))
          if (c) setUnlocked(true)
        }
      })
      .catch(() => {
        const c = document.cookie.split("; ").find((x) => x.startsWith(`${ADMIN_COOKIE}=`))
        if (c) setUnlocked(true)
      })
  }, [])

  async function tryUnlock() {
    setUnlocking(true)
    try {
      const res = await fetch("/api/admin/responses", {
        headers: { [ADMIN_HEADER]: pin },
      })
      if (res.status === 200) {
        if (pin) {
          document.cookie = `${ADMIN_COOKIE}=${encodeURIComponent(pin)}; path=/; max-age=3600`
        }
        setUnlocked(true)
        toast.success("Admin unlocked")
      } else {
        toast.error("Invalid PIN")
      }
    } catch (e) {
      toast.error("Network error")
    } finally {
      setUnlocking(false)
    }
  }



  async function handleDelete(id: string) {
    if (!confirm(t("admin.delete.confirm"))) return
    try {
      const res = await fetch(`/api/admin/responses?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Deleted")
        reload()
      } else {
        toast.error("Delete failed")
      }
    } catch (e) {
      toast.error("Network error")
    }
  }

  const filtered = useMemo(() => {
    return responses.filter((r) => {
      if (r.is_deleted) return false
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false
      if (search.trim()) {
        const s = search.toLowerCase()
        return (
          r.need_title.toLowerCase().includes(s) ||
          (r.need_description ?? "").toLowerCase().includes(s) ||
          r.category.toLowerCase().includes(s) ||
          r.area.toLowerCase().includes(s)
        )
      }
      return true
    })
  }, [responses, search, categoryFilter])

  const total = responses.length
  const lastUpdate = responses[0]?.created_at

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md px-4 py-14" dir={dir}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">{t("admin.pin.title")}</h1>
            </div>
            <p className="text-sm text-muted-foreground">{t("admin.subtitle")}</p>
            <div>
              <Label htmlFor="pin" className="mb-1.5 block text-sm">{t("admin.pin.placeholder")}</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
                placeholder="••••"
                autoFocus
              />
            </div>
            <Button className="w-full" onClick={tryUnlock} disabled={unlocking}>
              {unlocking ? t("generic.loading") : t("admin.pin.submit")}
            </Button>
            <div className="flex items-start gap-2 rounded-md bg-secondary/50 border border-border p-3 text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{t("admin.pin.warning")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6" dir={dir}>
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-palm" />
            <span>{t("brand.name")}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{t("admin.title")}</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">{t("admin.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={reload}>
          <RefreshCw className="h-4 w-4 me-1.5" /> Refresh
        </Button>
      </div>

      {/* Dataset status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" /> {t("admin.stats.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Stat label={t("admin.stats.total")} value={total} />
            <Stat label={t("admin.stats.lastUpdate")} value={lastUpdate ? new Date(lastUpdate).toLocaleString(lang === "ar" ? "ar" : "en") : "—"} small />
          </div>
        </CardContent>
      </Card>

      <ManualAdd lang={lang} t={t} onCreated={reload} />

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("admin.table.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2 mb-3">
            <div className="relative">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin.table.search")}
                className="ps-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {lang === "ar" ? c.ar : c.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">{t("generic.loading")}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">{t("admin.table.empty")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-start text-xs text-muted-foreground border-b border-border">
                    <th className="py-2 pe-2 text-start">Need</th>
                    <th className="py-2 px-2 text-start">Cat</th>
                    <th className="py-2 px-2 text-start">Area</th>
                    <th className="py-2 px-2 text-start">Urg</th>
                    <th className="py-2 px-2 text-start">Freq</th>
                    <th className="py-2 ps-2 text-start"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 50).map((r) => (
                    <tr key={r.id} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pe-2">
                        <div className="font-medium line-clamp-1">{r.need_title}</div>
                        {r.need_description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{r.need_description}</div>
                        )}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <span className="me-1">{categoryIcon(r.category)}</span>
                        <span className="text-xs">{categoryLabel(r.category, lang)}</span>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap text-xs">{areaLabel(r.area, lang)}</td>
                      <td className="py-2 px-2">
                        <Badge variant={r.urgency >= 4 ? "destructive" : r.urgency >= 3 ? "default" : "secondary"}>{r.urgency}</Badge>
                      </td>
                      <td className="py-2 px-2 text-xs">{labelFor(r.frequency, lang)}</td>

                      <td className="py-2 ps-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} aria-label="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 50 && (
                <div className="text-xs text-muted-foreground mt-3">+ {filtered.length - 50} more</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value, small }: { label: string; value: number | string; small?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("font-bold mt-0.5", small ? "text-sm" : "text-2xl")}>{value}</div>
    </div>
  )
}

function ManualAdd({
  lang,
  t,
  onCreated,
}: {
  lang: "en" | "ar"
  t: (k: string) => string
  onCreated: () => void
}) {
  const [form, setForm] = useState({
    respondent_type: "resident",
    area: "al_quaa_center",
    category: "repairs",
    need_title: "",
    need_description: "",
    urgency: 3,
    frequency: "weekly",
    has_local_provider: "not_sure" as "yes" | "no" | "not_sure",
    willingness_to_pay_range: "not_sure",
    contact_permission: false,
  })
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!form.need_title.trim()) return
    setSubmitting(true)
    try {
      const payload: SurveyInput = {
        ...form,
        language: lang,
        source_type: "live",
        contact_permission: false,
        is_private: true,
      }
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success("Added")
        setForm({ ...form, need_title: "", need_description: "" })
        onCreated()
      } else {
        toast.error("Failed")
      }
    } catch (e) {
      toast.error("Network error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("admin.add.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs mb-1 block">Type</Label>
            <Select value={form.respondent_type} onValueChange={(v) => v && setForm({ ...form, respondent_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RESPONDENT_TYPES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{lang === "ar" ? o.ar : o.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Area</Label>
            <Select value={form.area} onValueChange={(v) => v && setForm({ ...form, area: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AREAS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{lang === "ar" ? o.ar : o.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="text-xs mb-1 block">Category</Label>
            <Select value={form.category} onValueChange={(v) => v && setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{lang === "ar" ? o.ar : o.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Need title</Label>
          <Input value={form.need_title} onChange={(e) => setForm({ ...form, need_title: e.target.value })} placeholder="e.g. AC repair" />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Description</Label>
          <Textarea rows={2} value={form.need_description} onChange={(e) => setForm({ ...form, need_description: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs mb-1 block">Urgency</Label>
            <Select value={String(form.urgency)} onValueChange={(v) => v && setForm({ ...form, urgency: Number(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Frequency</Label>
            <Select value={form.frequency} onValueChange={(v) => v && setForm({ ...form, frequency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{lang === "ar" ? o.ar : o.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Provider</Label>
            <Select value={form.has_local_provider} onValueChange={(v) => v && setForm({ ...form, has_local_provider: v as "yes" | "no" | "not_sure" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROVIDER_ANSWERS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{lang === "ar" ? o.ar : o.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={submit} disabled={submitting || !form.need_title.trim()}>
          {submitting ? t("generic.loading") : t("admin.add.submit")}
        </Button>
      </CardContent>
    </Card>
  )
}
