"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowserClient() {
  if (!client) {
    const { url, anonKey } = getSupabasePublicEnv();
    client = createBrowserClient(url, anonKey);
  }

  return client;
}
