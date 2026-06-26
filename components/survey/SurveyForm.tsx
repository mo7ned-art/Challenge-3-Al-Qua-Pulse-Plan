"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AREAS,
  CATEGORIES,
  FREQUENCIES,
  PROVIDER_ANSWERS,
  RESPONDENT_TYPES,
  WTP_RANGES,
  labelFor,
  categoryIcon,
} from "@/lib/constants"
import { useLang } from "@/lib/i18n/LanguageProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { ArrowRight, ArrowLeft, Send, ShieldCheck, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = 0 | 1 | 2 | 3 | 4 | 5

const STEP_KEYS: Array<keyof ReturnType<typeof useLang>["t"] extends (k: string) => string ? never : string> = []

const STEPS_EN = [
  { key: "survey.section.respondent", title: "About you" },
  { key: "survey.section.need", title: "What do you need?" },
  { key: "survey.section.timing", title: "How urgent?" },
  { key: "survey.section.provider", title: "Local provider?" },
  { key: "survey.section.payment", title: "Willingness to pay" },
  { key: "survey.section.contact", title: "Contact (optional)" },
]

const STEPS_AR = [
  { key: "survey.section.respondent", title: "عنك" },
  { key: "survey.section.need", title: "ما الذي تحتاجه؟" },
  { key: "survey.section.timing", title: "الإلحاح" },
  { key: "survey.section.provider", title: "مزوّد محلي؟" },
  { key: "survey.section.payment", title: "الاستعداد للدفع" },
  { key: "survey.section.contact", title: "التواصل (اختياري)" },
]

interface FormState {
  respondent_type: string
  area: string
  category: string
  need_title: string
  need_description: string
  urgency: number
  frequency: string
  has_local_provider: "yes" | "no" | "not_sure"
  willingness_to_pay_range: string
  contact_permission: boolean
  contact_name: string
  contact_phone: string
  contact_email: string
  extra_note: string
}

const initial: FormState = {
  respondent_type: "",
  area: "",
  category: "",
  need_title: "",
  need_description: "",
  urgency: 3,
  frequency: "",
  has_local_provider: "not_sure",
  willingness_to_pay_range: "not_sure",
  contact_permission: false,
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  extra_note: "",
}

