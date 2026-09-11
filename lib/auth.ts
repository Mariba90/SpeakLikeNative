import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "sln_session";
const MAX_AGE = 60 * 60 * 24 * 14;

function token() {
  const password = process.env.SITE_PASSWORD;
  if (!password) throw new Error("SITE_PASSWORD is not configured.");
  return createHmac("sha256", password).update("speak-like-native-session-v1").digest("hex");
}

export function isValidPassword(value: string) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(value); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAuthenticated() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return false;
  const expected = token(); const a = Buffer.from(value); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const sessionCookie = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: MAX_AGE };
export function sessionToken() { return token(); }
