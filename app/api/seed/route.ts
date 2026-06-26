import { NextResponse } from "next/server"
import { seedDemoData } from "@/lib/store/responses"

export async function POST() {
  const result = await seedDemoData()
  return NextResponse.json(result)
}

export async function GET() {
  const result = await seedDemoData()
  return NextResponse.json(result)
}
