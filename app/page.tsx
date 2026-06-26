import { listResponses } from "@/lib/store/responses"
import { HomeClient } from "@/components/HomeClient"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const responses = await listResponses()
  return <HomeClient initialResponses={responses} />
}
