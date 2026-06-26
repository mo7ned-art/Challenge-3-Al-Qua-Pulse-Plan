// Tiny client-side data hook (no SWR dependency).
// Reloads on demand via `reload()`. Pages can also pre-load via the server.

import { useCallback, useEffect, useState } from "react"
import type { Opportunity, SurveyResponse } from "@/lib/types"

interface UseDataResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
}

async function jsonFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as T
}

export function useResponses(): UseDataResult<SurveyResponse[]> & { responses: SurveyResponse[] } {
  const [data, setData] = useState<SurveyResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const json = await jsonFetch<{ responses: SurveyResponse[] }>("/api/responses")
      setData(json.responses)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, responses: data, isLoading, error, reload }
}

export function useOpportunities(): UseDataResult<Opportunity[]> & { opportunities: Opportunity[] } {
  const [data, setData] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const json = await jsonFetch<{ opportunities: Opportunity[] }>("/api/opportunities")
      setData(json.opportunities)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, opportunities: data, isLoading, error, reload }
}
