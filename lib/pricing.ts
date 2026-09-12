type TokenUsage = { inputTokens?: number | null; outputTokens?: number | null; cachedInputTokens?: number | null };
type AudioUsage = { seconds?: number | null; inputTokens?: number | null; outputTokens?: number | null };

/**
 * Operational estimates only. Update these values when changing models or when
 * OpenAI publishes new pricing. Raw usage is stored separately for auditing.
 */
const PRICE_PER_MILLION_TOKENS: Record<string, { input: number; cachedInput?: number; output: number }> = {
  "gpt-5-mini": { input: 0.25, cachedInput: 0.025, output: 2 },
  "gpt-4o-mini-transcribe": { input: 1.25, output: 5 },
};

export function estimateTextCostUsd(model: string, usage: TokenUsage) {
  const price = PRICE_PER_MILLION_TOKENS[model];
  if (!price) return null;
  const cached = usage.cachedInputTokens ?? 0;
  const input = Math.max(0, (usage.inputTokens ?? 0) - cached);
  const output = usage.outputTokens ?? 0;
  return Number(((input * price.input + cached * (price.cachedInput ?? price.input) + output * price.output) / 1_000_000).toFixed(8));
}

export function estimateTranscriptionCostUsd(model: string, usage: AudioUsage) {
  if (usage.inputTokens || usage.outputTokens) return estimateTextCostUsd(model, usage);
  // Duration-only transcription responses do not contain enough information to price precisely.
  return null;
}
