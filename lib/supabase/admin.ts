import "server-only"
import { createClient } from "@supabase/supabase-js"

/**
 * Server-only Supabase client using the service role key.
 * Used for reading aggregated, anonymized survey data and for admin actions.
 * NEVER import this into a client component.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
