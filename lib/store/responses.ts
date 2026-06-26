// In-memory store with optional Supabase persistence.
// All public APIs are async so the same code path works in both modes.

import { SEED_RESPONSES } from "../seed/seedData"
import type { SurveyInput, SurveyResponse } from "../types"

const isSupabaseConfigured = (): boolean => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

const memoryStore: { responses: SurveyResponse[]; seeded: boolean } = {
  responses: [],
  seeded: false,
}

function ensureSeeded() {
  if (!memoryStore.seeded) {
    memoryStore.responses = [...SEED_RESPONSES]
    memoryStore.seeded = true
  }
}

function genId(): string {
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Strip private contact fields before sending to public clients. */
export function publicView(r: SurveyResponse): SurveyResponse {
  if (!r.contact_permission) {
    return { ...r, contact_name: null, contact_phone: null, contact_email: null }
  }
  return r
}

export async function listResponses(): Promise<SurveyResponse[]> {
  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("../supabase/admin")
      const sb = createAdminClient()
      const { data, error } = await sb
        .from("survey_responses")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
      if (!error && data) {
        return data as SurveyResponse[]
      }
      // Fall through to in-memory on error
      console.error("[responses] supabase error, using in-memory:", error?.message)
    } catch (e) {
      console.error("[responses] supabase unreachable, using in-memory:", e)
    }
  }
  ensureSeeded()
  return [...memoryStore.responses].filter((r) => !r.is_deleted).sort(
    (a, b) => b.created_at.localeCompare(a.created_at),
  )
}

export async function getResponse(id: string): Promise<SurveyResponse | null> {
  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("../supabase/admin")
      const sb = createAdminClient()
      const { data } = await sb.from("survey_responses").select("*").eq("id", id).single()
      if (data) return data as SurveyResponse
    } catch (e) {
      console.error("[responses] supabase get failed:", e)
    }
  }
  ensureSeeded()
  return memoryStore.responses.find((r) => r.id === id) ?? null
}

export async function createResponse(input: SurveyInput): Promise<SurveyResponse> {
  const now = new Date().toISOString()
  const row: SurveyResponse = {
    id: genId(),
    created_at: now,
    updated_at: now,
    source_type: input.source_type ?? "live",
    language: input.language,
    respondent_type: input.respondent_type,
    area: input.area,
    category: input.category,
    need_title: input.need_title.trim(),
    need_description: input.need_description?.trim() || null,
    urgency: Math.max(1, Math.min(5, Math.round(input.urgency))),
    frequency: input.frequency,
    has_local_provider: input.has_local_provider,
    willingness_to_pay_range: input.willingness_to_pay_range ?? null,
    contact_permission: input.contact_permission,
    contact_name: input.contact_name?.trim() || null,
    contact_phone: input.contact_phone?.trim() || null,
    contact_email: input.contact_email?.trim() || null,
    extra_note: input.extra_note?.trim() || null,
    is_private: input.is_private ?? !input.contact_permission,
    is_deleted: false,
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("../supabase/admin")
      const sb = createAdminClient()
      const { data, error } = await sb
        .from("survey_responses")
        .insert(row)
        .select()
        .single()
      if (!error && data) {
        return data as SurveyResponse
      }
      console.error("[responses] supabase insert failed, using in-memory:", error?.message)
    } catch (e) {
      console.error("[responses] supabase insert exception:", e)
    }
  }
  ensureSeeded()
  memoryStore.responses.unshift(row)
  return row
}

export async function softDeleteResponse(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("../supabase/admin")
      const sb = createAdminClient()
      const { error } = await sb
        .from("survey_responses")
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq("id", id)
      if (!error) return true
    } catch (e) {
      console.error("[responses] supabase delete failed:", e)
    }
  }
  ensureSeeded()
  const idx = memoryStore.responses.findIndex((r) => r.id === id)
  if (idx >= 0) {
    memoryStore.responses[idx].is_deleted = true
    return true
  }
  return false
}

export async function seedDemoData(): Promise<{ count: number; already: boolean }> {
  ensureSeeded()
  const existingDemo = memoryStore.responses.filter((r) => r.source_type === "demo").length
  if (existingDemo > 0) {
    return { count: existingDemo, already: true }
  }
  memoryStore.responses = [...SEED_RESPONSES, ...memoryStore.responses]
  return { count: SEED_RESPONSES.length, already: false }
}

export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true
  return !isSupabaseConfigured()
}
