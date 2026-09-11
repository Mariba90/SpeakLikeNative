import { getOpenAI } from "@/lib/openai";
import { MODELS } from "@/lib/models";

const supported = new Set(["audio/webm", "audio/mp4", "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/x-m4a"]);
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

export function validateAudio(file: File) {
  if (!file.size) throw new Error("The audio file is empty.");
  if (file.size > MAX_AUDIO_BYTES) throw new Error("Please keep recordings under 10 MB.");
  if (!supported.has(file.type)) throw new Error("Please upload a WebM, MP4, MP3, WAV, M4A, or OGG recording.");
}

export async function transcribeAudio(file: File) {
  validateAudio(file);
  const result = await getOpenAI().audio.transcriptions.create({ file, model: MODELS.transcription, language: "en" } as never);
  if (!result.text?.trim()) throw new Error("We couldn't detect spoken English in that recording. Please try again in a quieter place.");
  return result.text.trim();
}
