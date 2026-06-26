"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLang } from "@/lib/i18n/LanguageProvider"
import { Button } from "@/components/ui/button"
import { Languages, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/", key: "nav.home" },
  { href: "/survey", key: "nav.survey" },
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/opportunities", key: "nav.opportunities" },
  { href: "/admin", key: "nav.admin" },
] as const

export function SiteHeader() {
  const { lang, toggle, t } = useLang()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground text-lg shadow-sm">
            ✦
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold tracking-tight">{t("brand.name")}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {lang === "ar" ? "العين • القوع" : "Al Ain • Al Qua'a"}
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {t(item.key)}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggle}
            className="gap-1.5"
            aria-label="Toggle language"
          >
            <Languages className="h-4 w-4" />
            <span className="font-semibold tracking-wide">{lang === "ar" ? "EN" : "AR"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((s) => !s)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {NAV.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {t(item.key)}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
