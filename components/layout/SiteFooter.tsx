"use client"

import Link from "next/link"
import { useLang } from "@/lib/i18n/LanguageProvider"

export function SiteFooter() {
  const { t, lang } = useLang()
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              ✦
            </span>
            <span className="font-semibold">{t("brand.name")}</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">{t("landing.footer")}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-3">{lang === "ar" ? "روابط سريعة" : "Quick links"}</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-muted-foreground hover:text-foreground" href="/survey">{t("nav.survey")}</Link></li>
            <li><Link className="text-muted-foreground hover:text-foreground" href="/dashboard">{t("nav.dashboard")}</Link></li>
            <li><Link className="text-muted-foreground hover:text-foreground" href="/opportunities">{t("nav.opportunities")}</Link></li>
            <li><Link className="text-muted-foreground hover:text-foreground" href="/evidence">{t("nav.evidence")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-3">{lang === "ar" ? "للفريق" : "For the team"}</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-muted-foreground hover:text-foreground" href="/admin">{t("nav.admin")}</Link></li>
            <li><Link className="text-muted-foreground hover:text-foreground" href="/demo">{t("nav.demo")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} {t("brand.name")}. {lang === "ar" ? "لهكاثون التطوير" : "Tatweer Hackathon"}</span>
          <span>{lang === "ar" ? "مجهول افتراضيًا. لا تظهر بيانات التواصل علنًا." : "Anonymous by default. No contact data shown publicly."}</span>
        </div>
      </div>
    </footer>
  )
}
