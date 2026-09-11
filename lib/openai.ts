import OpenAI from "openai";

let client: OpenAI | undefined;
export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");
  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    // Required for regional OpenAI projects (for example, us.api.openai.com).
    // Omit it to retain the SDK's default API hostname.
    ...(process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : {}),
  });
  return client;
}