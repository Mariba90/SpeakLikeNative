import { getOpenAI } from "@/lib/openai";
import { MODELS } from "@/lib/models";

/**
 * Safari often reports MediaRecorder output as `audio/mp4;codecs=mp4a.40.2`
 * (and older iOS releases sometimes omit the MIME type entirely). Compare the
 * media type without parameters and use the filename as a narrow fallback for
 * those browser-generated files.
 */
const supportedMediaTypes = new Set([
  "audio/webm", "audio/mp4", "audio/mpeg", "audio/mp3", "audio/wav",
  "audio/ogg", "audio/x-m4a", "audio/aac", "video/mp4",
]);
const supportedExtensions = new Set(["webm", "mp4", "m4a", "mp3", "mpeg", "wav", "ogg", "aac"]);
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

export function validateAudio(file: File) {
  if (!file.size) throw new Error("The audio file is empty.");
  if (file.size > MAX_AUDIO_BYTES) throw new Error("Please keep recordings under 10 MB.");
  const mediaType = file.type.toLowerCase().split(";", 1)[0].trim();
  const extension = file.name.toLowerCase().split(".").pop() || "";
  if (!supportedMediaTypes.has(mediaType) && !(mediaType === "" && supportedExtensions.has(extension))) {
    throw new Error("Please record in the app or upload a WebM, MP4, MP3, WAV, M4A, or OGG recording.");
  }
}

export async function transcribeAudio(file: File) {
  validateAudio(file);
  const result = await getOpenAI().audio.transcriptions.create({ file, model: MODELS.transcription, language: "en" } as never);
  if (!result.text?.trim()) throw new Error("We couldn't detect spoken English in that recording. Please try again in a quieter place.");
  return result.text.trim();
}