// Founder brief generator with AI + deterministic fallback.
// Falls back automatically when AI_API_KEY is not set or the call fails.

import type { Opportunity } from "../types"

export interface FounderBrief {
  idea: string
  target_customers: string
  first_actions: string[]
  validation_questions: string[]
  risks: string[]
  success_metrics: string[]
  source: "ai" | "template"
}

export function generateFallbackBrief(opp: Opportunity): FounderBrief {
  return {
    idea: `${opp.title} — ${opp.suggested_offer}`,
    target_customers: opp.target_customer,
    first_actions: opp.first_actions,
    validation_questions: [
      `Are the ${opp.response_count} matching respondents representative of a wider market?`,
      "What is the average monthly spend on this need today, and how often is it unmet?",
      "Which 2–3 competitors or existing providers are most likely to react to a new entrant?",
      "What is the minimum volume per month to make this profitable at the observed willingness-to-pay?",
    ],
    risks: opp.risks,
    success_metrics: [
      `Sign up ${Math.max(5, Math.ceil(opp.response_count * 0.4))} pilot customers in 30 days.`,
      "Achieve 60% repeat usage or subscription renewal after the first month.",
      "Reach break-even on direct costs within 60 days of launch.",
    ],
    source: "template",
  }
}

export async function generateFounderBrief(
  opp: Opportunity,
): Promise<FounderBrief> {
  const apiKey = process.env.AI_API_KEY
  const baseUrl = process.env.AI_BASE_URL
  const model = process.env.AI_MODEL ?? "gpt-4o-mini"

  if (!apiKey) {
    return generateFallbackBrief(opp)
  }

  // Build an aggregated, anonymized prompt — never include contact info.
  const prompt = `You are a startup advisor helping a first-time entrepreneur in Al Qua'a (rural UAE) evaluate a community-validated business idea.

Aggregated opportunity data (anonymized, no personal info):
- Title: ${opp.title}
- Category: ${opp.category}
- Score: ${opp.opportunity_score}/100
- Confidence: ${opp.confidence_level}
- Matching responses: ${opp.response_count}
- Average urgency (1-5): ${opp.average_urgency}
- Provider gap (no local provider): ${Math.round(opp.provider_gap_rate * 100)}%
- Recurring demand: ${Math.round(opp.recurring_rate * 100)}%
- Pay signal (avg willingness-to-pay weight): ${opp.pay_signal_rate.toFixed(2)}
- Top area: ${opp.top_area ?? "n/a"}
- Common phrases: ${opp.common_phrases.join(", ") || "n/a"}

Existing context:
- Target customer: ${opp.target_customer}
- Suggested offer: ${opp.suggested_offer}

Return STRICT JSON with this exact shape:
{
  "idea": "string (one sentence)",
  "target_customers": "string (one paragraph)",
  "first_actions": ["string", "string", "string"],
  "validation_questions": ["string", "string", "string", "string"],
  "risks": ["string", "string", "string"],
  "success_metrics": ["string", "string", "string"]
}

Be specific, practical, and grounded in rural UAE context. No emojis.`

  try {
    const res = await fetch(`${baseUrl ?? "https://api.openai.com"}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You respond with strict JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    })
    if (!res.ok) throw new Error(`AI ${res.status}`)
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) throw new Error("Empty AI response")
    const parsed = JSON.parse(content)
    return {
      idea: String(parsed.idea ?? ""),
      target_customers: String(parsed.target_customers ?? ""),
      first_actions: Array.isArray(parsed.first_actions) ? parsed.first_actions.map(String) : [],
      validation_questions: Array.isArray(parsed.validation_questions)
        ? parsed.validation_questions.map(String)
        : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
      success_metrics: Array.isArray(parsed.success_metrics) ? parsed.success_metrics.map(String) : [],
      source: "ai",
    }
  } catch (e) {
    console.error("[brief] AI call failed, using fallback:", e)
    return generateFallbackBrief(opp)
  }
}
