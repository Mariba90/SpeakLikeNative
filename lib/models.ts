/** Centralized model choices make cost/quality changes a one-line configuration update. */
export const MODELS = {
  transcription: process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe",
  coaching: process.env.OPENAI_COACHING_MODEL || "gpt-5-mini",
} as const;
