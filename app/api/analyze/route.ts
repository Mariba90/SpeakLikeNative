import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { transcribeAudio } from "@/lib/audio";
import { getOpenAI } from "@/lib/openai";
import { MODELS } from "@/lib/models";
import { coachingInstructions, feedbackSchema } from "@/lib/prompts";
import { estimateTextCostUsd, estimateTranscriptionCostUsd } from "@/lib/pricing";
import { recordUsage } from "@/lib/usage";
import { getCurrentAppUser, type AppUser } from "@/lib/users";
import type { Feedback } from "@/types/feedback";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Please enter the shared password again." }, { status: 401 });

  let user: AppUser | null = null;
  let activeRequest: "transcription" | "coaching" = "transcription";
  let activeModel = MODELS.transcription;
  let activeStartedAt = Date.now();

  try {
    user = await getCurrentAppUser();
    if (!user) return NextResponse.json({ error: "Please sign in with an authorized account." }, { status: 403 });

    const file = (await request.formData()).get("audio");
    if (!(file instanceof File)) throw new Error("An audio file is required.");

    activeStartedAt = Date.now();
    const { transcript, usage: transcriptionUsage } = await transcribeAudio(file);
    await recordUsage({
      userId: user.id,
      userEmail: user.email,
      requestType: "transcription",
      model: MODELS.transcription,
      inputTokens: transcriptionUsage.inputTokens,
      outputTokens: transcriptionUsage.outputTokens,
      audioSeconds: transcriptionUsage.seconds,
      estimatedCostUsd: estimateTranscriptionCostUsd(MODELS.transcription, transcriptionUsage),
      latencyMs: Date.now() - activeStartedAt,
      status: "succeeded",
      metadata: { bytes: file.size, mimeType: file.type },
    });

    activeRequest = "coaching";
    activeModel = MODELS.coaching;
    activeStartedAt = Date.now();
    const response = await getOpenAI().responses.create({
      model: MODELS.coaching,
      instructions: coachingInstructions,
      input: `Transcript:\n${transcript}\n\nReturn feedback only for this transcript. No pronunciation claims without reliable acoustic evidence; return an empty pronunciationNotes array.`,
      text: { format: { type: "json_schema", name: "english_speaking_feedback", strict: true, schema: feedbackSchema } },
    } as never);
    if (!response.output_text) throw new Error("The coaching response was empty. Please try again.");

    const feedback = JSON.parse(response.output_text) as Omit<Feedback, "transcript">;
    const usage = response.usage;
    await recordUsage({
      userId: user.id,
      userEmail: user.email,
      requestType: "coaching",
      model: MODELS.coaching,
      inputTokens: usage?.input_tokens,
      outputTokens: usage?.output_tokens,
      cachedInputTokens: usage?.input_tokens_details?.cached_tokens,
      estimatedCostUsd: estimateTextCostUsd(MODELS.coaching, {
        inputTokens: usage?.input_tokens,
        outputTokens: usage?.output_tokens,
        cachedInputTokens: usage?.input_tokens_details?.cached_tokens,
      }),
      latencyMs: Date.now() - activeStartedAt,
      status: "succeeded",
      metadata: { responseId: response.id },
    });

    return NextResponse.json({ transcript, ...feedback } satisfies Feedback);
  } catch (error) {
    console.error("Analysis failed", error);
    if (user) {
      await recordUsage({
        userId: user.id,
        userEmail: user.email,
        requestType: activeRequest,
        model: activeModel,
        latencyMs: Date.now() - activeStartedAt,
        status: "failed",
        metadata: { error: error instanceof Error ? error.message : "Unknown analysis failure" },
      });
    }
    const message = error instanceof Error ? error.message : "We couldn't analyze that recording. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
