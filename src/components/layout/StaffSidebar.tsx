"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, ShoppingCart, LogOut, Zap, UserCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/staff/inventory", label: "Inventory", icon: Package },
  { href: "/staff/orders",    label: "My Orders",  icon: ShoppingCart },
];

export default function StaffSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, clearUser } = useAuthStore();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
    router.push("/login");
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-slate-700/60 bg-slate-900/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-700/50">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 glow-accent">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-gradient">InvenTrack</span>
          <div className="flex items-center gap-1 mt-0.5">
            <UserCircle className="h-2.5 w-2.5 text-sky-400" />
            <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">Staff</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn(active ? "nav-link-active" : "nav-link")}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            System
          </p>
          <Link
            href="/staff/settings/profile"
            className={cn(pathname.startsWith("/staff/settings") ? "nav-link-active" : "nav-link")}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
            {pathname.startsWith("/staff/settings") && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400" />}
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-700/50 p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600/30 text-sm font-semibold text-sky-300">
            {user?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "S"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-200">
              {user?.full_name ?? "Staff"}
            </p>
            <p className="truncate text-[11px] text-sky-500">Staff Member</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-700 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
