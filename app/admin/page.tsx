import { notFound, redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { isAuthenticated } from "@/lib/auth";
import { getUsageDashboard, listAuthorizedEmails } from "@/lib/usage";
import { requireAdminUser } from "@/lib/users";

export default async function AdminPage() {
  if (!(await isAuthenticated())) redirect("/");

  let admin;
  try {
    admin = await requireAdminUser();
  } catch {
    notFound();
  }

  const [dashboard, authorizedEmails] = await Promise.all([getUsageDashboard(), listAuthorizedEmails()]);
  return <AdminDashboard dashboard={dashboard} authorizedEmails={authorizedEmails} adminEmail={admin.email} />;
}
