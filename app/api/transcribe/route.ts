import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { transcribeAudio } from "@/lib/audio";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  try { const file = (await request.formData()).get("audio"); if (!(file instanceof File)) throw new Error("An audio file is required."); return NextResponse.json({ transcript: await transcribeAudio(file) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Transcription failed." }, { status: 400 }); }
}
