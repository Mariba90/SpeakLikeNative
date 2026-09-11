import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { transcribeAudio } from "@/lib/audio";
import { getOpenAI } from "@/lib/openai";
import { MODELS } from "@/lib/models";
import { coachingInstructions, feedbackSchema } from "@/lib/prompts";
import type { Feedback } from "@/types/feedback";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  try {
    const file = (await request.formData()).get("audio");
    if (!(file instanceof File)) throw new Error("An audio file is required.");
    const transcript = await transcribeAudio(file);
    const response = await getOpenAI().responses.create({
      model: MODELS.coaching,
      instructions: coachingInstructions,
      input: `Transcript:\n${transcript}\n\nReturn feedback only for this transcript. No pronunciation claims without reliable acoustic evidence; return an empty pronunciationNotes array.`,
      text: { format: { type: "json_schema", name: "english_speaking_feedback", strict: true, schema: feedbackSchema } },
    } as never);
    if (!response.output_text) throw new Error("The coaching response was empty. Please try again.");
    const feedback = JSON.parse(response.output_text) as Omit<Feedback, "transcript">;
    return NextResponse.json({ transcript, ...feedback } satisfies Feedback);
  } catch (error) {
    console.error("Analysis failed", error);
    const message = error instanceof Error ? error.message : "We couldn't analyze that recording. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