export function SurveyForm() {
  const { lang, t } = useLang()
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)
  const [form, setForm] = useState<FormState>(initial)
  const [submitting, setSubmitting] = useState(false)
  const steps = lang === "ar" ? STEPS_AR : STEPS_EN
  const dir = lang === "ar" ? "rtl" : "ltr"
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight

  // Initialise language field once
  useEffect(() => {
    // No-op — language is sent at submit time from the lang context
  }, [])

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const canAdvance = useMemo(() => {
    if (step === 0) return Boolean(form.respondent_type && form.area)
    if (step === 1) return Boolean(form.category && form.need_title.trim().length >= 2)
    if (step === 2) return Boolean(form.frequency)
    if (step === 3) return Boolean(form.has_local_provider)
    if (step === 4) return Boolean(form.willingness_to_pay_range)
    if (step === 5) {
      if (!form.contact_permission) return true
      if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) return false
      return Boolean(form.contact_name || form.contact_phone || form.contact_email)
    }
    return true
  }, [step, form])

  async function handleSubmit() {
    if (!canAdvance) return
    setSubmitting(true)
    try {
      const payload = {
        language: lang,
        respondent_type: form.respondent_type,
        area: form.area,
        category: form.category,
        need_title: form.need_title.trim(),
        need_description: form.need_description.trim() || undefined,
        urgency: form.urgency,
        frequency: form.frequency,
        has_local_provider: form.has_local_provider,
        willingness_to_pay_range: form.willingness_to_pay_range,
        contact_permission: form.contact_permission,
        contact_name: form.contact_permission ? form.contact_name.trim() || undefined : undefined,
        contact_phone: form.contact_permission ? form.contact_phone.trim() || undefined : undefined,
        contact_email: form.contact_permission ? form.contact_email.trim() || undefined : undefined,
        extra_note: form.extra_note.trim() || undefined,
      }
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "submit_failed")
      }
      toast.success(t("survey.success"))
      router.push("/survey/thanks")
    } catch (e) {
      console.error(e)
      toast.error(t("generic.error"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10" dir={dir}>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-gold" />
        <span>{t("brand.name")}</span>
        <span className="opacity-50">·</span>
        <span>{t("survey.title")}</span>
      </div>

      {/* Progress */}
      <ol className="mb-6 flex flex-wrap items-center gap-2 text-xs">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => i <= step && setStep(i as Step)}
              className={cn(
                "h-7 w-7 rounded-full grid place-items-center font-semibold transition border",
                i < step
                  ? "bg-primary text-primary-foreground border-primary"
                  : i === step
                    ? "bg-card text-foreground border-primary"
                    : "bg-card text-muted-foreground border-border",
              )}
              aria-label={`Step ${i + 1}: ${s.title}`}
            >
              {i + 1}
            </button>
            <span className={cn(i === step ? "text-foreground font-medium" : "text-muted-foreground")}>
              {s.title}
            </span>
            {i < steps.length - 1 && <span className="mx-1 opacity-30">›</span>}
          </li>
        ))}
      </ol>

      <Card>
        <CardContent className="p-6 md:p-8 space-y-6">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{t("survey.section.respondent")}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t("survey.privacy")}</p>
              </div>
              <div>
                <Label className="mb-2 block">{t("survey.field.respondentType")}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {RESPONDENT_TYPES.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => update("respondent_type", o.value)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-sm font-medium text-start transition",
                        form.respondent_type === o.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:bg-muted",
                      )}
                    >
                      {lang === "ar" ? o.ar : o.en}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">{t("survey.field.area")}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {AREAS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => update("area", o.value)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-sm font-medium text-start transition",
                        form.area === o.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:bg-muted",
                      )}
                    >
                      {lang === "ar" ? o.ar : o.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{t("survey.section.need")}</h2>
              </div>
              <div>
                <Label className="mb-2 block">{t("survey.field.category")}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {CATEGORIES.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => update("category", o.value)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-sm font-medium text-start transition flex items-start gap-2",
                        form.category === o.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:bg-muted",
                      )}
                    >
                      <span className="text-lg leading-none">{o.icon}</span>
                      <span className="flex-1">{lang === "ar" ? o.ar : o.en}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="need_title" className="mb-2 block">
                  {t("survey.field.needTitle")}
                </Label>
                <Input
                  id="need_title"
                  value={form.need_title}
                  onChange={(e) => update("need_title", e.target.value)}
                  placeholder={t("survey.field.needTitle.placeholder")}
                  maxLength={200}
                />
              </div>
              <div>
                <Label htmlFor="need_description" className="mb-2 block">
                  {t("survey.field.needDescription")}
                </Label>
                <Textarea
                  id="need_description"
                  rows={3}
                  value={form.need_description}
                  onChange={(e) => update("need_description", e.target.value)}
                  placeholder={t("survey.field.needDescription.placeholder")}
                  maxLength={2000}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{t("survey.section.timing")}</h2>
              </div>
              <div>
                <Label className="mb-3 block">
                  {t("survey.field.urgency")}: <span className="font-bold text-primary">{form.urgency}</span>/5
                </Label>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[form.urgency]}
                  onValueChange={(v) => update("urgency", (Array.isArray(v) ? v[0] : v) ?? 3)}
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">{t("survey.field.frequency")}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {FREQUENCIES.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => update("frequency", o.value)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-sm font-medium text-start transition",
                        form.frequency === o.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:bg-muted",
                      )}
                    >
                      {lang === "ar" ? o.ar : o.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{t("survey.section.provider")}</h2>
              </div>
              <RadioGroup
                value={form.has_local_provider}
                onValueChange={(v) => update("has_local_provider", v as FormState["has_local_provider"])}
                className="space-y-2"
              >
                {PROVIDER_ANSWERS.map((o) => (
                  <label
                    key={o.value}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition",
                      form.has_local_provider === o.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <RadioGroupItem value={o.value} id={`provider-${o.value}`} />
                    <span className="text-sm font-medium">{lang === "ar" ? o.ar : o.en}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{t("survey.section.payment")}</h2>
              </div>
              <RadioGroup
                value={form.willingness_to_pay_range}
                onValueChange={(v) => update("willingness_to_pay_range", v)}
                className="space-y-2"
              >
                {WTP_RANGES.map((o) => (
                  <label
                    key={o.value}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition",
                      form.willingness_to_pay_range === o.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <RadioGroupItem value={o.value} id={`wtp-${o.value}`} />
                    <span className="text-sm font-medium">{lang === "ar" ? o.ar : o.en}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{t("survey.section.contact")}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t("survey.privacy")}</p>
              </div>
              <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer">
                <Checkbox
                  checked={form.contact_permission}
                  onCheckedChange={(v) => update("contact_permission", v === true)}
                  id="contact_permission"
                />
                <span className="text-sm font-medium leading-snug">
                  {t("survey.field.contactPermission")}
                </span>
              </label>
              {form.contact_permission && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_name" className="mb-1.5 block">
                      {t("survey.field.contactName")}
                    </Label>
                    <Input
                      id="contact_name"
                      value={form.contact_name}
                      onChange={(e) => update("contact_name", e.target.value)}
                      maxLength={120}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone" className="mb-1.5 block">
                      {t("survey.field.contactPhone")}
                    </Label>
                    <Input
                      id="contact_phone"
                      value={form.contact_phone}
                      onChange={(e) => update("contact_phone", e.target.value)}
                      maxLength={60}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="contact_email" className="mb-1.5 block">
                      {t("survey.field.contactEmail")}
                    </Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => update("contact_email", e.target.value)}
                      maxLength={200}
                    />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="extra_note" className="mb-1.5 block">
                  {t("survey.field.extraNote")}
                </Label>
                <Textarea
                  id="extra_note"
                  rows={2}
                  value={form.extra_note}
                  onChange={(e) => update("extra_note", e.target.value)}
                  maxLength={2000}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
              disabled={step === 0}
            >
              {lang === "ar" ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              <span className="ms-2">{t("generic.back")}</span>
            </Button>
            {step < 5 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => Math.min(5, s + 1) as Step)}
                disabled={!canAdvance}
              >
                {t("generic.next")}
                <Arrow className="h-4 w-4 ms-2" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={!canAdvance || submitting}>
                <Send className="h-4 w-4 me-2" />
                {submitting ? t("survey.submitting") : t("survey.submit")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
        <ShieldCheck className="h-3.5 w-3.5 text-palm" />
        {t("survey.privacy")}
      </p>
    </div>
  )
}
