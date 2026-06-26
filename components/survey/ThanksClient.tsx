"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLang } from "@/lib/i18n/LanguageProvider"
import { ArrowRight, CheckCircle2, Share2, BarChart3, Lightbulb } from "lucide-react"

export function ThanksClient() {
  const { t, lang } = useLang()
  const dir = lang === "ar" ? "rtl" : "ltr"
  const surveyUrl = typeof window !== "undefined" ? window.location.origin + "/survey" : "/survey"

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(surveyUrl)
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14" dir={dir}>
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-gold/20 p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight">
            {t("survey.thanks.title")}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            {t("survey.thanks.body")}
          </p>
        </div>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Share2 className="h-4 w-4 text-palm" /> {t("survey.thanks.share")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("survey.thanks.scan")}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-24 w-24 place-items-center rounded-lg border border-dashed border-border bg-muted text-xs text-muted-foreground text-center p-2">
                QR placeholder
              </div>
              <div className="flex-1 min-w-0">
                <code className="block text-xs bg-muted rounded-md p-2 truncate" dir="ltr">
                  {surveyUrl}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={copyLink}
                >
                  Copy link
                </Button>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <Link href="/survey" className="block">
              <Button variant="default" className="w-full">
                {t("survey.thanks.again")}
              </Button>
            </Link>
            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full">
                <BarChart3 className="h-4 w-4 me-2" />
                {t("survey.thanks.dashboard")}
              </Button>
            </Link>
            <Link href="/opportunities" className="block">
              <Button variant="outline" className="w-full">
                <Lightbulb className="h-4 w-4 me-2" />
                {t("survey.thanks.opportunities")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
