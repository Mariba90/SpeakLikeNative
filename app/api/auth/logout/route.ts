import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (error) {
    // Still clear the local gate cookie if Supabase has a temporary outage.
    console.error("Supabase sign-out failed", error);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
