import { NextResponse } from "next/server";
import { isValidPassword, sessionCookie, SESSION_COOKIE, sessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !isValidPassword(password)) return NextResponse.json({ error: "That password isn't right. Please try again." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, sessionToken(), sessionCookie);
  return response;
}
