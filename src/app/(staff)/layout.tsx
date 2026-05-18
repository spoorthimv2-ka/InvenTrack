import { requireAuth } from "@/lib/auth/getUserRole";
import { redirect } from "next/navigation";
import StaffSidebar from "@/components/layout/StaffSidebar";
import Header from "@/components/layout/Header";

export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  // Server-side guard: must be authenticated, admins get redirected to /admin
  const { role } = await requireAuth();
  if (role === "admin") redirect("/admin/inventory");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <StaffSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 animate-in">
          {children}
        </main>
      </div>
    </div>
  );
}
