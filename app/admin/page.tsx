import { redirect } from "next/navigation";
import { getAdminDashboardData } from "@/actions/admin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { auth } from "@/lib/auth";

export default async function AdminPage() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    redirect("/");
  }

  const initialData = await getAdminDashboardData();

  return <AdminDashboard initialData={initialData} />;
}
