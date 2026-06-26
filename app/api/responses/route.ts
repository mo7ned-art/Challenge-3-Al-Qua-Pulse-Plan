import { NextResponse } from "next/server"
import { createResponse, listResponses } from "@/lib/store/responses"
import { validate } from "@/lib/validate"

export async function GET() {
  const responses = await listResponses()
  // Public list never exposes contact info, even if the user opted in.
  const publicView = responses.map((r) => ({
    ...r,
    contact_name: null,
    contact_phone: null,
    contact_email: null,
  }))
  return NextResponse.json({ responses: publicView })
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>
    const result = validate(body, [
      { field: "language", required: true, isOneOf: ["en", "ar"] },
      { field: "respondent_type", required: true, minLength: 1, maxLength: 60 },
      { field: "area", required: true, minLength: 1, maxLength: 60 },
      { field: "category", required: true, minLength: 1, maxLength: 60 },
      { field: "need_title", required: true, minLength: 2, maxLength: 200 },
      { field: "need_description", maxLength: 2000 },
      { field: "urgency", required: true, min: 1, max: 5 },
      { field: "frequency", required: true, minLength: 1, maxLength: 40 },
      { field: "has_local_provider", required: true, isOneOf: ["yes", "no", "not_sure"] },
      { field: "willingness_to_pay_range", maxLength: 40 },
      { field: "contact_permission", required: true },
      { field: "contact_name", maxLength: 120 },
      { field: "contact_phone", maxLength: 60 },
      { field: "contact_email", isEmail: true, maxLength: 200 },
      { field: "extra_note", maxLength: 2000 },
    ] as const)

    if (!result.ok) {
      return NextResponse.json({ error: "invalid", issues: result.errors }, { status: 400 })
    }
    const data = result.data as Record<string, unknown>
    const contactPermission = Boolean(data.contact_permission)
    if (!contactPermission) {
      data.contact_name = null
      data.contact_phone = null
      data.contact_email = null
    }
    const created = await createResponse({
      language: data.language as "en" | "ar",
      respondent_type: String(data.respondent_type),
      area: String(data.area),
      category: String(data.category),
      need_title: String(data.need_title),
      need_description: (data.need_description as string | null) ?? undefined,
      urgency: Number(data.urgency),
      frequency: String(data.frequency),
      has_local_provider: data.has_local_provider as "yes" | "no" | "not_sure",
      willingness_to_pay_range: (data.willingness_to_pay_range as string | null) ?? undefined,
      contact_permission: contactPermission,
      contact_name: (data.contact_name as string | null) ?? undefined,
      contact_phone: (data.contact_phone as string | null) ?? undefined,
      contact_email: (data.contact_email as string | null) ?? undefined,
      extra_note: (data.extra_note as string | null) ?? undefined,
      source_type: "live",
      is_private: !contactPermission,
    })
    return NextResponse.json({ response: created })
  } catch (e) {
    console.error("[api/responses POST]", e)
    return NextResponse.json({ error: "server" }, { status: 500 })
  }
}
