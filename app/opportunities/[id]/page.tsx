import { OpportunityDetailClient } from "@/components/opportunities/OpportunityDetailClient"

export const dynamic = "force-dynamic"

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const decoded = decodeURIComponent(id)
  return <OpportunityDetailClient id={decoded} />
}
