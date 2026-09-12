import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentAppUser } from "@/lib/users";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") || "/";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";
  const redirectUrl = new URL(next, requestUrl.origin);

  if (!code) {
    redirectUrl.searchParams.set("account", "signin-failed");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;

    const appUser = await getCurrentAppUser();
    if (!appUser) {
      await supabase.auth.signOut();
      redirectUrl.searchParams.set("account", "not-authorized");
    }
  } catch (error) {
    console.error("Account sign-in failed", error);
    redirectUrl.searchParams.set("account", "signin-failed");
  }

  return NextResponse.redirect(redirectUrl);
}
