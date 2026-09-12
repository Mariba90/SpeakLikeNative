import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AppUser = {
  id: string;
  email: string;
  role: "admin" | "member";
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function getCurrentAppUser(): Promise<AppUser | null> {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) return null;
  if (!user?.email) return null;

  const email = normalizeEmail(user.email);
  const { data, error } = await getSupabaseAdminClient()
    .from("authorized_emails")
    .select("role")
    .eq("email", email)
    .maybeSingle();

  if (error) throw new Error(`Could not check account authorization: ${error.message}`);
  if (!data) return null;

  return { id: user.id, email, role: data.role === "admin" ? "admin" : "member" };
}

export async function requireCurrentAppUser() {
  const user = await getCurrentAppUser();
  if (!user) throw new Error("Your account is not authorized to use Speak Like a Native.");
  return user;
}

export async function requireAdminUser() {
  const user = await requireCurrentAppUser();
  if (user.role !== "admin") throw new Error("This page is available to administrators only.");
  return user;
}
