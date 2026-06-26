"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { DirectionProvider } from "@base-ui/react/direction-provider"
import type { Language } from "../types"
import { t as translate, format as formatT, type DictKey } from "./dict"

interface LangContextValue {
  lang: Language
  setLang: (l: Language) => void
  toggle: () => void
  t: (key: DictKey | string, vars?: Record<string, string | number>) => string
  dir: "ltr" | "rtl"
}

const LangContext = createContext<LangContextValue | null>(null)

const STORAGE_KEY = "aqp.lang"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en")

  // Hydrate: priority is URL ?lang > localStorage > en
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const qp = url.searchParams.get("lang")
      if (qp === "ar" || qp === "en") {
        setLangState(qp)
        window.localStorage.setItem(STORAGE_KEY, qp)
        return
      }
      const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null
      if (stored === "en" || stored === "ar") setLangState(stored)
    } catch {
      // ignore
    }
  }, [])

  // Reflect on <html> for direction + lang
  useEffect(() => {
    const html = document.documentElement
    html.lang = lang
    html.dir = lang === "ar" ? "rtl" : "ltr"
  }, [lang])

  const setLang = useCallback((l: Language) => {
    setLangState(l)
    try {
      window.localStorage.setItem(STORAGE_KEY, l)
    } catch {
      // ignore
    }
  }, [])

  const toggle = useCallback(() => {
    setLang(lang === "en" ? "ar" : "en")
  }, [lang, setLang])

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      toggle,
      t: (key, vars) => (vars ? formatT(translate(lang, key), vars) : translate(lang, key)),
      dir: lang === "ar" ? "rtl" : "ltr",
    }),
    [lang, setLang, toggle],
  )

  return (
    <LangContext.Provider value={value}>
      <DirectionProvider direction={lang === "ar" ? "rtl" : "ltr"}>
        {children}
      </DirectionProvider>
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) {
    // Safe default when used outside provider (e.g. server components)
    return {
      lang: "en",
      setLang: () => {},
      toggle: () => {},
      t: (key) => translate("en", key),
      dir: "ltr",
    }
  }
  return ctx
}
