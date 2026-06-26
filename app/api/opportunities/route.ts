import { NextResponse } from "next/server"
import { listResponses } from "@/lib/store/responses"
import { computeOpportunities } from "@/lib/scoring/opportunities"

export async function GET() {
  const responses = await listResponses()
  const opportunities = computeOpportunities(responses)
  return NextResponse.json({ opportunities })
}
