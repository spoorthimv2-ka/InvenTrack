import { getUserRole } from "@/lib/auth/getUserRole";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Root page: detect role and send to correct dashboard
export default async function HomePage() {
  try {
    const { role } = await getUserRole();
    redirect(role === "admin" ? "/admin/inventory" : "/staff/inventory");
  } catch {
    redirect("/login");
  }
}
