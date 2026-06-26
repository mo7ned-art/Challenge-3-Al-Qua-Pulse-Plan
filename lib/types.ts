// Core domain types for Al Qua'a Pulse.
// All entities are designed to work with Supabase persistence OR an in-memory
// fallback when Supabase env vars are missing.

export type SourceType = "demo" | "live" | "imported"
export type Language = "en" | "ar"
export type ProviderAnswer = "yes" | "no" | "not_sure"

export type RespondentTypeValue =
  | "resident"
  | "farmer"
  | "student"
  | "entrepreneur"
  | "visitor"
  | "other"

export type AreaValue =
  | "al_quaa_center"
  | "farms_north"
  | "farms_south"
  | "roadside"
  | "near_school"
  | "prefer_not_say"
  | "other"

export type CategoryValue =
  | "farm_camel"
  | "repairs"
  | "food_groceries"
  | "transport_delivery"
  | "education_tutoring"
  | "health_wellness"
  | "tourism_stargazing"
  | "events_community"
  | "government_paperwork"
  | "other"

export type FrequencyValue =
  | "daily"
  | "weekly"
  | "monthly"
  | "seasonal"
  | "one_time"
  | "not_sure"

export type WillingnessToPayValue =
  | "0"
  | "under_25"
  | "25_50"
  | "50_100"
  | "100_250"
  | "250_plus"
  | "not_sure"

export type Confidence = "low" | "medium" | "high"

export interface SurveyResponse {
  id: string
  created_at: string
  updated_at: string
  source_type: SourceType
  language: Language
  respondent_type: RespondentTypeValue | string
  area: AreaValue | string
  category: CategoryValue | string
  need_title: string
  need_description: string | null
  urgency: number // 1-5
  frequency: FrequencyValue | string
  has_local_provider: ProviderAnswer
  willingness_to_pay_range: WillingnessToPayValue | string | null
  contact_permission: boolean
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  extra_note: string | null
  is_private: boolean
  is_deleted: boolean
}

export interface SurveyInput {
  source_type?: SourceType
  language: Language
  respondent_type: RespondentTypeValue | string
  area: AreaValue | string
  category: CategoryValue | string
  need_title: string
  need_description?: string
  urgency: number
  frequency: FrequencyValue | string
  has_local_provider: ProviderAnswer
  willingness_to_pay_range?: WillingnessToPayValue | string
  contact_permission: boolean
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  extra_note?: string
  is_private?: boolean
}

export interface ValidationNote {
  id: string
  created_at: string
  claim: string
  evidence_type: "usability_test" | "interview" | "screenshot" | "metric" | "demo"
  description: string | null
  result: string | null
  link: string | null
  is_public: boolean
}

export interface Opportunity {
  id: string
  title: string
  title_ar: string
  slug: string
  category: string
  description: string
  description_ar: string
  matching_response_ids: string[]
  response_count: number
  average_urgency: number
  provider_gap_rate: number
  recurring_rate: number
  pay_signal_rate: number
  opportunity_score: number
  confidence_level: Confidence
  top_area: string | null
  target_customer: string
  target_customer_ar: string
  suggested_offer: string
  suggested_offer_ar: string
  first_actions: string[]
  first_actions_ar: string[]
  seven_day_checklist: string[]
  seven_day_checklist_ar: string[]
  risks: string[]
  risks_ar: string[]
  resources_needed: {
    people: string
    people_ar: string
    tools: string
    tools_ar: string
    complexity: "Low" | "Medium" | "High"
  }
  generated_by: "algorithm" | "ai" | "template"
  last_generated_at: string
  common_phrases: string[]
  sample_responses: {
    id: string
    title: string
    description: string | null
    area: string
    urgency: number
  }[]
}

export interface OpportunityCluster {
  cluster_key: string
  category: CategoryValue
  matched_response_ids: string[]
  responses: SurveyResponse[]
}
