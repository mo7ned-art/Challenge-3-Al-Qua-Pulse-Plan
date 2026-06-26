import Link from "next/link"
import { listResponses } from "@/lib/store/responses"
import { computeOpportunities } from "@/lib/scoring/opportunities"
import { computeKpis, dataMode } from "@/lib/scoring/dashboard"
import { EvidenceClient } from "@/components/evidence/EvidenceClient"

export const dynamic = "force-dynamic"

export default async function EvidencePage() {
  const responses = await listResponses()
  const kpis = computeKpis(responses, "en")
  const opportunities = computeOpportunities(responses)
  const top = opportunities[0]
  const mode = dataMode(responses)

  return <EvidenceClient kpis={kpis} topOpportunity={top ? { title: top.title, score: top.opportunity_score, confidence: top.confidence_level, response_count: top.response_count } : null} mode={mode} />
}
