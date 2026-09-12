import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/users";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  try {
    await requireAdminUser();
    const body = await request.json();
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const role = body.role === "admin" ? "admin" : "member";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const { error } = await getSupabaseAdminClient().from("authorized_emails").upsert({ email, role }, { onConflict: "email" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not authorize that email.";
    return NextResponse.json({ error: message }, { status: message.includes("administrators") ? 403 : 500 });
  }
}
