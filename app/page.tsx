import { AccountLogin } from "@/components/account-login";
import { AppClient } from "@/components/app-client";
import { AuthGate } from "@/components/auth-gate";
import { isAuthenticated } from "@/lib/auth";
import { getCurrentAppUser } from "@/lib/users";

type PageProps = { searchParams: Promise<{ account?: string }> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  if (!(await isAuthenticated())) return <AuthGate />;

  try {
    const user = await getCurrentAppUser();
    if (user) return <AppClient user={user} />;
  } catch (error) {
    console.error("Supabase configuration check failed", error);
    return <AccountLogin configurationError="Account sign-in is not configured yet. Add all three Supabase environment variables, then redeploy." />;
  }

  const message = params.account === "not-authorized"
    ? "This email is not on the approved list yet. Ask an administrator to authorize it."
    : params.account === "signin-failed"
      ? "That sign-in link could not be verified. Please request a fresh one."
      : undefined;
  return <AccountLogin message={message} />;
}
