import { AppClient } from "@/components/app-client";
import { isAuthenticated } from "@/lib/auth";

export default async function Page() {
  return <AppClient initialAuthenticated={await isAuthenticated()} />;
}