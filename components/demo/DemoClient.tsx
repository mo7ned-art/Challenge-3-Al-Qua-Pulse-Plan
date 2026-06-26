"use client"

import Link from "next/link"
import { useLang } from "@/lib/i18n/LanguageProvider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, CheckCircle2, FileText, Lightbulb, MessageSquare, Sparkles } from "lucide-react"

const STEPS = ["demo.step1", "demo.step2", "demo.step3", "demo.step4", "demo.step5", "demo.step6"] as const

export function DemoClient() {
  const { t, lang } = useLang()
  const dir = lang === "ar" ? "rtl" : "ltr"
  const Arrow = lang === "ar" ? ArrowRight : ArrowRight

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6" dir={dir}>
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-gold" />
          <span>{t("brand.name")}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{t("demo.title")}</h1>
        <p className="text-muted-foreground text-sm md:text-base mt-1">{t("demo.subtitle")}</p>
      </div>

      <Card>
        <CardContent className="p-5">
          <ol className="space-y-3 list-decimal ps-5 text-sm leading-relaxed">
            {STEPS.map((s, i) => (
              <li key={s}>
                <Link
                  href={["/", "/survey", "/dashboard", "/opportunities", "/opportunities", "/evidence"][i]}
                  className="text-primary hover:underline font-medium"
                >
                  {t(s)}
                </Link>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        <Link href="/">
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 me-2" /> Landing
          </Button>
        </Link>
        <Link href="/survey">
          <Button variant="outline" className="w-full justify-start">
            <MessageSquare className="h-4 w-4 me-2" /> {t("nav.survey")}
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="w-full justify-start">
            <BarChart3 className="h-4 w-4 me-2" /> {t("nav.dashboard")}
          </Button>
        </Link>
        <Link href="/opportunities">
          <Button variant="outline" className="w-full justify-start">
            <Lightbulb className="h-4 w-4 me-2" /> {t("nav.opportunities")}
          </Button>
        </Link>
        <Link href="/evidence" className="sm:col-span-2">
          <Button variant="outline" className="w-full justify-start">
            <CheckCircle2 className="h-4 w-4 me-2" /> {t("nav.evidence")}
          </Button>
        </Link>
      </div>
    </div>
  )
}
