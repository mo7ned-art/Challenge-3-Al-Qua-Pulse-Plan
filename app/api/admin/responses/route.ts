import { NextResponse } from "next/server"
import { listResponses, softDeleteResponse } from "@/lib/store/responses"
import { isAdminAuthorized } from "@/lib/admin/auth"

export async function GET(req: Request) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const responses = await listResponses()
  return NextResponse.json({ responses })
}

export async function DELETE(req: Request) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 })
  const ok = await softDeleteResponse(id)
  return NextResponse.json({ ok })
}
