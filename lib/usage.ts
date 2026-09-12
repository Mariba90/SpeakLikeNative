import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type UsageEvent = {
  userId: string;
  userEmail: string;
  requestType: "transcription" | "coaching";
  model: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  cachedInputTokens?: number | null;
  audioSeconds?: number | null;
  estimatedCostUsd?: number | null;
  latencyMs?: number | null;
  status: "succeeded" | "failed";
  metadata?: Record<string, unknown>;
};

type UsageRow = {
  id: string;
  user_email: string;
  request_type: "transcription" | "coaching";
  model: string;
  input_tokens: number | null;
  output_tokens: number | null;
  audio_seconds: number | null;
  estimated_cost_usd: number | null;
  latency_ms: number | null;
  status: "succeeded" | "failed";
  created_at: string;
};

export type UsageDashboard = {
  totals: { cost: number; requests: number; audioSeconds: number; averageLatencyMs: number };
  byModel: Array<{ model: string; requests: number; cost: number; inputTokens: number; outputTokens: number }>;
  recent: UsageRow[];
};

/** Logging must never make a learner lose an otherwise successful result. */
export async function recordUsage(event: UsageEvent) {
  try {
    const { error } = await getSupabaseAdminClient().from("usage_events").insert({
      user_id: event.userId,
      user_email: event.userEmail,
      request_type: event.requestType,
      model: event.model,
      input_tokens: event.inputTokens ?? null,
      output_tokens: event.outputTokens ?? null,
      cached_input_tokens: event.cachedInputTokens ?? null,
      audio_seconds: event.audioSeconds ?? null,
      estimated_cost_usd: event.estimatedCostUsd ?? null,
      latency_ms: event.latencyMs ?? null,
      status: event.status,
      metadata: event.metadata ?? {},
    });
    if (error) console.error("Usage logging failed", error.message);
  } catch (error) {
    console.error("Usage logging failed", error);
  }
}

export async function getUsageDashboard(): Promise<UsageDashboard> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await getSupabaseAdminClient()
    .from("usage_events")
    .select("id,user_email,request_type,model,input_tokens,output_tokens,audio_seconds,estimated_cost_usd,latency_ms,status,created_at")
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load usage dashboard: ${error.message}`);
  const rows = (data ?? []) as UsageRow[];
  const cost = rows.reduce((sum, row) => sum + Number(row.estimated_cost_usd ?? 0), 0);
  const audioSeconds = rows.reduce((sum, row) => sum + Number(row.audio_seconds ?? 0), 0);
  const latencyRows = rows.filter((row) => row.latency_ms != null);
  const averageLatencyMs = latencyRows.length ? Math.round(latencyRows.reduce((sum, row) => sum + Number(row.latency_ms), 0) / latencyRows.length) : 0;
  const models = new Map<string, { model: string; requests: number; cost: number; inputTokens: number; outputTokens: number }>();
  for (const row of rows) {
    const current = models.get(row.model) ?? { model: row.model, requests: 0, cost: 0, inputTokens: 0, outputTokens: 0 };
    current.requests += 1;
    current.cost += Number(row.estimated_cost_usd ?? 0);
    current.inputTokens += Number(row.input_tokens ?? 0);
    current.outputTokens += Number(row.output_tokens ?? 0);
    models.set(row.model, current);
  }

  return {
    totals: { cost, requests: rows.length, audioSeconds, averageLatencyMs },
    byModel: [...models.values()].sort((a, b) => b.cost - a.cost),
    recent: rows.slice(0, 20),
  };
}

export async function listAuthorizedEmails() {
  const { data, error } = await getSupabaseAdminClient()
    .from("authorized_emails")
    .select("email,role,created_at")
    .order("email", { ascending: true });
  if (error) throw new Error(`Could not load authorized emails: ${error.message}`);
  return (data ?? []) as Array<{ email: string; role: "admin" | "member"; created_at: string }>;
}
