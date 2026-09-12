import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { transcribeAudio } from "@/lib/audio";
import { MODELS } from "@/lib/models";
import { estimateTranscriptionCostUsd } from "@/lib/pricing";
import { recordUsage } from "@/lib/usage";
import { getCurrentAppUser, type AppUser } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Please enter the shared password again." }, { status: 401 });
  let user: AppUser | null = null;
  const startedAt = Date.now();
  try {
    user = await getCurrentAppUser();
    if (!user) return NextResponse.json({ error: "Please sign in with an authorized account." }, { status: 403 });
    const file = (await request.formData()).get("audio");
    if (!(file instanceof File)) throw new Error("An audio file is required.");
    const { transcript, usage } = await transcribeAudio(file);
    await recordUsage({
      userId: user.id,
      userEmail: user.email,
      requestType: "transcription",
      model: MODELS.transcription,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      audioSeconds: usage.seconds,
      estimatedCostUsd: estimateTranscriptionCostUsd(MODELS.transcription, usage),
      latencyMs: Date.now() - startedAt,
      status: "succeeded",
      metadata: { bytes: file.size, mimeType: file.type },
    });
    return NextResponse.json({ transcript });
  } catch (error) {
    if (user) await recordUsage({
      userId: user.id,
      userEmail: user.email,
      requestType: "transcription",
      model: MODELS.transcription,
      latencyMs: Date.now() - startedAt,
      status: "failed",
      metadata: { error: error instanceof Error ? error.message : "Unknown transcription failure" },
    });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Transcription failed." }, { status: 400 });
  }
}
