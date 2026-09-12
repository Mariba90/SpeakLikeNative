import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv, getSupabaseServiceRoleKey } from "@/lib/supabase/env";

// The browser has no direct table access; this server-only boundary is typed by
// the narrow records declared in lib/users.ts and lib/usage.ts.
let client: SupabaseClient<any> | undefined;

/** Server-only database client. Never import this module into a Client Component. */
export function getSupabaseAdminClient() {
  if (!client) {
    const { url } = getSupabasePublicEnv();
    client = createClient<any>(url, getSupabaseServiceRoleKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return client;
}
