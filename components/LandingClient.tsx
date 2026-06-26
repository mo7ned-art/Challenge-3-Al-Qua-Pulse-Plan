"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useLang } from "@/lib/i18n/LanguageProvider"

export function LandingClient() {
  const { lang, toggle, t } = useLang()
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bilingual by design</h2>
        <p className="mt-3 text-foreground/80 max-w-lg">
          Every page supports English and Arabic, including full right-to-left layout for
          Arabic readers. Your language preference is remembered.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition"
          >
            Try {lang === "ar" ? "English" : "العربية"} →
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Sample — EN</div>
          <div className="mt-1 font-semibold">Camel feed delivery</div>
          <div className="text-xs text-muted-foreground mt-0.5">Urgency 5 · Weekly</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4" dir="rtl">
          <div className="text-xs text-muted-foreground">عينة — AR</div>
          <div className="mt-1 font-semibold">توصيل أعلاف الإبل</div>
          <div className="text-xs text-muted-foreground mt-0.5">إلحاح ٥ · أسبوعيًا</div>
        </div>
      </div>
    </section>
  )
}
