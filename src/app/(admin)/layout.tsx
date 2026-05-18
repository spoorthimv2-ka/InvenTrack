import { requireAdmin } from "@/lib/auth/getUserRole";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Header from "@/components/layout/Header";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side guard: non-admins are redirected before rendering anything
  await requireAdmin();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 animate-in">
          {children}
        </main>
      </div>
    </div>
  );
}
