import { NextResponse } from "next/server"
import { listResponses } from "@/lib/store/responses"
import { findOpportunity } from "@/lib/scoring/opportunities"
import { generateFounderBrief } from "@/lib/scoring/brief"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const id = String(body?.id ?? "")
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 })
    const responses = await listResponses()
    const opp = findOpportunity(responses, id)
    if (!opp) return NextResponse.json({ error: "not_found" }, { status: 404 })
    const brief = await generateFounderBrief(opp)
    return NextResponse.json({ brief, opportunity: opp })
  } catch (e) {
    console.error("[api/insights]", e)
    return NextResponse.json({ error: "server" }, { status: 500 })
  }
}
